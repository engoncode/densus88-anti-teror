import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { ProtectedRoute } from 'src/routes/components';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const UnauthorizedPage = lazy(() => import('src/pages/unauthorized'));
export const WorkspacesPage = lazy(() => import('src/pages/workspaces'));
export const AnalystWorkspacesPage = lazy(() => import('src/pages/analyst-workspaces'));
export const TopicsPage = lazy(() => import('src/pages/topics'));
export const PostsPage = lazy(() => import('src/pages/posts'));
export const ArtistVerificationPage = lazy(() => import('src/pages/artist-verification'));
export const ArtistsPage = lazy(() => import('src/pages/artists'));
export const ArtworksLapalapaPage = lazy(() => import('src/pages/artworks-lapalapa'));
export const GalleriesPage = lazy(() => import('src/pages/galleries'));
export const ExhibitionsPage = lazy(() => import('src/pages/exhibitions'));
export const OrdersPage = lazy(() => import('src/pages/orders'));
export const FinancePage = lazy(() => import('src/pages/finance'));
export const SettingsPage = lazy(() => import('src/pages/settings'));
export const ProfilePage = lazy(() => import('src/pages/profile'));
export const VouchersPage = lazy(() => import('src/pages/vouchers'));
export const UsersPage = lazy(() => import('src/pages/users'));
export const ReviewsPage = lazy(() => import('src/pages/reviews'));
export const CategoriesPage = lazy(() => import('src/pages/categories'));
export const ActivityLogsPage = lazy(() => import('src/pages/activity-logs'));
export const PaymentSimulatorPage = lazy(() => import('src/pages/payment-simulator'));
export const TopicsSettingsPage = lazy(() => import('src/pages/topics-settings'));
export const TrendingPage = lazy(() => import('src/pages/trending'));
export const SnaPage = lazy(() => import('src/pages/sna'));
export const CityAnalysisPage = lazy(() => import('src/pages/city-analysis'));
export const ConnectionPage = lazy(() => import('src/pages/connection'));
export const ViralPathPage = lazy(() => import('src/pages/viral-path'));
export const ViralPostsPage = lazy(() => import('src/pages/viral-posts'));
export const InfluencerPage = lazy(() => import('src/pages/influencer'));
export const ComparePage = lazy(() => import('src/pages/compare'));
export const ExportDataPage = lazy(() => import('src/pages/export-data'));
export const ChatAssistantPage = lazy(() => import('src/pages/chat-assistant'));
export const MentionsPage = lazy(() => import('src/pages/mentions'));
export const KeywordsPage = lazy(() => import('src/pages/keywords'));
export const AiInsightsPage = lazy(() => import('src/pages/ai-insights'));
export const DetectionPage = lazy(() => import('src/pages/detection'));
export const CreateUserPage = lazy(() => import('src/pages/create-user'));

// Propam / EWS Paminal
export const PropamRadarPage = lazy(() => import('src/pages/propam-radar'));
export const PropamDumasPage = lazy(() => import('src/pages/propam-dumas'));
export const PropamKategorisasiPage = lazy(() => import('src/pages/propam-kategorisasi'));
export const PropamEwsPage = lazy(() => import('src/pages/propam-ews'));
export const PropamRedZonePage = lazy(() => import('src/pages/propam-red-zone'));
export const PropamRingkasanPage = lazy(() => import('src/pages/propam-ringkasan'));
export const PropamSnaPage = lazy(() => import('src/pages/propam-sna'));
export const PropamIssuesPage = lazy(() => import('src/pages/propam-issues'));
export const PropamReportSettingsPage = lazy(() => import('src/pages/propam-report-settings'));
export const PropamAccessSettingsPage = lazy(() => import('src/pages/propam-access-settings'));
export const UserGuidePage = lazy(() => import('src/pages/user-guide'));

// Legal pages
export const TermsOfServicePage = lazy(() => import('src/pages/terms-of-service'));
export const PrivacyPolicyPage = lazy(() => import('src/pages/privacy-policy'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'workspaces', element: <WorkspacesPage /> },
      { path: 'analyst-workspaces', element: <AnalystWorkspacesPage /> },
      { path: 'analytics', element: <TopicsPage /> },
      { path: 'topics/:id/:slug', element: <TopicsPage /> },
      { path: 'topics/:id', element: <TopicsPage /> },
      { path: 'posts', element: <PostsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'activity-logs', element: <ActivityLogsPage /> },
      { path: 'panduan', element: <UserGuidePage /> },
      { path: 'topics-settings', element: <TopicsSettingsPage /> },
      { path: 'trending', element: <TrendingPage /> },
      { path: 'sna', element: <SnaPage /> },
      { path: 'city-analysis', element: <CityAnalysisPage /> },
      { path: 'connection', element: <ConnectionPage /> },
      { path: 'mentions', element: <MentionsPage /> },
      { path: 'viral-path', element: <ViralPathPage /> },
      { path: 'viral-posts', element: <ViralPostsPage /> },
      { path: 'influencer', element: <InfluencerPage /> },
      { path: 'compare', element: <ComparePage /> },
      { path: 'export-data', element: <ExportDataPage /> },
      { path: 'export', element: <ExportDataPage /> },
      { path: 'assistant', element: <ChatAssistantPage /> },
      { path: 'keywords', element: <KeywordsPage /> },
      { path: 'ai-insights', element: <AiInsightsPage /> },
      { path: 'detection', element: <DetectionPage /> },
      { path: 'create-user', element: <CreateUserPage /> },
      { path: 'propam/radar', element: <PropamRadarPage /> },
      { path: 'propam/dumas', element: <PropamDumasPage /> },
      { path: 'propam/kategorisasi', element: <PropamKategorisasiPage /> },
      { path: 'propam/ews', element: <PropamEwsPage /> },
      { path: 'propam/red-zone', element: <PropamRedZonePage /> },
      { path: 'propam/ringkasan', element: <PropamRingkasanPage /> },
      { path: 'propam/sna', element: <PropamSnaPage /> },
      { path: 'propam/issues', element: <PropamIssuesPage /> },
      { path: 'propam/report-settings', element: <PropamReportSettingsPage /> },
      {
        path: 'propam/access-settings',
        element: (
          <ProtectedRoute allowedRoles={['Operator']}>
            <PropamAccessSettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: 'terms-of-service',
    element: <TermsOfServicePage />,
  },
  {
    path: 'privacy-policy',
    element: <PrivacyPolicyPage />,
  },
  {
    path: 'unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
