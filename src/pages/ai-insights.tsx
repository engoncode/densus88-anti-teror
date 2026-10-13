import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Container,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  Breadcrumbs,
  Link,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { Icon } from '@iconify/react';
import { Helmet } from 'react-helmet-async';
import { useRouter } from 'src/routes/hooks';
import { FaGlobe, FaLayerGroup } from 'react-icons/fa';
import { FaXTwitter, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa6';
import { AiInsightsHubView } from 'src/sections/ai-insights/ai-insights-hub-view';

// ----------------------------------------------------------------------

interface Topic {
  id: number;
  name: string;
}

type Platform = 'allplatform' | 'web' | 'tweet' | 'facebook' | 'instagram' | 'tiktok';

const platforms: { value: Platform; label: string; icon: any; color: string }[] = [
  { value: 'allplatform', label: 'Semua',     icon: FaLayerGroup, color: '#9c27b0' },
  { value: 'web',         label: 'Web',       icon: FaGlobe,      color: '#4caf50' },
  { value: 'tweet',       label: 'Twitter',   icon: FaXTwitter,   color: '#1DA1F2' },
  { value: 'facebook',    label: 'Facebook',  icon: FaFacebook,   color: '#1877F2' },
  { value: 'instagram',   label: 'Instagram', icon: FaInstagram,  color: '#E4405F' },
  { value: 'tiktok',      label: 'TikTok',    icon: FaTiktok,     color: '#000000' },
];

export default function AiInsightsPage() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [platform, setPlatform] = useState<Platform>('allplatform');

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
        <title>AI Insights Hub | Sentiment Analysis</title>
      </Helmet>

      <Container maxWidth="xl">
        <Box sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Icon icon="tabler:radar" width={28} />
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                  AI Insights Hub
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Ringkasan wawasan AI — sentimen, tren, keyword &amp; jaringan
              </Typography>
            </Box>
            <Breadcrumbs aria-label="breadcrumb">
              <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', cursor: 'pointer', fontSize: '0.75rem' }} href="/">
                <HomeIcon sx={{ mr: 0.3, fontSize: 14 }} />
                Home
              </Link>
              <Typography sx={{ display: 'flex', alignItems: 'center', color: 'text.primary', fontSize: '0.75rem' }}>
                AI Insights Hub
              </Typography>
            </Breadcrumbs>

            {selectedTopic && (
              <Alert severity="info" sx={{ py: 0.5, px: 1.5 }}>
                Topik: <strong>{selectedTopic.name}</strong>
              </Alert>
            )}
          </Box>

          {selectedTopic ? (
            <>
              {/* Platform selector */}
              <Card sx={{ mb: 2.5 }}>
                <CardContent sx={{ py: '10px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                      Platform:
                    </Typography>
                    <ToggleButtonGroup
                      value={platform}
                      exclusive
                      onChange={(_, v) => v && setPlatform(v)}
                      size="small"
                    >
                      {platforms.map((p) => {
                        const Icon = p.icon;
                        return (
                          <ToggleButton
                            key={p.value}
                            value={p.value}
                            sx={{ gap: 0.75, px: 1.5, py: 0.5, fontSize: 12 }}
                          >
                            <Icon
                              size={14}
                              style={{
                                color: platform === p.value ? p.color : theme.palette.text.disabled,
                              }}
                            />
                            {p.label}
                          </ToggleButton>
                        );
                      })}
                    </ToggleButtonGroup>
                  </Box>
                </CardContent>
              </Card>

              {/* Hub content */}
              <AiInsightsHubView topicId={selectedTopic.id} platform={platform} />
            </>
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
                    Belum Ada Topik Dipilih
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Pilih topik terlebih dahulu untuk melihat semua wawasan AI.
                  </Typography>
                  <Button variant="contained" onClick={() => router.push('/topics-settings')}>
                    Pilih Topik
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
