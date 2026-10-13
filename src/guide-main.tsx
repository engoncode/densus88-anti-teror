import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './guide.css';

import { UserGuide } from './sections/user-guide/user-guide';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserGuide />
  </StrictMode>
);
