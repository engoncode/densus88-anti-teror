import { CONFIG } from 'src/config-global';

import { AnalystWorkspacesView } from 'src/sections/analyst-workspaces/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`My Workspaces - ${CONFIG.appName}`}</title>

      <AnalystWorkspacesView />
    </>
  );
}
