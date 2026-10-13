// src/pages/orders.tsx
import { CONFIG } from 'src/config-global';

import { OrderListView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Orders - ${CONFIG.appName}`}</title>

      <OrderListView />
    </>
  );
}
