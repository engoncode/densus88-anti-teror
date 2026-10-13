import { CONFIG } from 'src/config-global';

import { TermsOfServiceView } from 'src/sections/legal';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Terms of Service - ${CONFIG.appName}`}</title>

      <TermsOfServiceView />
    </>
  );
}
