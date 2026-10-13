import type { Breakpoint } from '@mui/material/styles';

import { merge } from 'es-toolkit';
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';

import { NavMobile, NavDesktop } from './nav';
import { layoutClasses } from '../core/classes';
import { _account } from '../nav-config-account';
import { dashboardLayoutVars } from './css-vars';
import { getFilteredNavData } from '../nav-config-dashboard';
import { MainSection } from '../core/main-section';
import { Searchbar } from '../components/searchbar';
import { _workspaces } from '../nav-config-workspace';
import { MenuButton } from '../components/menu-button';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';
import { AccountPopover } from '../components/account-popover';
import { LanguagePopover } from '../components/language-popover';
import { NotificationsPopover } from '../components/notifications-popover';
import { ThemeModeSwitcher } from 'src/components/theme-mode-switcher';
import FloatingChatButton from 'src/components/chat/floating-chat-button';
import { useAuth } from 'src/contexts/AuthContext';
import { usePropamScopeLabel } from 'src/sections/propam/hooks/use-propam-scope-label';
import { usePathname } from 'src/routes/hooks';

import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type DashboardLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
  };
};

export function DashboardLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'lg',
}: DashboardLayoutProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const { user } = useAuth();
  const propamScopeLabel = usePropamScopeLabel(user?.id);

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const [selectedTopic, setSelectedTopic] = useState<{ id: number; name: string } | null>(() => {
    const stored = localStorage.getItem('selected_topic');
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleTopicChange = (event: CustomEvent<{ id: number; name: string }>) => {
      setSelectedTopic(event.detail);
    };

    window.addEventListener('selectedTopicChanged', handleTopicChange as EventListener);
    return () =>
      window.removeEventListener('selectedTopicChanged', handleTopicChange as EventListener);
  }, []);

  const hasPageAssistant = pathname === '/analytics' || pathname.startsWith('/topics/');

  // Filter nav data based on user role
  const filteredNavData = getFilteredNavData(user?.role?.name).map((group) =>
    group.items.some((item) => item.path === '/densus88/radar')
      ? { ...group, subheader: propamScopeLabel }
      : group
  );

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: false,
      },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <>
          {/** @slot Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
          />
          <NavMobile
            data={filteredNavData}
            open={open}
            onClose={onClose}
            workspaces={_workspaces}
          />
        </>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>
          {/** @slot Searchbar */}
          <Searchbar />

          {/** @slot Theme mode switcher */}
          <ThemeModeSwitcher />

          {/** @slot Language popover */}
          {/* <LanguagePopover data={_langs} /> */}

          {/** @slot Notifications popover */}
          {/* <NotificationsPopover data={_notifications} /> */}

          {/** @slot Account drawer */}
          <AccountPopover data={_account} />
        </Box>
      ),
    };

    return (
      <HeaderSection
        disableElevation
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Sidebar
       *************************************** */
      sidebarSection={
        <NavDesktop data={filteredNavData} layoutQuery={layoutQuery} workspaces={_workspaces} />
      }
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ ...dashboardLayoutVars(theme), ...cssVars }}
      sx={[
        {
          [`& .${layoutClasses.sidebarContainer}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              pl: 'var(--layout-nav-vertical-width)',
              transition: theme.transitions.create(['padding-left'], {
                easing: 'var(--layout-transition-easing)',
                duration: 'var(--layout-transition-duration)',
              }),
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
      {!hasPageAssistant && (selectedTopic ? (
        <FloatingChatButton
          key={selectedTopic.id}
          topicId={selectedTopic.id}
          topicName={selectedTopic.name}
        />
      ) : (
        <button
          type="button"
          disabled
          aria-label="AI Assistant: pilih topik terlebih dahulu"
          title="Pilih topik terlebih dahulu untuk menggunakan AI Assistant"
          className="fixed right-[24px] bottom-[24px] z-[1000] flex h-[56px] w-[56px] cursor-not-allowed items-center justify-center rounded-full border-0 bg-muted text-fg-muted shadow-lg"
        >
          <MessageCircle size={24} strokeWidth={1.5} aria-hidden="true" />
        </button>
      ))}
    </LayoutSection>
  );
}
