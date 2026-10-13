// Indonesia Map Component with Geolocation Statistics
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import {
  Card,
  CardContent,
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  LocationOn as LocationOnIcon,
  Warning as WarningIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import apiClient from 'src/services/apiService';
import { ArticleModal } from 'src/components/modal/article-modal';

const osmTiles = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

type GeolocationStat = {
  lat: number;
  lon: number;
  label: string;
  skor: number;
  score_reason: string;
};

interface PetaIndonesiaProps {
  id: number;
  startDate?: string;
  endDate?: string;
  showCriticalAreas?: boolean;
}

// Auto-zoom to the most urgent city (score < 10) after data loads
// Auto-zoom to the single most urgent city (lowest score < 10, first in list)
function AutoZoomToUrgent({ locations }: { locations: GeolocationStat[] }) {
  const map = useMap();
  useEffect(() => {
    const urgent = locations
      .filter((loc) => loc.skor < 10)
      .sort((a, b) => a.skor - b.skor);
    if (urgent.length === 0) return;
    // Always zoom to the single most urgent (first) city only
    map.flyTo([urgent[0].lat, urgent[0].lon], 15, { duration: 1.8 });
  }, [locations, map]);
  return null;
}

// Individual marker with click-to-zoom and optional permanent label
function MarkerWithZoom({
  loc,
  skorToHSL,
  onViewCity,
  onHover,
  onHoverOut,
}: {
  loc: GeolocationStat;
  skorToHSL: (s: number) => string;
  onViewCity: (label: string) => void;
  onHover: (loc: GeolocationStat) => void;
  onHoverOut: () => void;
}) {
  const map = useMap();
  const color = skorToHSL(loc.skor);
  const isCritical = loc.skor <= 35;
  const isUrgent = loc.skor <= 10;
  const size = Math.round(24 + (loc.skor / 100) * 20);
  const icon = L.divIcon({
    className: 'peta-marker-icon',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${isCritical ? `<div class="peta-pulse-ring" style="inset:-8px;background:${color};"></div>` : ''}
        <div style="position:absolute;inset:0;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:${size < 32 ? '9' : '11'}px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.45);border:2px solid rgba(255,255,255,0.35);">${loc.skor}</div>
      </div>`,
    iconSize: L.point(size, size, true),
    iconAnchor: L.point(size / 2, size / 2, true),
  });
  return (
    <Marker
      position={[loc.lat, loc.lon]}
      icon={icon}
      eventHandlers={{
        mouseover: () => onHover(loc),
        mouseout: () => onHoverOut(),
        click: () => map.flyTo([loc.lat, loc.lon], 15, { duration: 1.2 }),
      }}
    >
      {/* Permanent label for urgent cities (score ≤ 10) */}
      {isUrgent && (
        <Tooltip
          direction="top"
          offset={[0, -(size / 2 + 6)]}
          opacity={1}
          permanent
        >
          <span style={{ fontWeight: 700, fontSize: '0.75rem', color: color }}>
            ⚠ {loc.label}
          </span>
        </Tooltip>
      )}
      {/* Hover tooltip for non-urgent cities */}
      {!isUrgent && (
        <Tooltip direction="top" offset={[0, -(size / 2 + 4)]} opacity={0.95}>
          <span style={{ fontWeight: 600 }}>{loc.label}</span> — Score: {loc.skor}
        </Tooltip>
      )}
      <Popup>
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            {loc.label}
          </Typography>
          <Box
            sx={{
              fontSize: '0.875rem',
              fontStyle: 'italic',
              maxHeight: 100,
              overflowY: 'auto',
              mb: 1,
            }}
            dangerouslySetInnerHTML={{ __html: loc.score_reason }}
          />
          <Typography variant="body2">Score: {loc.skor}</Typography>
          <Button
            variant="contained"
            size="small"
            sx={{ mt: 1 }}
            onClick={() => onViewCity(loc.label)}
          >
            Details
          </Button>
        </Box>
      </Popup>
    </Marker>
  );
}

export default function PetaIndonesia({
  id,
  startDate: propStartDate,
  endDate: propEndDate,
  showCriticalAreas = true,
}: PetaIndonesiaProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = theme.palette.mode === 'dark';

  // Date range: default = last month
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  // Extract date only from props (remove timestamp if present)
  const extractDateOnly = (dateStr?: string) => {
    if (!dateStr) return null;
    return dateStr.split(' ')[0];
  };

  const [startDate, setStartDate] = useState<string>(
    extractDateOnly(propStartDate) || formatDate(lastMonth)
  );
  const [endDate, setEndDate] = useState<string>(extractDateOnly(propEndDate) || formatDate(today));
  const [locations, setLocations] = useState<GeolocationStat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');

  // Article Modal
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Fullscreen handling
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredCity, setHoveredCity] = useState<GeolocationStat | null>(null);

  // Inject pulse animation CSS once
  useEffect(() => {
    const styleId = 'peta-pulse-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes petaPulse {
          0%   { transform: scale(1);   opacity: 0.7; }
          60%  { transform: scale(2.2); opacity: 0;   }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        .peta-pulse-ring {
          animation: petaPulse 1.8s ease-out infinite;
          transform-origin: center;
          position: absolute;
          border-radius: 50%;
        }
        .peta-marker-icon { cursor: pointer; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const onFSChange = () => {
      const fsEl =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;
      setIsFullscreen(!!fsEl);
    };
    document.addEventListener('fullscreenchange', onFSChange);
    document.addEventListener('webkitfullscreenchange', onFSChange);
    document.addEventListener('mozfullscreenchange', onFSChange);
    document.addEventListener('MSFullscreenChange', onFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFSChange);
      document.removeEventListener('webkitfullscreenchange', onFSChange);
      document.removeEventListener('mozfullscreenchange', onFSChange);
      document.removeEventListener('MSFullscreenChange', onFSChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!mapWrapperRef.current) return;
    if (!isFullscreen) {
      const el = mapWrapperRef.current;
      if (el.requestFullscreen) el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
      else if ((el as any).mozRequestFullScreen) (el as any).mozRequestFullScreen();
      else if ((el as any).msRequestFullscreen) (el as any).msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
      else if ((document as any).mozCancelFullScreen) (document as any).mozCancelFullScreen();
      else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
    }
  };

  // Fetch geolocation stats from API
  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<GeolocationStat[]>('/post-analysis/geolocation-stats', {
        params: { topic_id: id, start_date: startDate, end_date: endDate },
      });
      setLocations(res.data);
    } catch (err) {
      console.error('Error fetching geolocation stats:', err);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Sync state with props
  useEffect(() => {
    const newStart = extractDateOnly(propStartDate);
    const newEnd = extractDateOnly(propEndDate);
    if (newStart) setStartDate(newStart);
    if (newEnd) setEndDate(newEnd);
  }, [propStartDate, propEndDate]);

  useEffect(() => {
    if (id) {
      fetchLocations();
    }
  }, [startDate, endDate, id]);

  // Map score to HSL color
  const skorToHSL = (skor: number) => {
    const norm = Math.max(0, Math.min(100, skor));
    const hue = (norm / 100) * 120;
    return `hsl(${hue}, 100%, 50%)`;
  };

  // Handle view city posts
  const handleViewCityPosts = (city: string) => {
    setSelectedCity(city);
    setArticleModalOpen(true);
  };

  const handleCloseArticleModal = () => {
    setArticleModalOpen(false);
    setSelectedCity('');
  };

  const bounds: [number, number][] = locations.map((loc) => [loc.lat, loc.lon]);

  const criticalAreas = locations.filter((loc) => loc.skor <= 35).sort((a, b) => a.skor - b.skor);

  return (
    <Card
      ref={mapWrapperRef}
      sx={{
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 1300 : 'auto',
        height: isFullscreen ? '100vh' : 'auto',
      }}
    >
      <CardContent>
        {/* Header with controls */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Issue Distribution
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <TextField
              type="date"
              label="From"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: endDate }}
              sx={{ width: isMobile ? '100%' : 150 }}
            />
            <TextField
              type="date"
              label="To"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: startDate }}
              sx={{ width: isMobile ? '100%' : 150 }}
            />
            <IconButton onClick={fetchLocations} disabled={loading} color="primary">
              <RefreshIcon className={loading ? 'animate-spin' : ''} />
            </IconButton>
            <IconButton
              onClick={() => setMapTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              color="primary"
              title={mapTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={mapTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {mapTheme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <IconButton onClick={toggleFullscreen} color="primary">
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Map Container */}
        <Box
          className={mapTheme === 'dark'
            ? '[&_.leaflet-tile-pane]:invert [&_.leaflet-tile-pane]:hue-rotate-180 [&_.leaflet-tile-pane]:brightness-90 [&_.leaflet-tile-pane]:contrast-90'
            : undefined}
          sx={{
            position: 'relative',
            width: '100%',
            height: isFullscreen ? 'calc(100vh - 180px)' : 600,
            mb: 3,
          }}
        >
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <CircularProgress />
            </Box>
          )}

          <MapContainer
            center={bounds.length ? (bounds[0] as [number, number]) : [-2.5, 118]}
            zoom={5}
            scrollWheelZoom
            bounds={bounds.length ? (bounds as any) : undefined}
            style={{ width: '100%', height: '100%', zIndex: 0 }}
          >
            <TileLayer
              url={osmTiles.url}
              attribution={osmTiles.attribution}
            />
            <AutoZoomToUrgent locations={locations} />

            <MarkerClusterGroup
              chunkedLoading
              showCoverageOnHover={false}
              spiderfyOnMaxZoom={true}
              iconCreateFunction={(cluster: any) => {
                const count = cluster.getChildCount();

                // Get all child markers and calculate average score
                const childMarkers = cluster.getAllChildMarkers();
                let totalScore = 0;
                let validScores = 0;

                childMarkers.forEach((marker: any) => {
                  if (marker.options && marker.options.score !== undefined) {
                    totalScore += marker.options.score;
                    validScores++;
                  }
                });

                const avgScore = validScores > 0 ? totalScore / validScores : 50;

                // Calculate color based on average score using HSL
                const norm = Math.max(0, Math.min(100, avgScore));
                const hue = (norm / 100) * 120;
                const bgColor = `hsl(${hue}, 100%, 50%)`;

                // Size based on count
                let size = 'small';
                if (count > 100) {
                  size = 'large';
                } else if (count > 50) {
                  size = 'medium';
                }

                const sizeClass = size === 'large' ? 60 : size === 'medium' ? 50 : 40;

                return L.divIcon({
                  html: `<div style="background-color: ${bgColor}; width: ${sizeClass}px; height: ${sizeClass}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${sizeClass > 50 ? '16px' : '14px'}; box-shadow: 0 3px 14px rgba(0,0,0,0.4); border: 3px solid rgba(255,255,255,0.3);">${count}</div>`,
                  className: 'custom-cluster-icon',
                  iconSize: L.point(sizeClass, sizeClass, true),
                });
              }}
            >
              {locations.map((loc, idx) => (
                <MarkerWithZoom
                  key={idx}
                  loc={loc}
                  skorToHSL={skorToHSL}
                  onViewCity={handleViewCityPosts}
                  onHover={setHoveredCity}
                  onHoverOut={() => setHoveredCity(null)}
                />
              ))}
            </MarkerClusterGroup>
          </MapContainer>

          {/* Legend overlay */}
          <Box
            sx={{
              position: 'absolute', top: 70, right: 10, zIndex: 500,
              bgcolor: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(6px)',
              borderRadius: 2, p: 1.5, minWidth: 148,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, display: 'block', mb: 0.75 }}>
              Score Legend
            </Typography>
            {[
              { label: 'Positif (≥70)', color: 'hsl(120,100%,45%)' },
              { label: 'Netral (50–69)', color: 'hsl(60,100%,42%)' },
              { label: 'Waspada (35–49)', color: 'hsl(25,100%,50%)' },
              { label: 'Kritis (≤34)', color: 'hsl(0,100%,50%)' },
            ].map((item) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.4 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.68rem' }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.63rem', display: 'block', mt: 0.5 }}>
              Ukuran marker = skala skor
            </Typography>
          </Box>

          {/* Hover info card */}
          {hoveredCity && (
            <Box
              sx={{
                position: 'absolute', bottom: 36, left: 10, zIndex: 500,
                bgcolor: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(6px)',
                borderRadius: 2, p: 1.5, minWidth: 210,
                border: '1px solid rgba(255,255,255,0.12)',
                pointerEvents: 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box
                  sx={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    bgcolor: skorToHSL(hoveredCity.skor),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                  }}
                >
                  {hoveredCity.skor}
                </Box>
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700 }}>
                  {hoveredCity.label}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.68rem' }}>
                Klik marker untuk detail lengkap
              </Typography>
            </Box>
          )}
        </Box>

        {/* Critical Sentiment Areas */}
        {showCriticalAreas && !loading && locations.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <WarningIcon color="warning" />
              <Typography variant="h6" fontWeight="bold">
                Critical Sentiment Areas (Score ≤ 35)
              </Typography>
            </Box>

            {criticalAreas.length === 0 ? (
              <Alert severity="info">No critical areas found (all areas have score &gt; 35)</Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {criticalAreas.map((loc, idx) => {
                  const color = skorToHSL(loc.skor);
                  return (
                    <Card key={idx} variant="outlined" sx={{ display: 'flex', gap: 2, p: 2 }}>
                      {/* Score Badge */}
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          flexShrink: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 2,
                          backgroundColor: color,
                          color: 'white',
                        }}
                      >
                        <Typography variant="caption">Score</Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {loc.skor}
                        </Typography>
                      </Box>

                      {/* Content */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {loc.label}
                        </Typography>
                        <Box
                          sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 1 }}
                          dangerouslySetInnerHTML={{ __html: loc.score_reason }}
                        />
                        <Button
                          size="small"
                          onClick={() => {
                            handleViewCityPosts(loc.label);
                          }}
                        >
                          View Details →
                        </Button>
                      </Box>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>
        )}
      </CardContent>

      {/* Article Modal */}
      <ArticleModal
        open={articleModalOpen}
        topicId={id}
        kota={selectedCity}
        onClose={handleCloseArticleModal}
      />
    </Card>
  );
}
