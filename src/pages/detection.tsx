import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Container,
  Breadcrumbs,
  Link,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { Icon } from '@iconify/react';
import { Helmet } from 'react-helmet-async';
import { DetectionView } from 'src/sections/detection/detection-view';

// ----------------------------------------------------------------------

interface Topic {
  id: number;
  name: string;
}

export default function DetectionPage() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('selected_topic');
    if (stored) {
      try {
        setSelectedTopic(JSON.parse(stored));
      } catch {
        // ignore
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
        <title>Deteksi Ancaman | Sentiment Analysis</title>
      </Helmet>

      <Container maxWidth="xl">
        <Box sx={{ py: 3 }}>
          {/* Page Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Icon icon="solar:shield-warning-bold-duotone" width={28} />
                <Typography variant="h4" fontWeight={700}>
                  Deteksi Ancaman
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Identifikasi akun provokator &amp; konten berpotensi hoax
              </Typography>
            </Box>
            <Breadcrumbs aria-label="breadcrumb">
              <Link
                underline="hover"
                sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', cursor: 'pointer', fontSize: '0.75rem' }}
                href="/"
              >
                <HomeIcon sx={{ mr: 0.3, fontSize: 14 }} />
                Home
              </Link>
              <Typography sx={{ display: 'flex', alignItems: 'center', color: 'text.primary', fontSize: '0.75rem' }}>
                Deteksi Ancaman
              </Typography>
            </Breadcrumbs>
          </Box>

          {!selectedTopic ? (
            <Card>
              <CardContent>
                <Alert severity="warning">
                  Pilih topik terlebih dahulu dari menu <strong>Topics</strong> untuk melihat deteksi ancaman.
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                Menganalisis topik: <strong>{selectedTopic.name}</strong>
              </Alert>
              <DetectionView topicId={selectedTopic.id} />
            </>
          )}
        </Box>
      </Container>
    </>
  );
}
