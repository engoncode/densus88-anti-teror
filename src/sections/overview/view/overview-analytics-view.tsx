import { useCallback, useEffect, useState } from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import artistService from 'src/services/artistService';
import artworkService from 'src/services/artworkService';
import orderService from 'src/services/orderService';
import { fShortenNumber } from 'src/utils/format-number';
import type { OrderStatistics } from 'src/types/order';

import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';

// ----------------------------------------------------------------------

type Statistics = {
  pendingArtists: number;
  totalArtworks: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalArtworkViews: number;
  lapalapaArtworks: number;
  artistArtworks: number;
};

export function OverviewAnalyticsView() {
  const [stats, setStats] = useState<Statistics>({
    pendingArtists: 0,
    totalArtworks: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalArtworkViews: 0,
    lapalapaArtworks: 0,
    artistArtworks: 0,
  });
  const [orderStats, setOrderStats] = useState<OrderStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);

      // Load all statistics in parallel
      const [pendingArtistsData, artworksResponse, orderStatsData] = await Promise.all([
        artistService.getPendingVerifications(),
        artworkService.getAll({ vendor_type: 'lapalapa' }),
        orderService.getStatistics(),
      ]);

      console.log('Statistics loaded:', {
        pendingArtists: pendingArtistsData,
        artworks: artworksResponse,
        orders: orderStatsData,
      });

      setOrderStats(orderStatsData);
      setStats({
        pendingArtists: pendingArtistsData?.length || 0,
        totalArtworks: artworksResponse?.data?.total || 0,
        totalOrders: orderStatsData?.total_orders || 0,
        pendingOrders: orderStatsData?.pending_orders || 0,
        totalArtworkViews: orderStatsData?.total_artwork_views || 0,
        lapalapaArtworks: orderStatsData?.lapalapa_artworks || 0,
        artistArtworks: orderStatsData?.artist_artworks || 0,
        processingOrders: orderStatsData?.processing_orders || 0,
        completedOrders: orderStatsData?.completed_orders || 0,
        totalRevenue: orderStatsData?.total_revenue || 0,
      });
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Dashboard Admin LaPalapa Art 🎨
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Pending Artist Verifications
                </Typography>
                <Iconify
                  icon={'solar:users-group-rounded-bold' as any}
                  width={24}
                  color="text.disabled"
                />
              </Stack>
              <Typography variant="h4">{fShortenNumber(stats.pendingArtists)}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                Artists waiting for approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  LaPalapa Artworks
                </Typography>
                <Iconify icon={'solar:palette-bold' as any} width={24} color="text.disabled" />
              </Stack>
              <Typography variant="h4">{fShortenNumber(stats.totalArtworks)}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                Direct platform artworks
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Orders
                </Typography>
                <Iconify icon={'solar:cart-3-bold' as any} width={24} color="text.disabled" />
              </Stack>
              <Typography variant="h4">{fShortenNumber(stats.totalOrders)}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                All time orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Revenue
                </Typography>
                <Iconify icon={'solar:wallet-money-bold' as any} width={24} color="text.disabled" />
              </Stack>
              <Typography variant="h4">Rp {fShortenNumber(stats.totalRevenue)}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                All time revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Pending Orders
                </Typography>
                <Iconify
                  icon={'solar:clock-circle-outline' as any}
                  width={24}
                  color="text.disabled"
                />
              </Stack>
              <Typography variant="h4">{fShortenNumber(stats.pendingOrders)}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                Awaiting payment
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Processing Orders
                </Typography>
                <Iconify icon={'solar:box-bold' as any} width={24} color="text.disabled" />
              </Stack>
              <Typography variant="h4">{fShortenNumber(stats.processingOrders)}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                Being processed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Completed Orders
                </Typography>
                <Iconify icon={'solar:check-circle-bold' as any} width={24} color="text.disabled" />
              </Stack>
              <Typography variant="h4">{fShortenNumber(stats.completedOrders)}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                Successfully delivered
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Artwork Views
                </Typography>
                <Iconify icon={'solar:eye-bold' as any} width={24} color="text.disabled" />
              </Stack>
              <Typography variant="h4">{fShortenNumber(stats.totalArtworkViews)}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                Total artwork views
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="Artworks Distribution"
            chart={{
              series: [
                { label: 'LaPalapa Artworks', value: stats.lapalapaArtworks },
                { label: 'Artist Artworks', value: stats.artistArtworks },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsWebsiteVisits
            title="Artwork Views Trend"
            subheader={`Total ${stats.totalArtworkViews} views`}
            chart={{
              categories: orderStats?.views_trend?.map((item) => item.date) || [],
              series: [
                {
                  name: 'Views',
                  data: orderStats?.views_trend?.map((item) => item.views) || [],
                },
              ],
            }}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
