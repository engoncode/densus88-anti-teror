import { CONFIG } from 'src/config-global';

import ActivityLogsView from 'src/sections/activity-log/activity-logs-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Activity Logs - ${CONFIG.appName}`}</title>

      <ActivityLogsView />
    </>
  );
}
