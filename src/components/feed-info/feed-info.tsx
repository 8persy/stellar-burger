import { FC } from 'react';
import {
  selectOrders,
  selectTodayOrders,
  selectTotalOrders
} from '../../slices/stellarBurgerSlice';
import { useAppSelector } from '../../services/store';
import { TOrder } from '@utils-types';
import { FeedInfoUI } from '@ui';

const ordersGet = (orders: TOrder[], status: string): number[] =>
  orders
    .filter((item) => item.status === status)
    .map((item) => item.number)
    .slice(0, 20);

export const FeedInfo: FC = () => {
  const orders: TOrder[] = useAppSelector(selectOrders);
  const total = useAppSelector(selectTotalOrders);
  const totalToday = useAppSelector(selectTodayOrders);

  const readyOrders = ordersGet(orders, 'done');

  const pendingOrders = ordersGet(orders, 'pending');

  return (
    <FeedInfoUI
      readyOrders={readyOrders}
      pendingOrders={pendingOrders}
      feed={{ total, totalToday }}
    />
  );
};
