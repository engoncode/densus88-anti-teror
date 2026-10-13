import type { BoxProps } from '@mui/material/Box';

import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Dialog from '@mui/material/Dialog';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemButton from '@mui/material/ListItemButton';

import { Iconify } from 'src/components/iconify';
import { navData } from 'src/layouts/nav-config-dashboard';

// ----------------------------------------------------------------------

export function Searchbar({ sx, ...other }: BoxProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery('');
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
      handleClose();
    },
    [navigate, handleClose]
  );

  const allItems = useMemo(
    () => navData.flatMap((group) => group.items.map((item) => ({ ...item, group: group.subheader }))),
    []
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.caption?.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    );
  }, [query, allItems]);

  return (
    <>
      <IconButton onClick={handleOpen} sx={sx} {...(other as any)}>
        <Iconify icon="eva:search-fill" />
      </IconButton>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Cari menu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClose}>
                    <Iconify icon="eva:close-fill" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogTitle>

        <DialogContent sx={{ pt: 0, px: 1, pb: 2 }}>
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Tidak ada menu ditemukan
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filtered.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigate(item.path)}
                    sx={{ borderRadius: 1, mx: 1 }}
                  >
                    <Box sx={{ mr: 2, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                      {item.icon}
                    </Box>
                    <ListItemText
                      primary={item.title}
                      secondary={item.caption}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <Typography variant="caption" color="text.disabled" sx={{ ml: 1, flexShrink: 0 }}>
                      {item.group}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
