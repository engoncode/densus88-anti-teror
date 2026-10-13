import { CONFIG } from 'src/config-global';

import { PrivacyPolicyView } from 'src/sections/legal';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Privacy Policy - ${CONFIG.appName}`}</title>

      <PrivacyPolicyView />
    </>
  );
}
