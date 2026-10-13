// src/pages/exhibitions.tsx
import { CONFIG } from 'src/config-global';

import { ExhibitionListView } from 'src/sections/exhibition/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Exhibitions - ${CONFIG.appName}`}</title>

      <ExhibitionListView />
    </>
  );
}
