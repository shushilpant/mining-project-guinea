import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getAgreements, getOperatorById, getCommitments } from '@/services/dataService';
import type { ComplianceStatus } from '@/data/types';

function effectiveAgreementStatus(agreementId: string): ComplianceStatus {
  const commitments = getCommitments(agreementId);
  if (commitments.length === 0) return 'on-track';
  if (commitments.some(c => c.status === 'breached')) return 'breached';
  if (commitments.some(c => c.status === 'at-risk'))  return 'at-risk';
  if (commitments.some(c => c.status === 'met'))      return 'met';
  return 'on-track';
}

const STATUS_COLORS: Record<ComplianceStatus, string> = {
  'met': '#10b981',
  'on-track': '#3b82f6',
  'at-risk': '#f59e0b',
  'breached': '#ef4444',
};

const CENTER_BY_COUNTRY: Record<string, [number, number]> = {
  GIN: [10.5, -11.5],
  GHA: [7.5, -1.5],
  CIV: [7.0, -5.5],
};

const ZOOM_BY_COUNTRY: Record<string, number> = {
  GIN: 6,
  GHA: 6,
  CIV: 6,
};

interface Props {
  countryId?: string;
}

export function CountryMap({ countryId }: Props) {
  const agreements = getAgreements(countryId);
  const center: [number, number] = countryId ? CENTER_BY_COUNTRY[countryId] ?? [8.0, -6.0] : [8.0, -7.0];
  const zoom = countryId ? ZOOM_BY_COUNTRY[countryId] ?? 6 : 5;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      {agreements
        .filter(a => a.status === 'active' && a.coordinates)
        .map(agreement => {
          const operator = getOperatorById(agreement.operatorId);
          const status = effectiveAgreementStatus(agreement.id);
          const color = STATUS_COLORS[status];

          return (
            <CircleMarker
              key={agreement.id}
              center={agreement.coordinates}
              radius={8}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.85,
                color: '#fff',
                weight: 1.5,
              }}
            >
              <Popup>
                <div className="text-xs leading-relaxed min-w-[160px]">
                  <div className="font-semibold text-ink mb-1">{operator?.name}</div>
                  <div className="text-ink-2 mb-0.5">{agreement.concesssionArea}</div>
                  <div className="text-ink-3">{agreement.commodity} · {agreement.royaltyRate}% royalty</div>
                  <div className="mt-1.5 font-medium" style={{ color }}>
                    {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
    </MapContainer>
  );
}
