import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useEffect, useState } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import { useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import ListSubheader from '@mui/material/ListSubheader';
import CircularProgress from '@mui/material/CircularProgress';

import { usePathname, useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';

import { useAuth } from 'src/contexts/AuthContext';
import apiClient from 'src/services/apiService';

import { NavUpgrade } from '../components/nav-upgrade';
import { LogoutButton } from '../components/logout-button';
import { WorkspacesPopover } from '../components/workspaces-popover';
import { TopicsPopover } from '../components/topics-popover';

import type { NavItem, NavGroup } from '../nav-config-dashboard';
import type { WorkspacesPopoverProps } from '../components/workspaces-popover';

// ----------------------------------------------------------------------

export type NavContentProps = {
  data: NavGroup[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  workspaces: WorkspacesPopoverProps['data'];
  sx?: SxProps<Theme>;
};

export function NavDesktop({
  sx,
  data,
  slots,
  workspaces,
  layoutQuery,
}: NavContentProps & { layoutQuery: Breakpoint }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 2.5,
        px: 2.5,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        borderRight: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...sx,
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
  workspaces,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: 'unset',
          width: 'var(--layout-nav-mobile-width)',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Drawer>
  );
}

// ----------------------------------------------------------------------

interface Topic {
  id: number;
  name: string;
}

const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export function NavContent({ data, slots, workspaces, sx }: NavContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  // Initialize topics from localStorage if available
  const [topics, setTopics] = useState<Topic[]>(() => {
    const cached = localStorage.getItem('cached_topics');
    return cached ? JSON.parse(cached) : [];
  });
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Track selected topic for analytics route menu
  const [selectedTopicPath, setSelectedTopicPath] = useState<string | null>(() => {
    const stored = localStorage.getItem('selected_topic');
    if (stored) {
      try {
        const topic = JSON.parse(stored);
        const slug = topic.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
        return `/topics/${topic.id}/${slug}`;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Listen for topic selection changes
  useEffect(() => {
    const handleTopicChange = (event: CustomEvent) => {
      const topic = event.detail;
      const slug = topic.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSelectedTopicPath(`/topics/${topic.id}/${slug}`);
    };

    window.addEventListener('selectedTopicChanged', handleTopicChange as EventListener);
    return () =>
      window.removeEventListener('selectedTopicChanged', handleTopicChange as EventListener);
  }, []);

  // Fetch topics from API
  useEffect(() => {
    const fetchTopics = async () => {
      // Check if user is authenticated before fetching
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
      if (!token) {
        console.log('No auth token found, skipping topics fetch');
        setTopics([]);
        return;
      }

      const workspaceId = localStorage.getItem('workspace_id');
      console.log('Fetching topics with workspace_id:', workspaceId);

      // Only show loading if no topics exist yet
      if (topics.length === 0) {
        setLoadingTopics(true);
      }

      try {
        const response = await apiClient.get<Topic[] | { data: Topic[] }>('/topics/my-topics');
        const topicsData = Array.isArray(response.data) ? response.data : response.data.data;
        console.log('Topics fetched successfully:', topicsData);
        setTopics(topicsData || []);
        // Cache topics to localStorage
        localStorage.setItem('cached_topics', JSON.stringify(topicsData || []));
      } catch (error: any) {
        console.error('Error fetching topics:', error);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        // If 404, endpoint might not exist - use empty array but don't clear cache
        // If 401, user not authenticated properly - auto logout
        if (error.response?.status === 401) {
          console.log('Unauthorized (401) - Auto logout');
          setTopics([]);
          localStorage.removeItem('cached_topics');
          // Auto logout user
          await logout();
        } else if (error.response?.status === 404) {
          console.log('Topics endpoint not found - might not have any topics yet');
          // Keep cached topics if available
        }
      } finally {
        setLoadingTopics(false);
      }
    };

    fetchTopics();

    // Listen for topics update event
    const handleTopicsUpdate = () => {
      fetchTopics();
    };
    window.addEventListener('topicsUpdated', handleTopicsUpdate);

    return () => {
      window.removeEventListener('topicsUpdated', handleTopicsUpdate);
    };
  }, []);

  return (
    <>
      <Logo />

      {slots?.topArea}

      {/* <WorkspacesPopover data={workspaces} sx={{ my: 2 }} /> */}

      <Scrollbar fillContent>
        <Box
          component="nav"
          sx={[
            {
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
              mt: 3,
              pb: 4,
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          {loadingTopics ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box
              component="ul"
              sx={{
                gap: 0.5,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {data.map((group, groupIndex) => (
                <Box key={group.subheader}>
                  <Box component="li" sx={{ listStyle: 'none' }}>
                    <ListSubheader
                      component="div"
                      sx={{
                        px: 2,
                        py: 1,
                        typography: 'overline',
                        fontSize: '0.625rem',
                        color: 'text.disabled',
                        bgcolor: 'transparent',
                        lineHeight: '1.2',
                      }}
                    >
                      {group.subheader}
                    </ListSubheader>

                    <Box
                      component="ul"
                      sx={{ gap: 0.25, display: 'flex', flexDirection: 'column' }}
                    >
                      {group.items.map((item) => {
                        // Use dynamic path for analytics route menu
                        const dynamicPath =
                          item.path === '/analytics' && selectedTopicPath
                            ? selectedTopicPath
                            : item.path;
                        const isActived =
                          dynamicPath === pathname ||
                          (item.path === '/analytics' && pathname.startsWith('/topics/'));

                        return (
                          <ListItem disableGutters disablePadding key={item.title}>
                            <ListItemButton
                              disableGutters
                              component={RouterLink}
                              href={dynamicPath}
                              sx={[
                                (theme) => ({
                                  pl: 2,
                                  py: 0.75,
                                  gap: 1.5,
                                  pr: 1.5,
                                  borderRadius: 0.75,
                                  typography: 'body2',
                                  fontSize: '0.8125rem',
                                  fontWeight: 'fontWeightMedium',
                                  color: theme.vars.palette.text.secondary,
                                  minHeight: 36,
                                  ...(isActived && {
                                    fontWeight: 'fontWeightSemiBold',
                                    color: theme.vars.palette.primary.main,
                                    bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                                    '&:hover': {
                                      bgcolor: varAlpha(
                                        theme.vars.palette.primary.mainChannel,
                                        0.16
                                      ),
                                    },
                                  }),
                                }),
                              ]}
                            >
                              <Box component="span" sx={{ width: 20, height: 20 }}>
                                {item.icon}
                              </Box>

                              <Box component="span" sx={{ flexGrow: 1 }}>
                                {item.title}
                                {item.caption && (
                                  <Box
                                    component="span"
                                    sx={{
                                      display: 'block',
                                      fontSize: '0.6875rem',
                                      lineHeight: 1.4,
                                      color: 'text.disabled',
                                      fontWeight: 'fontWeightRegular',
                                    }}
                                  >
                                    {item.caption}
                                  </Box>
                                )}
                              </Box>

                              {item.info && item.info}
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Insert Topics Popover after Overview group */}
                  {group.subheader === 'Overview' && (
                    <Box sx={{ mt: 2, mb: 1 }}>
                      <TopicsPopover data={topics} loading={loadingTopics} />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Scrollbar>

      <LogoutButton />

      <Box
        sx={{
          px: 2,
          py: 2,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'text.disabled',
            fontSize: '0.6875rem',
            lineHeight: 1.4,
            display: 'block',
          }}
        >
          Copyrights © 2026 Propam Polri. All rights reserved.
        </Typography>
      </Box>

      {slots?.bottomArea}

      {/* <NavUpgrade /> */}
    </>
  );
}
