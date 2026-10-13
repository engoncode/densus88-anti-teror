import type { LinkProps } from '@mui/material/Link';

import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = true,
  ...other
}: LogoProps) {
  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="Logo Densus 88 Antiteror"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          gap: 1.5,
          alignItems: 'center',
          height: 48,
          ...(!isSingle && { height: 52 }),
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box
        component="img"
        src="/assets/logo/Densus_88_AT.png"
        alt="Densus 88 Antiteror"
        sx={{ height: '100%', width: 'auto', objectFit: 'contain' }}
      />
      <Typography
        variant="subtitle1"
        sx={{ color: 'text.primary', fontWeight: 800, lineHeight: 1.2, whiteSpace: 'nowrap' }}
      >
        DENSUS 88 ANTITEROR
      </Typography>
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
