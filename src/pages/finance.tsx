// src/pages/finance.tsx
import { CONFIG } from 'src/config-global';

import { FinanceView } from 'src/sections/finance/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Finance - ${CONFIG.appName}`}</title>

      <FinanceView />
    </>
  );
}
