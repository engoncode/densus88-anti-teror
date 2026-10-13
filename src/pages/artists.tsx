// src/pages/artists.tsx
import { CONFIG } from 'src/config-global';

import { ArtistListView } from 'src/sections/artist/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Artists - ${CONFIG.appName}`}</title>

      <ArtistListView />
    </>
  );
}
