import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Container,
  Button,
  Grid,
  InputLabel,
  Breadcrumbs,
  Link,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { Icon } from '@iconify/react';
import { Helmet } from 'react-helmet-async';
import { useRouter } from 'src/routes/hooks';
import { InfluencerIdentification } from 'src/sections/influencers/influencer-identification';
import { FaXTwitter, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa6';

// ----------------------------------------------------------------------

interface Topic {
  id: number;
  name: string;
}

type Platform = 'twitter' | 'facebook' | 'instagram' | 'tiktok';

const platforms: { value: Platform; label: string; icon: any; color: string }[] = [
  { value: 'twitter', label: 'Twitter', icon: FaXTwitter, color: '#1DA1F2' },
  { value: 'facebook', label: 'Facebook', icon: FaFacebook, color: '#1877F2' },
  { value: 'instagram', label: 'Instagram', icon: FaInstagram, color: '#E4405F' },
  { value: 'tiktok', label: 'TikTok', icon: FaTiktok, color: '#000000' },
];

export default function InfluencerPage() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('twitter');

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
        <title>KOL | Sentiment Analysis</title>
      </Helmet>

      <Container maxWidth="xl">
        <Box sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Icon icon="solar:crown-star-bold-duotone" width={28} />
                <Typography variant="h4" fontWeight={700}>
                  KOL
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Key Opinion Leaders &amp; influencer media sosial
              </Typography>
            </Box>
            <Breadcrumbs aria-label="breadcrumb">
              <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', cursor: 'pointer', fontSize: '0.75rem' }} href="/">
                <HomeIcon sx={{ mr: 0.3, fontSize: 14 }} />
                Home
              </Link>
              <Typography sx={{ display: 'flex', alignItems: 'center', color: 'text.primary', fontSize: '0.75rem' }}>
                KOL
              </Typography>
            </Breadcrumbs>
          </Box>

          {selectedTopic && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Analyzing topic: <strong>{selectedTopic.name}</strong>
            </Alert>
          )}

          {/* Platform Selection Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <InputLabel sx={{ mb: 1.5, fontSize: '0.875rem' }}>Select Platform</InputLabel>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {platforms.map((platform) => {
                      const Icon = platform.icon;
                      return (
                        <Button
                          key={platform.value}
                          variant={selectedPlatform === platform.value ? 'contained' : 'outlined'}
                          size="small"
                          startIcon={<Icon />}
                          onClick={() => setSelectedPlatform(platform.value)}
                          sx={{
                            ...(selectedPlatform === platform.value && {
                              bgcolor: platform.color,
                              color: 'white',
                              '&:hover': {
                                bgcolor: platform.color,
                                opacity: 0.9,
                              },
                            }),
                          }}
                        >
                          {platform.label}
                        </Button>
                      );
                    })}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Content */}
          {selectedTopic ? (
            <InfluencerIdentification topicId={selectedTopic.id} platform={selectedPlatform} />
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
                    Please select a topic from the sidebar to view Influencer data.
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
