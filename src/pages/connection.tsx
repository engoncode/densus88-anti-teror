import { useState, useEffect } from 'react';
import { Box, Breadcrumbs, Card, CardContent, Link, Typography, Alert, Container, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { Icon } from '@iconify/react';
import { Helmet } from 'react-helmet-async';
import { useRouter } from 'src/routes/hooks';
import { ConnectionMappingView } from 'src/sections/connections/connection-mapping-view';

// ----------------------------------------------------------------------

interface Topic {
  id: number;
  name: string;
}

export default function ConnectionPage() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('selected_topic');
    if (stored) {
      try {
        setSelectedTopic(JSON.parse(stored));
      } catch (err) {
        console.error('Error parsing selected topic:', err);
      }
    }

    const handleTopicChange = (event: CustomEvent) => {
      setSelectedTopic(event.detail);
    };

    window.addEventListener('selectedTopicChanged', handleTopicChange as EventListener);
    return () =>
      window.removeEventListener('selectedTopicChanged', handleTopicChange as EventListener);
  }, []);

  return (
    <>
      <Helmet>
        <title>Relationship / Hubungan | Sentiment Analysis</title>
      </Helmet>

      <Container maxWidth="xl">
        <Box sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Icon icon="solar:users-group-two-rounded-bold-duotone" width={28} />
                <Typography variant="h4" fontWeight={700}>
                  Relationship / Hubungan
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Pemetaan koneksi antar akun Twitter
              </Typography>
            </Box>
            <Breadcrumbs aria-label="breadcrumb">
              <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', cursor: 'pointer', fontSize: '0.75rem' }} href="/">
                <HomeIcon sx={{ mr: 0.3, fontSize: 14 }} />
                Home
              </Link>
              <Typography sx={{ display: 'flex', alignItems: 'center', color: 'text.primary', fontSize: '0.75rem' }}>
                Relationship / Hubungan
              </Typography>
            </Breadcrumbs>
          </Box>

          {selectedTopic && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Analyzing topic: <strong>{selectedTopic.name}</strong>
            </Alert>
          )}

          {selectedTopic ? (
            <ConnectionMappingView topicId={selectedTopic.id} topicName={selectedTopic.name} />
          ) : (
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 10,
                    gap: 2,
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    No Topic Selected
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Please select a topic from the sidebar to view Connection Mapping.
                  </Typography>
                  <Button variant="contained" onClick={() => router.push('/topics-settings')}>
                    Go to Topics Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Container>
    </>
  );
}
