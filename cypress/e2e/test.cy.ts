const API_URL = Cypress.env('BURGER_API_URL');

Cypress.on('uncaught:exception', () => false);

beforeEach(() => {
  window.localStorage.setItem('refreshToken', 'testRefreshToken');
  cy.setCookie('accessToken', 'testAccessToken');

  // ingredients
  cy.fixture('ingredients.json').then((ingredients) => {
    cy.intercept(
      {
        method: 'GET',
        url: `${API_URL}/ingredients`
      },
      ingredients
    ).as('getIngredients');
  });

  // feed
  cy.fixture('orders.json').then((orders) => {
    cy.intercept(
      {
        method: 'GET',
        url: `${API_URL}/orders/all`
      },
      orders
    ).as('getOrders');
  });

  // auth
  cy.fixture('user.json').then((user) => {
    cy.intercept(
      {
        method: 'GET',
        url: `${API_URL}/auth/user`
      },
      user
    ).as('getUser');
  });

  cy.visit('/');
  cy.wait('@getIngredients');
});

afterEach(() => {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
});

describe('Проверка работоспособности приложения', () => {
  const noBun1 = `[data-cy=no_bun_text_1]`;
  const noBun2 = `[data-cy=no_bun_text_2]`;
  const noIngredients = `[data-cy=no_ingredients_text]`;
  const bunSel = `[data-cy=bun_0]`;
  const ingredientSel = `[data-cy=ingredient_0]`;

  it('сервис должен быть доступен по адресу localhost:4000', () => {
    cy.url().should('include', 'localhost:4000');
  });

  it('есть возможность добавлять булку и ингридиенты с проверкой соответствия', () => {
    cy.get(noBun1).as('noBunText1');
    cy.get(noBun2).as('noBunText2');
    cy.get(noIngredients).as('noIngredientsText');
    cy.get(bunSel).as('bunElement');
    cy.get(ingredientSel).as('ingredientElement');

    // Проверяем пустоту перед добавлением
    cy.get('@noBunText1').contains('Выберите булки');
    cy.get('@noBunText2').contains('Выберите булки');
    cy.get('@noIngredientsText').contains('Выберите начинку');

    // Получаем данные ингредиента для проверки
    cy.get('@bunElement').then(($bun) => {
      const bunName = $bun.find('[data-cy=ingredient_name]').text();
      const bunPrice = $bun.find('[data-cy=ingredient_price]').text();

      // Добавляем булку
      cy.get('@bunElement').find('button').click();

      // Проверяем, что в конструкторе появилась именно эта булка
      cy.get('.constructor-element_pos_top').should('contain', bunName);
      cy.get('.constructor-element_pos_bottom').should('contain', bunName);
    });

    // Аналогично для ингредиента
    cy.get('@ingredientElement').then(($ingredient) => {
      const ingredientName = $ingredient.find('[data-cy=ingredient_name]').text();
      const ingredientPrice = $ingredient.find('[data-cy=ingredient_price]').text();

      // Добавляем ингредиент
      cy.get('@ingredientElement').find('button').first().click();

      // Проверяем, что в конструкторе появился именно этот ингредиент
      cy.get(`[data-cy=ingredient_element]`).should('contain', ingredientName);
    });
  });

  it('проверка открытия и закрытия модального окна ингридиента с проверкой деталей', () => {
    cy.get(ingredientSel).as('ingredientElement');

    cy.get('@ingredientElement').then(($ingredient) => {
      const ingredientName = $ingredient.find('[data-cy=ingredient_name]').text();
      const ingredientPrice = $ingredient.find('[data-cy=ingredient_price]').text();

      // Открываем модальное окно
      cy.get('@ingredientElement').first().click();

      // Проверяем, что модальное окно открылось с правильными данными
      cy.get(`[data-cy=ingredient_modal]`).should('be.visible');
      cy.get('.text_type_main-medium').should('contain', ingredientName);

      // Закрываем модальное окно
      cy.get(`[data-cy=close_modal_btn]`).click();
      cy.get(`[data-cy=ingredient_modal]`).should('not.exist');
    });
  });

  it('проверка нового заказа', () => {
    const bun = cy.get(bunSel + ` button`);
    const ingredient = cy.get(ingredientSel + ` button`);
    bun.click();
    ingredient.click({ multiple: true });

    cy.get(`[data-cy=new_order_total] button`).click();

    cy.fixture('newOrder.json').then((newOrder) => {
      cy.intercept(
        {
          method: 'POST',
          url: `${API_URL}/orders`
        },
        newOrder
      ).as('newOrder');

      cy.get(`[data-cy=new_order_number]`).contains(newOrder.order.number);
      cy.get(`[data-cy=close_modal_btn]`).click();

      cy.get(noBun1).as('noBunText1');
      cy.get(noBun2).as('noBunText2');
      cy.get(noIngredients).as('noIngredientsText');

      cy.get('@noBunText1').contains('Выберите булки');
      cy.get('@noBunText2').contains('Выберите булки');
      cy.get('@noIngredientsText').contains('Выберите начинку');
    });
  });
});
