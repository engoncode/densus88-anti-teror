// src/pages/galleries.tsx
import { CONFIG } from 'src/config-global';

import { GalleryListView } from 'src/sections/gallery/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Galleries - ${CONFIG.appName}`}</title>

      <GalleryListView />
    </>
  );
}
