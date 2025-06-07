import { FC, memo } from 'react';

import { OrdersListProps } from './type';
import { OrdersListUI } from '@ui';

export const OrdersList: FC<OrdersListProps> = memo(({ orders }) => {
  const orderByDate = [...orders].sort(
    (start, end) =>
      new Date(end.createdAt).getTime() - new Date(start.createdAt).getTime()
  );

  return <OrdersListUI orderByDate={orderByDate} />;
});
