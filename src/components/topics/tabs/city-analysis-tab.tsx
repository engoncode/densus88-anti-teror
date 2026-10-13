import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  InputAdornment,
  IconButton,
  Modal,
  Pagination,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Place as MapPinIcon,
  TrendingUp,
  ArrowUpward,
  ArrowDownward,
  Close as CloseIcon,
} from '@mui/icons-material';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import apiClient from 'src/services/apiService';
import PetaIndonesia from 'src/components/maps/peta-indonesia';

interface CityData {
  lat: number;
  lon: number;
  label: string;
  skor: number;
  score_reason: string;
}

interface CityAnalysisTabProps {
  topicId: number;
  onViewPosts?: (kota: string) => void;
}

export default function CityAnalysisTab({ topicId, onViewPosts }: CityAnalysisTabProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [cities, setCities] = useState<CityData[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'label' | 'skor'>('skor');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [scoreCity, setScoreCity] = useState<CityData | null>(null);

  const itemsPerPage = 15;

  // Fetch city data
  const fetchCityData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 1);

      const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const res = await apiClient.get<CityData[]>('/post-analysis/geolocation-stats', {
        params: {
          topic_id: topicId,
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
        },
      });

      const data = res.data || [];
      setCities(data);
      setFilteredCities(data);
      if (data.length > 0) {
        setSelectedCity(data[0]);
      }
    } catch (error) {
      console.error('Error fetching city data:', error);
      setCities([]);
      setFilteredCities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (topicId) {
      fetchCityData();
    }
  }, [topicId]);

  // Search and sort
  useEffect(() => {
    let filtered = cities.filter((city) =>
      city.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal: string | number = a[sortField] || 0;
      let bVal: string | number = b[sortField] || 0;

      if (sortField === 'label') {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    setFilteredCities(filtered);
    setCurrentPage(1);
  }, [searchTerm, sortField, sortOrder, cities]);

  const handleSort = (field: 'label' | 'skor') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSentimentColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 70) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  // --- CHART CONFIGURATION FIXED ---
  const chartDataSlice = filteredCities.slice(0, 10);

  // Tentukan warna teks berdasarkan tema
  const textColor = isDarkMode ? '#FFFFFF' : '#1F2937';
  const gridColor = isDarkMode ? '#374151' : '#E5E7EB';

  const chartOptions: ApexOptions = {
    // 1. Set global theme mode
    theme: {
      mode: isDarkMode ? 'dark' : 'light',
    },
    chart: {
      type: 'bar',
      toolbar: { show: false },
      // 2. ForeColor memaksa warna default untuk semua teks (judul, legenda, dll)
      foreColor: textColor,
      background: 'transparent',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true, // Warna bar berbeda-beda
        borderRadius: 4,
        dataLabels: {
          position: 'center', // atau 'top', 'bottom'
        },
      },
    },
    colors: chartDataSlice.map((c) => {
      if (c.skor >= 70) return '#10B981';
      if (c.skor >= 50) return '#F59E0B';
      return '#EF4444';
    }),
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}`,
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: ['#FFFFFF'], // Text dalam bar selalu putih agar kontras dengan bar berwarna
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: '#000',
        opacity: 0.45,
      },
    },
    // 3. Konfigurasi X-AXIS (Sumbu Kategori/Kota di Horizontal Bar)
    xaxis: {
      categories: chartDataSlice.map((c) => c.label),
      max: 100,
      labels: {
        style: {
          fontSize: '12px',
          // PENTING: Gunakan string tunggal, bukan array, agar konsisten
          colors: textColor,
          fontFamily: theme.typography.fontFamily,
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    // 4. Konfigurasi Y-AXIS (Sumbu Angka di Bawah)
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          // PENTING: Gunakan string tunggal
          colors: textColor,
          fontFamily: theme.typography.fontFamily,
        },
      },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
      style: {
        fontSize: '12px',
      },
      y: {
        formatter: (val) => `Score: ${val}`,
      },
    },
    legend: { show: false },
  };

  const chartSeries = [
    {
      name: 'Average Score',
      data: chartDataSlice.map((c) => c.skor),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" py={8}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Loading city data...
        </Typography>
      </Box>
    );
  }

  if (cities.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" py={8}>
        <MapPinIcon style={{ fontSize: 64, opacity: 0.3 }} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          No city data available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting the date range or check back later
        </Typography>
      </Box>
    );
  }

  const totalPages = Math.ceil(filteredCities.length / itemsPerPage);
  const paginatedCities = filteredCities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MapPinIcon />
            City-Level Sentiment Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Breakdown of sentiment analysis across {cities.length} cities
          </Typography>
        </Box>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search city..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Indonesia Map Heatmap */}
      <Box sx={{ mb: 3 }}>
        <PetaIndonesia id={topicId} showCriticalAreas={false} />
      </Box>

      {/* Charts and Table Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        {/* Bar Chart */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TrendingUp color="primary" />
            Top 10 Cities by Average Score
          </Typography>
          {/* Key prop diubah untuk memaksa re-mount total saat tema berubah */}
          <ReactApexChart
            key={`city-chart-${isDarkMode ? 'dark' : 'light'}-${filteredCities.length}`}
            options={chartOptions}
            series={chartSeries}
            type="bar"
            height={600}
          />
        </Paper>

        {/* Table */}
        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <TableContainer sx={{ flexGrow: 1 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => handleSort('label')}
                    >
                      City
                      {sortField === 'label' &&
                        (sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />)}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        justifyContent: 'center',
                      }}
                      onClick={() => handleSort('skor')}
                    >
                      Score
                      {sortField === 'skor' &&
                        (sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />)}
                    </Box>
                  </TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No cities found matching "{searchTerm}"
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCities.map((city) => (
                    <TableRow
                      key={city.label}
                      hover
                      onClick={() => {
                        setSelectedCity(city);
                        setScoreCity(city);
                        setIsScoreModalOpen(true);
                      }}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: selectedCity?.label === city.label ? 'action.selected' : 'inherit',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MapPinIcon style={{ fontSize: 16, color: '#2196f3' }} />
                          {city.label}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={city.skor} color={getSentimentColor(city.skor)} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewPosts?.(city.label);
                          }}
                        >
                          View Posts
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
        </Paper>
      </Box>

      {/* Score Modal */}
      <Modal
        open={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Paper
          sx={{
            maxWidth: 800,
            width: '90%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {scoreCity && (
            <>
              {/* Modal Header */}
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MapPinIcon />
                  <Typography variant="h6">Analysis for {scoreCity.label}</Typography>
                </Box>
                <IconButton onClick={() => setIsScoreModalOpen(false)} sx={{ color: 'white' }}>
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Modal Body */}
              <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
                <Chip
                  label={`Average Score: ${scoreCity.skor}`}
                  color={getSentimentColor(scoreCity.skor)}
                  sx={{ mb: 2 }}
                />
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{
                    __html: scoreCity.score_reason.replace(/\n/g, '<br />'),
                  }}
                />
              </Box>

              {/* Modal Footer */}
              <Box
                sx={{
                  p: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 1,
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => {
                    setIsScoreModalOpen(false);
                    onViewPosts?.(scoreCity.label);
                  }}
                >
                  View Posts
                </Button>
                <Button variant="outlined" onClick={() => setIsScoreModalOpen(false)}>
                  Close
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Modal>
    </Box>
  );
}
