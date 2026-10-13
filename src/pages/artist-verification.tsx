// src/pages/artist-verification.tsx
import { CONFIG } from 'src/config-global';

import { ArtistVerificationView } from 'src/sections/artist/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Artist Verification - ${CONFIG.appName}`}</title>

      <ArtistVerificationView />
    </>
  );
}
