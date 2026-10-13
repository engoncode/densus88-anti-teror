import { Container, Typography } from '@mui/material';

export function PostsView() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Social Media Posts
      </Typography>
      <Typography color="text.secondary">
        Coming soon: View and manage social media posts from all networks
      </Typography>
    </Container>
  );
}
