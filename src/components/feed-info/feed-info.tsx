import { FC } from 'react';
import { useSelector } from 'react-redux';
import {
  selectOrders,
  selectOrdersCount
} from '../../slices/stellarBurgerSlice';

import { TOrder } from '@utils-types';
import { FeedInfoUI } from '@ui';

export const FeedInfo: FC = () => {
  const orders: TOrder[] = useSelector(selectOrders);
  const { total, totalToday } = useSelector(selectOrdersCount);
  const feed = { total, totalToday };

  const readyOrders = getOrders(orders, 'done');

  const pendingOrders = getOrders(orders, 'pending');

  return (
    <FeedInfoUI
      readyOrders={readyOrders}
      pendingOrders={pendingOrders}
      feed={feed}
    />
  );
};
