import { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { InfluencerIdentification } from 'src/sections/influencers/influencer-identification';
import { FaXTwitter, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa6';

// ----------------------------------------------------------------------

type Platform = 'twitter' | 'facebook' | 'instagram' | 'tiktok';

const platforms: { value: Platform; label: string; icon: any; color: string }[] = [
  { value: 'twitter', label: 'Twitter', icon: FaXTwitter, color: '#1DA1F2' },
  { value: 'facebook', label: 'Facebook', icon: FaFacebook, color: '#1877F2' },
  { value: 'instagram', label: 'Instagram', icon: FaInstagram, color: '#E4405F' },
  { value: 'tiktok', label: 'TikTok', icon: FaTiktok, color: '#000000' },
];

interface InfluencerTabProps {
  topicId: number;
  type?: string; // topic type to determine default platform
}

export default function InfluencerTab({ topicId, type }: InfluencerTabProps) {
  // Determine initial platform based on topic type
  const getInitialPlatform = (): Platform => {
    if (type === 'facebook') return 'facebook';
    if (type === 'instagram') return 'instagram';
    if (type === 'tiktok' || type === 'tikTok') return 'tiktok';
    return 'twitter'; // default for 'tweet' type
  };

  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(getInitialPlatform());

  // Update platform when type changes
  useEffect(() => {
    setSelectedPlatform(getInitialPlatform());
  }, [type]);

  return (
    <Box>
      {/* Platform Selector */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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

      {/* Influencer Content */}
      <InfluencerIdentification topicId={topicId} platform={selectedPlatform} />
    </Box>
  );
}
