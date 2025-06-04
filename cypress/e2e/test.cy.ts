const API_URL = Cypress.env('BURGER_API_URL');

Cypress.on('uncaught:exception', () => {
  return false;
});

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
  });

  it('есть возможность добавлять булку и ингридиенты', () => {
    cy.get(noBun1).as('noBunText1');
    cy.get(noBun2).as('noBunText2');
    cy.get(noIngredients).as('noIngredientsText');
    cy.get(bunSel + ` button`).as('bun');
    cy.get(ingredientSel + ` button`).as('ingredient');

    // Проверяем пустоту перед добавлением
    cy.get('@noBunText1').contains('Выберите булки');
    cy.get('@noBunText2').contains('Выберите булки');
    cy.get('@noIngredientsText').contains('Выберите начинку');

    cy.get('@bun').click();
    cy.get('@ingredient').click({ multiple: true });

    cy.get(`[data-cy=constructor_section]`).contains('булка');
    cy.get(`[data-cy=ingredient_element]`);
  });

  it('проверка открытия и закрытия модального окна ингридиента', () => {
    const ingredient = cy.get(`bunSel`);
    ingredient.click();

    cy.get(`[data-cy=ingredient_modal]`);
    cy.get(`[data-cy=close_modal_btn]`).click();
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
