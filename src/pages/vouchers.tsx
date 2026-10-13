// src/pages/vouchers.tsx
import { CONFIG } from 'src/config-global';

import { VouchersView } from 'src/sections/voucher/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Vouchers - ${CONFIG.appName}`}</title>

      <VouchersView />
    </>
  );
}
