import { CONFIG } from 'src/config-global';

import ReviewsView from 'src/sections/review/reviews-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Reviews - ${CONFIG.appName}`}</title>

      <ReviewsView />
    </>
  );
}
