import { useState } from 'react';
import { Box, Card, CardContent, Tab, Tabs, Typography } from '@mui/material';
import {
  Article as ArticleIcon,
  SentimentSatisfied as SentimentIcon,
  Key as KeyIcon,
  Place as PlaceIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  Share as ShareIcon,
  Whatshot as FlameIcon,
  AccountTree as BranchIcon,
} from '@mui/icons-material';

// Tab components
import ResumeTab from 'src/components/topics/tabs/resume-tab';
import SentimentTab from 'src/components/topics/tabs/sentiment-tab';
import KeywordTab from 'src/components/topics/tabs/keyword-tab';
import CityAnalysisTab from 'src/components/topics/tabs/city-analysis-tab';
import InfluencerTab from 'src/components/topics/tabs/influencer-tab';
import { TrendingView } from 'src/sections/trending/trending-view';
import { ViralPathView } from 'src/sections/viral-path/viral-path-view';
import { SocialViralPostsView } from 'src/sections/viral-posts/social-viral-posts-view';
import { SnaGraphView } from 'src/sections/sna/sna-graph-view';
import { ConnectionMappingView } from 'src/sections/connections/connection-mapping-view';
import { ArticleListView } from 'src/sections/articles/article-list-view';
import { ArticleModal } from 'src/components/modal/article-modal';

interface ResumeWebProps {
  id: number;
  type: string;
  startDate?: string;
  endDate?: string;
}

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactElement;
  component: React.ReactElement;
}

export default function ResumeWeb({ id, type, startDate, endDate }: ResumeWebProps) {
  const [activeTab, setActiveTab] = useState(0); // Default to first tab (Resume)
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [articleModalParams, setArticleModalParams] = useState<any>({});

  const getTabs = (): TabConfig[] => {
    const baseTabs: TabConfig[] = [
      {
        id: 'resume',
        label: 'Resume',
        icon: <ArticleIcon sx={{ fontSize: 18 }} />,
        component: <ResumeTab topicId={id} network={type} />,
      },
      {
        id: 'sentiment',
        label: 'Sentiment',
        icon: <SentimentIcon sx={{ fontSize: 18 }} />,
        component: <SentimentTab topicId={id} network={type} />,
      },
      {
        id: 'keyword',
        label: 'Keyword',
        icon: <KeyIcon sx={{ fontSize: 18 }} />,
        component: <KeywordTab topicId={id} network={type} />,
      },
    ];

    // Add City Analysis for web
    if (type === 'web') {
      baseTabs.push({
        id: 'city',
        label: 'City Analysis',
        icon: <PlaceIcon sx={{ fontSize: 18 }} />,
        component: (
          <CityAnalysisTab
            topicId={id}
            onViewPosts={(kota) => {
              setArticleModalParams({ kota, platform: 'web' });
              setArticleModalOpen(true);
            }}
          />
        ),
      });
    }

    // Add Twitter-specific tabs
    if (type === 'tweet') {
      baseTabs.push(
        {
          id: 'sna',
          label: 'SNA Graph',
          icon: <ShareIcon sx={{ fontSize: 18 }} />,
          component: <SnaGraphView topicId={id} />,
        },
        {
          id: 'influencer',
          label: 'Influencers',
          icon: <PeopleIcon sx={{ fontSize: 18 }} />,
          component: <InfluencerTab topicId={id} type={type} />,
        },
        {
          id: 'connections',
          label: 'Connections',
          icon: <BranchIcon sx={{ fontSize: 18 }} />,
          component: <ConnectionMappingView topicId={id} />,
        },
        {
          id: 'viral',
          label: 'Viral Paths',
          icon: <FlameIcon sx={{ fontSize: 18 }} />,
          component: <ViralPathView topicId={id} />,
        },
        {
          id: 'trending',
          label: 'Trending',
          icon: <TrendingIcon sx={{ fontSize: 18 }} />,
          component: <TrendingView />,
        }
      );
    }

    // Add social media tabs (Facebook, Instagram, TikTok)
    if (['facebook', 'instagram', 'tiktok', 'tikTok'].includes(type)) {
      const platformType =
        type === 'tikTok' ? 'tiktok' : (type as 'facebook' | 'instagram' | 'tiktok');
      baseTabs.push(
        {
          id: 'viral',
          label: 'Viral Posts',
          icon: <FlameIcon sx={{ fontSize: 18 }} />,
          component: <SocialViralPostsView topicId={id} platform={platformType} />,
        },
        {
          id: 'influencer',
          label: 'Influencers',
          icon: <PeopleIcon sx={{ fontSize: 18 }} />,
          component: <InfluencerTab topicId={id} type={type} />,
        }
      );
    }

    return baseTabs;
  };

  const tabs = getTabs();
  const activeTabConfig = tabs[activeTab];

  return (
    <>
      <Card>
        <CardContent>
          {/* Tabs Navigation */}
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              mb: 3,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.id}
                value={index}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    {tab.icon}
                    {tab.label}
                  </Box>
                }
              />
            ))}
          </Tabs>

          {/* Tab Content */}
          <Box>{activeTabConfig?.component}</Box>
        </CardContent>
      </Card>

      {/* Article List - Outside Tabs */}
      <Box sx={{ mt: 4 }}>
        <ArticleListView topicId={id} type={type} />
      </Box>

      {/* Article Modal */}
      <ArticleModal
        open={articleModalOpen}
        topicId={id}
        onClose={() => {
          setArticleModalOpen(false);
          setArticleModalParams({});
        }}
        {...articleModalParams}
      />
    </>
  );
}
