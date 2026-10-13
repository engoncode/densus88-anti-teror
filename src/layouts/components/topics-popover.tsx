import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import { useState, useCallback, useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import ButtonBase from '@mui/material/ButtonBase';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type TopicsPopoverProps = ButtonBaseProps & {
  data?: {
    id: number;
    name: string;
  }[];
  loading?: boolean;
};

export function TopicsPopover({ data = [], loading = false, sx, ...other }: TopicsPopoverProps) {
  const router = useRouter();

  // Initialize from localStorage
  const [selectedTopic, setSelectedTopic] = useState<(typeof data)[number] | null>(() => {
    const stored = localStorage.getItem('selected_topic');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  // Listen for external topic changes (e.g., from dashboard clicks)
  useEffect(() => {
    const handleTopicChange = (event: CustomEvent) => {
      const topic = event.detail;
      setSelectedTopic(topic);
    };

    window.addEventListener('selectedTopicChanged', handleTopicChange as EventListener);
    return () =>
      window.removeEventListener('selectedTopicChanged', handleTopicChange as EventListener);
  }, []);

  // Update selected topic when data changes
  useEffect(() => {
    if (data.length > 0) {
      // If no selected topic, set first one
      if (!selectedTopic) {
        const firstTopic = data[0];
        setSelectedTopic(firstTopic);
        localStorage.setItem('selected_topic', JSON.stringify(firstTopic));
        window.dispatchEvent(new CustomEvent('selectedTopicChanged', { detail: firstTopic }));
      } else {
        // Verify selected topic still exists in data
        const exists = data.find((t) => t.id === selectedTopic.id);
        if (!exists && data.length > 0) {
          const firstTopic = data[0];
          setSelectedTopic(firstTopic);
          localStorage.setItem('selected_topic', JSON.stringify(firstTopic));
          window.dispatchEvent(new CustomEvent('selectedTopicChanged', { detail: firstTopic }));
        }
      }
    }
  }, [data, selectedTopic]);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleSelectTopic = useCallback(
    (topic: (typeof data)[number]) => {
      setSelectedTopic(topic);
      handleClosePopover();

      // Save to localStorage
      localStorage.setItem('selected_topic', JSON.stringify(topic));

      // Dispatch event for other components to listen
      window.dispatchEvent(new CustomEvent('selectedTopicChanged', { detail: topic }));

      // Navigate to mentions page after topic selection
      router.push('/mentions');
    },
    [handleClosePopover, router]
  );

  const renderAvatar = (name: string) => (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        fontSize: '0.875rem',
        fontWeight: 'bold',
      }}
    >
      {name.charAt(0).toUpperCase()}
    </Box>
  );

  if (loading) {
    return (
      <Box
        sx={{
          pl: 2,
          py: 3,
          gap: 1.5,
          pr: 1.5,
          width: 1,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
          ...sx,
        }}
      >
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Loading topics...
        </Typography>
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box
        sx={{
          pl: 2,
          py: 3,
          gap: 1.5,
          pr: 1.5,
          width: 1,
          borderRadius: 1.5,
          textAlign: 'center',
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
          ...sx,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No topics available
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <ButtonBase
        disableRipple
        onClick={handleOpenPopover}
        sx={{
          pl: 2,
          py: 3,
          gap: 1.5,
          pr: 1.5,
          width: 1,
          borderRadius: 1.5,
          textAlign: 'left',
          justifyContent: 'flex-start',
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
          ...sx,
        }}
        {...other}
      >
        {renderAvatar(selectedTopic?.name || 'T')}

        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            typography: 'body2',
            fontWeight: 'fontWeightSemiBold',
            overflow: 'hidden',
          }}
        >
          <Box
            component="span"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {selectedTopic?.name || 'Select Topic'}
          </Box>
        </Box>

        <Iconify width={16} icon="carbon:chevron-sort" sx={{ color: 'text.disabled' }} />
      </ButtonBase>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 280,
            maxHeight: 400,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              p: 1.5,
              gap: 1.5,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: {
                bgcolor: 'action.selected',
                fontWeight: 'fontWeightSemiBold',
              },
            },
          }}
        >
          {data.map((topic) => (
            <MenuItem
              key={topic.id}
              selected={topic.id === selectedTopic?.id}
              onClick={() => handleSelectTopic(topic)}
            >
              {renderAvatar(topic.name)}

              <Box
                component="span"
                sx={{
                  flexGrow: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {topic.name}
              </Box>
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </>
  );
}
