import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  getAgreements, getOperatorById, getCommitments,
  getProtectedZones, getConcessionConflicts, getInfrastructureObligations,
  getAgreementById,
} from '@/services/dataService';
import type { ComplianceStatus, ProtectedZone, ConcessionConflict, InfrastructureProjectType } from '@/data/types';

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

const INFRA_META: Record<InfrastructureProjectType, { color: string; label: string }> = {
  rail:               { color: '#8B5CF6', label: 'Railway' },
  port:               { color: '#0EA5E9', label: 'Port' },
  road:               { color: '#F59E0B', label: 'Road' },
  power:              { color: '#EAB308', label: 'Power' },
  'processing-plant': { color: '#EC4899', label: 'Processing plant' },
  dam:                { color: '#14B8A6', label: 'Dam' },
  school:             { color: '#64748B', label: 'School' },
  hospital:           { color: '#64748B', label: 'Hospital' },
};

const CENTER_BY_COUNTRY: Record<string, [number, number]> = {
  GIN: [10.5, -11.5],
  GHA: [7.5, -1.5],
  CIV: [7.0, -5.5],
};

const ZOOM_BY_COUNTRY: Record<string, number> = { GIN: 6, GHA: 6, CIV: 6 };

interface Props {
  countryId?: string;
  /** Optional overrides; when omitted the map fetches its own layer data. */
  protectedZones?: ProtectedZone[];
  conflicts?: ConcessionConflict[];
}

interface LayerState {
  mines: boolean;
  concessions: boolean;
  zones: boolean;
  infrastructure: boolean;
}

// Inner layer renderer — lives inside MapContainer so it can use the map
// instance for click-to-zoom on a mine cluster.
function MapLayers({
  countryId, layers, protectedZones, conflicts,
}: { countryId?: string; layers: LayerState; protectedZones: ProtectedZone[]; conflicts: ConcessionConflict[] }) {
  const map = useMap();
  const agreements = getAgreements(countryId).filter(a => a.status === 'active' && a.coordinates);
  const infra = getInfrastructureObligations(countryId);

  return (
    <>
      {/* Concession boundaries */}
      {layers.concessions && agreements.map(a => {
        const color = STATUS_COLORS[effectiveAgreementStatus(a.id)];
        return (
          <Circle
            key={`con-${a.id}`}
            center={a.coordinates}
            radius={16000}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.06, weight: 1, dashArray: '2 5' }}
          />
        );
      })}

      {/* Protected zones */}
      {layers.zones && protectedZones.map(zone => {
        const isConflict = conflicts.some(c => c.zoneId === zone.id);
        return (
          <Circle
            key={zone.id}
            center={zone.coordinates}
            radius={zone.radiusKm * 1000}
            pathOptions={{
              fillColor: isConflict ? '#DC2626' : '#10b981',
              fillOpacity: 0.15,
              color: isConflict ? '#DC2626' : '#10b981',
              weight: isConflict ? 2 : 1,
              dashArray: isConflict ? '4 4' : undefined,
            }}
          >
            <Popup>
              <div className="text-xs leading-relaxed min-w-[160px]">
                <div className="font-semibold text-ink mb-1">{zone.name}</div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-ink-3 mb-1">{zone.type.replace(/_/g, ' ')}</div>
                <div className="text-ink-4">{zone.description}</div>
                {isConflict && <div className="mt-2 text-destructive font-bold text-[10px] uppercase">Active Concession Conflict</div>}
              </div>
            </Popup>
          </Circle>
        );
      })}

      {/* Infrastructure markers */}
      {layers.infrastructure && infra.map(io => {
        const ag = getAgreementById(io.agreementId);
        if (!ag?.coordinates) return null;
        const meta = INFRA_META[io.projectType];
        return (
          <CircleMarker
            key={io.id}
            center={ag.coordinates}
            radius={6}
            pathOptions={{ fillColor: 'transparent', color: meta.color, weight: 3, fillOpacity: 0 }}
          >
            <Popup>
              <div className="text-xs leading-relaxed min-w-[170px]">
                <div className="font-semibold text-ink mb-1">{io.projectName}</div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-ink-3 mb-1">{meta.label}</div>
                <div className="text-ink-4">{io.actualProgress}% complete · {io.status.replace('-', ' ')}</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Mine / operator markers */}
      {layers.mines && agreements.map(agreement => {
        const operator = getOperatorById(agreement.operatorId);
        const status = effectiveAgreementStatus(agreement.id);
        const color = STATUS_COLORS[status];
        return (
          <CircleMarker
            key={agreement.id}
            center={agreement.coordinates}
            radius={8}
            pathOptions={{ fillColor: color, fillOpacity: 0.85, color: '#fff', weight: 1.5 }}
            eventHandlers={{ click: () => map.flyTo(agreement.coordinates, Math.max(map.getZoom(), 8), { duration: 0.6 }) }}
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
    </>
  );
}

const LAYER_TOGGLES: { key: keyof LayerState; label: string }[] = [
  { key: 'mines', label: 'Mines' },
  { key: 'concessions', label: 'Concessions' },
  { key: 'zones', label: 'Protected Zones' },
  { key: 'infrastructure', label: 'Infrastructure' },
];

export function CountryMap({ countryId, protectedZones, conflicts }: Props) {
  const [layers, setLayers] = useState<LayerState>({ mines: true, concessions: false, zones: true, infrastructure: true });

  const zones = protectedZones ?? getProtectedZones(countryId);
  const conflictList = conflicts ?? getConcessionConflicts(countryId);

  const center: [number, number] = countryId && countryId !== 'ALL' ? CENTER_BY_COUNTRY[countryId] ?? [8.0, -6.0] : [8.0, -7.0];
  const zoom = countryId && countryId !== 'ALL' ? ZOOM_BY_COUNTRY[countryId] ?? 6 : 5;

  const toggle = (key: keyof LayerState) => setLayers(s => ({ ...s, [key]: !s[key] }));

  return (
    <div className="relative h-full w-full">
      {/* Layer toggles */}
      <div className="absolute top-3 right-3 z-[500] flex flex-col gap-1 rounded-xl border border-line-soft bg-card/90 backdrop-blur p-2 shadow-card">
        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-4 px-1 pb-0.5">Layers</span>
        {LAYER_TOGGLES.map(t => (
          <button
            key={t.key}
            onClick={() => toggle(t.key)}
            className={'flex items-center gap-2 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ' + (layers[t.key] ? 'text-brand-700 bg-brand-600/10' : 'text-ink-4 hover:text-ink')}
            aria-pressed={layers[t.key]}
          >
            <span className={'w-2.5 h-2.5 rounded-sm border ' + (layers[t.key] ? 'bg-brand-600 border-brand-600' : 'border-line-strong')} aria-hidden />
            {t.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[500] rounded-xl border border-line-soft bg-card/90 backdrop-blur px-3 py-2 shadow-card">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {(['met', 'on-track', 'at-risk', 'breached'] as ComplianceStatus[]).map(s => (
            <div key={s} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s] }} aria-hidden />
              <span className="text-[10px] font-medium text-ink-3 capitalize">{s.replace('-', ' ')}</span>
            </div>
          ))}
        </div>
        <div className="mt-1.5 pt-1.5 border-t border-line-soft flex items-center gap-3">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: '#8B5CF6' }} aria-hidden /><span className="text-[10px] text-ink-3">Infra</span></span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(220,38,38,0.3)', border: '1px solid #DC2626' }} aria-hidden /><span className="text-[10px] text-ink-3">Conflict</span></span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution="© OpenStreetMap contributors © CARTO"
        />
        <MapLayers countryId={countryId} layers={layers} protectedZones={zones} conflicts={conflictList} />
      </MapContainer>
    </div>
  );
}
