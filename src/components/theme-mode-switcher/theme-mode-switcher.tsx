import { useColorScheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { Iconify } from 'src/components/iconify';

export function ThemeModeSwitcher() {
  const { mode, setMode } = useColorScheme();

  const handleToggle = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <IconButton onClick={handleToggle} color="default">
      {mode === 'light' ? (
        <Iconify icon="solar:moon-bold-duotone" width={24} />
      ) : (
        <Iconify icon="solar:sun-bold-duotone" width={24} />
      )}
    </IconButton>
  );
}
