import { useState, useEffect } from 'react';
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Link,
  Typography,
  Alert,
  Container,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { Icon } from '@iconify/react';
import { Helmet } from 'react-helmet-async';
import { useRouter } from 'src/routes/hooks';
import { SocialViralPostsView } from 'src/sections/viral-posts/social-viral-posts-view';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa6';

// ----------------------------------------------------------------------

interface Topic {
  id: number;
  name: string;
}

const platforms = [
  { value: 'facebook' as const, label: 'Facebook', icon: FaFacebook, color: '#1877F2' },
  { value: 'instagram' as const, label: 'Instagram', icon: FaInstagram, color: '#E4405F' },
  { value: 'tiktok' as const, label: 'TikTok', icon: FaTiktok, color: '#010101' },
];

export default function ViralPostsPage() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'tiktok'>('facebook');

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
        <title>Viral Posts | Sentiment Analysis</title>
      </Helmet>

      <Container maxWidth="xl">
        <Box sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Icon icon="solar:fire-minimalistic-bold-duotone" width={28} />
                <Typography variant="h4" fontWeight={700}>
                  Viral Posts
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Postingan viral Facebook, Instagram &amp; TikTok
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
                Viral Posts
              </Typography>
            </Breadcrumbs>
          </Box>

          {selectedTopic && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Topik: <strong>{selectedTopic.name}</strong>
            </Alert>
          )}

          {selectedTopic ? (
            <>
              {/* Platform selector */}
              <Card sx={{ mb: 3 }}>
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
                        const PIcon = p.icon;
                        return (
                          <ToggleButton
                            key={p.value}
                            value={p.value}
                            sx={{
                              gap: 0.75,
                              px: 1.5,
                              py: 0.5,
                              fontSize: 12,
                              '&.Mui-selected': {
                                bgcolor: p.color,
                                color: 'white',
                                '&:hover': { bgcolor: p.color },
                              },
                            }}
                          >
                            <PIcon size={14} />
                            {p.label}
                          </ToggleButton>
                        );
                      })}
                    </ToggleButtonGroup>
                  </Box>
                </CardContent>
              </Card>

              <SocialViralPostsView topicId={selectedTopic.id} platform={platform} />
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
                    Pilih topik dari sidebar untuk melihat viral posts.
                  </Typography>
                  <Button variant="contained" onClick={() => router.push('/topics-settings')}>
                    Pengaturan Topik
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
