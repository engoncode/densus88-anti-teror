// src/pages/artworks-lapalapa.tsx
import { CONFIG } from 'src/config-global';

import { ArtworkLapalapaView } from 'src/sections/artwork/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Artworks (LaPalapa) - ${CONFIG.appName}`}</title>

      <ArtworkLapalapaView />
    </>
  );
}
