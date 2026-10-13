import type { LatLngBoundsExpression } from 'leaflet';
import type { ZoneLevel, RedZone } from '../types';

import 'leaflet/dist/leaflet.css';

import dayjs from 'dayjs';
import { Map as MapIcon } from 'lucide-react';
import { useMap, TileLayer, Tooltip, MapContainer, CircleMarker } from 'react-leaflet';
import { useEffect } from 'react';
import { useTheme, useColorScheme } from '@mui/material/styles';

import { propamService } from 'src/services/propamService';

import { ZoneBadge } from '../components/badges';
import { CATEGORY_LABEL } from '../constants';
import { usePropamQuery } from '../hooks/use-propam-query';
import { usePropamFilters } from '../hooks/use-propam-filters';
import { EmptyState, QueryBoundary } from '../components/states';
import { DAY_RANGES, FilterBar, PropamPage } from '../components/propam-page';

// ----------------------------------------------------------------------

const ZONES: ZoneLevel[] = ['merah', 'oranye', 'kuning', 'hijau'];
// Peta dibuat monokrom; mode gelap memakai filter invert pada tile (tanpa API key).
const TILE_FILTER = {
  light: '[&_.leaflet-tile-pane]:grayscale',
  dark: '[&_.leaflet-tile-pane]:grayscale [&_.leaflet-tile-pane]:invert [&_.leaflet-tile-pane]:brightness-90',
};
const INDONESIA_CENTER: [number, number] = [-2.5, 118];

function FitBounds({ zones }: { zones: RedZone[] }) {
  const map = useMap();

  useEffect(() => {
    if (zones.length === 0) return;
    const bounds: LatLngBoundsExpression = zones.map((z) => [z.lat, z.lon] as [number, number]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
  }, [map, zones]);

  return null;
}

export function RedZoneView() {
  const { filters, setFilters, query, selectedTopic } = usePropamFilters('days', 30);
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const zoneColor: Record<ZoneLevel, string> = {
    merah: theme.palette.error.main,
    oranye: theme.palette.warning.main,
    kuning: theme.palette.grey[500],
    hijau: theme.palette.grey[500],
  };

  const { envelope, data, loading, error, refetch } = usePropamQuery(
    (signal) => propamService.redZone(query, signal),
    [query]
  );

  return (
    <PropamPage
      title="Peta Rawan Radikalisme"
      subtitle="Pemetaan indikasi penyebaran narasi radikal dan kantong rekrutmen secara geografis."
      icon={MapIcon}
    >
      <FilterBar
        filters={filters}
        onChange={setFilters}
        rangeOptions={DAY_RANGES.concat([{ value: 90, label: '90 hari' }])}
        selectedTopic={selectedTopic}
        loading={loading}
        onRefresh={refetch}
        hidePlatform
        lastUpdated={envelope ? dayjs(envelope.generated_at).format('HH:mm:ss') : undefined}
      />

      <QueryBoundary loading={loading} error={error} hasData={!!data} onRetry={refetch}>
        {data &&
          (data.zones.length === 0 ? (
            <EmptyState
              title="Belum ada titik rawan"
              hint="Peta memakai hasil analisis geolokasi (post_analysis) pada postingan negatif."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <div
                className={`relative z-0 h-[520px] overflow-hidden rounded-xl border border-line lg:col-span-2 ${
                  colorScheme === 'dark' ? TILE_FILTER.dark : TILE_FILTER.light
                }`}
              >
                <MapContainer center={INDONESIA_CENTER} zoom={5} scrollWheelZoom className="size-full">
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FitBounds zones={data.zones} />
                  {data.zones.map((zone) => (
                    <CircleMarker
                      key={`${zone.label}-${zone.lat}-${zone.lon}`}
                      center={[zone.lat, zone.lon]}
                      radius={Math.min(8 + zone.negative_count * 1.5, 32)}
                      pathOptions={{
                        color: zoneColor[zone.zone],
                        fillColor: zoneColor[zone.zone],
                        fillOpacity: 0.45,
                      }}
                    >
                      <Tooltip>
                        <strong>{zone.label}</strong>
                        <br />
                        {zone.negative_count} negatif · {zone.violation_count} indikasi ancaman
                      </Tooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>

              <aside className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {ZONES.map((z) => (
                    <span key={z} className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
                      <ZoneBadge zone={z} />
                      {data.summary[z] ?? 0}
                    </span>
                  ))}
                </div>
                <ul className="max-h-[470px] space-y-2 overflow-y-auto pr-1">
                  {data.zones.map((zone) => (
                    <li
                      key={`${zone.label}-${zone.lat}-${zone.lon}`}
                      className="rounded-lg border border-line bg-surface p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-fg">{zone.label}</span>
                        <ZoneBadge zone={zone.zone} />
                      </div>
                      <p className="mt-1 text-xs text-fg-muted">
                        {zone.negative_count} negatif · {zone.violation_count} indikasi ancaman · {zone.critical_count} kritis
                      </p>
                      {zone.top_category && (
                        <p className="text-xs text-fg-muted">Dominan: {CATEGORY_LABEL[zone.top_category]}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          ))}
      </QueryBoundary>
    </PropamPage>
  );
}
