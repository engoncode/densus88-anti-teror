import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './app';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './routes/components';
import { routesSection } from './routes/sections';

// ----------------------------------------------------------------------

const router = createBrowserRouter([
  {
    Component: () => (
      <App>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </App>
    ),
    errorElement: <ErrorBoundary />,
    children: routesSection,
  },
]);

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <GoogleOAuthProvider clientId="659813950400-0mghrqgsbdoqubtml1rldvuq40ncdnfu.apps.googleusercontent.com">
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
