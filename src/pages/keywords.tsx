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
import { FaGlobe } from 'react-icons/fa';
import { FaXTwitter, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa6';
import KeywordTab from 'src/components/topics/tabs/keyword-tab';

// ----------------------------------------------------------------------

interface Topic {
  id: number;
  name: string;
}

type Platform = 'web' | 'tweet' | 'facebook' | 'instagram' | 'tiktok';

const platforms: { value: Platform; label: string; icon: any; color: string }[] = [
  { value: 'web',       label: 'Web',       icon: FaGlobe,      color: '#4caf50' },
  { value: 'tweet',     label: 'Twitter',   icon: FaXTwitter,   color: '#1DA1F2' },
  { value: 'facebook',  label: 'Facebook',  icon: FaFacebook,   color: '#1877F2' },
  { value: 'instagram', label: 'Instagram', icon: FaInstagram,  color: '#E4405F' },
  { value: 'tiktok',    label: 'TikTok',    icon: FaTiktok,     color: '#000000' },
];

export default function KeywordsPage() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [platform, setPlatform] = useState<Platform>('web');

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
        <title>Keyword Analysis | Sentiment Analysis</title>
      </Helmet>

      <Container maxWidth="xl">
        <Box sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Icon icon="solar:hashtag-bold-duotone" width={28} />
                <Typography variant="h4" fontWeight={700}>
                  Keyword Analysis
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Analisis kata kunci topik per platform
              </Typography>
            </Box>
            <Breadcrumbs aria-label="breadcrumb">
              <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', cursor: 'pointer', fontSize: '0.75rem' }} href="/">
                <HomeIcon sx={{ mr: 0.3, fontSize: 14 }} />
                Home
              </Link>
              <Typography sx={{ display: 'flex', alignItems: 'center', color: 'text.primary', fontSize: '0.75rem' }}>
                Keyword Analysis
              </Typography>
            </Breadcrumbs>
          </Box>

          {selectedTopic && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Topik: <strong>{selectedTopic.name}</strong>
            </Alert>
          )}

          {selectedTopic ? (
            <>
              {/* Platform selector */}
              <Card sx={{ mb: 2 }}>
                <CardContent sx={{ py: '12px !important' }}>
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
                          <ToggleButton key={p.value} value={p.value} sx={{ gap: 0.75, px: 1.5, py: 0.5, fontSize: 12 }}>
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

              {/* Keyword content */}
              <Card>
                <CardContent>
                  <KeywordTab topicId={selectedTopic.id} network={platform} />
                </CardContent>
              </Card>
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
                    Pilih topik terlebih dahulu untuk melihat analisis keyword.
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
