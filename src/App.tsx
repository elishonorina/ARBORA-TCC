import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  LayoutDashboard,
  Map as MapIcon,
  PlusCircle,
  ListTree,
  Wrench,
  AlertTriangle,
  Settings,
  Navigation,
  Camera,
  ChevronRight,
  ChevronLeft,
  X,
  Filter,
  MapPin,
  Search,
  Calendar,
  Check,
  Upload,
  TreeDeciduous,
  Zap,
  ClipboardList,
  Menu,
  ChevronDown,
  FileUp,
  RadioTower,
} from 'lucide-react';

/* =========================================================
   TOKENS / CONFIG
   ========================================================= */
const CRIT = {
  baixa: {
    label: 'BAIXA',
    dot: 'bg-green-600',
    ring: 'ring-green-600',
    text: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  moderada: {
    label: 'MODERADA',
    dot: 'bg-amber-500',
    ring: 'ring-amber-500',
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  alta: {
    label: 'ALTA',
    dot: 'bg-orange-500',
    ring: 'ring-orange-500',
    text: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  critica: {
    label: 'CRÍTICA',
    dot: 'bg-red-600',
    ring: 'ring-red-600',
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
};
const CRIT_ORDER = ['baixa', 'moderada', 'alta', 'critica'];

const STATUS_STYLE = {
  pendente: { text: 'text-gray-600', bg: 'bg-gray-100', label: 'Pendente' },
  programada: { text: 'text-blue-700', bg: 'bg-blue-50', label: 'Programada' },
  execucao: { text: 'text-amber-700', bg: 'bg-amber-50', label: 'Em execução' },
  concluida: { text: 'text-green-700', bg: 'bg-green-50', label: 'Concluída' },
};

const TRECHOS = ['MT-042', 'MT-018', 'MT-073', 'MT-091', 'MT-005', 'MT-127'];
const MUNICIPIOS = [
  'Aracaju',
  'São Cristóvão',
  'Nossa Senhora do Socorro',
  'Itabaiana',
  'Lagarto',
  'Estância',
];
const TIPOS_VEG = [
  'Árvore de grande porte',
  'Árvore de médio porte',
  'Arbusto denso',
  'Palmeira',
  'Vegetação rasteira',
];
const ESTADOS_VEG = ['Saudável', 'Seca', 'Comprometida', 'Risco de queda'];

/* =========================================================
   MOCK DATA
   ========================================================= */
function seededRand(seed) {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
}

/* =========================================================
   PONTOS DE VEGETAÇÃO — EDITE AQUI COM DADOS REAIS
   ---------------------------------------------------------
   Cada bloco { } abaixo é um ponto no mapa. Pra adicionar um
   ponto novo, copie um bloco inteiro (do { até a , depois do
   último }), cole embaixo do último e mude os valores.

   Pra achar latitude/longitude reais: abra maps.google.com,
   clique com o botão direito no local exato → o primeiro item
   do menu mostra as coordenadas (ex: -10.9472, -37.0731) →
   clique pra copiar.

   criticidade aceita apenas: "baixa", "moderada", "alta", "critica"
   intervencao aceita apenas: "pendente", "programada", "execucao", "concluida"

   {
    id: 'VEG-0001',
    lat: '-10.94720',
    lng: '-37.07310',
    criticidade: 'critica',
    tipo: 'Árvore de grande porte',
    porte: 'Grande',
    altura: '9.0',
    estado: 'Risco de queda',
    distanciaRede: '1.2',
    tipoRede: 'Média tensão',
    trecho: 'MT-042',
    alimentador: 'ALM-10',
    municipio: 'Aracaju',
    ocorrencias: 2,
    intervencao: 'pendente',
    ultimaInspecao: '18/08/2026',
    observacoes: 'Ponto identificado durante inspeção de rotina do trecho.',
  },

   ========================================================= */
const VEGETATION_POINTS = [
  {
    id: 'TESTE',
    lat: '-10.949387988331504',
    lng: '-37.071319541159106',
    criticidade: 'critica',
    tipo: 'Árvore de grande porte',
    porte: 'Grande',
    altura: '9.0',
    estado: 'Risco de queda',
    distanciaRede: '1.2',
    tipoRede: 'Média tensão',
    trecho: 'MT-042',
    alimentador: 'ALM-10',
    municipio: 'Aracaju',
    ocorrencias: 2,
    intervencao: 'pendente',
    ultimaInspecao: '18/08/2026',
    observacoes: 'Ponto identificado durante inspeção de rotina do trecho.',
  },

  
];

function generatePoints() {
  return VEGETATION_POINTS;
}

function generateOccurrences(points) { /* OCORRENCIAS|DESARMES */
  const causas = [
    'Vegetação',
    'Vegetação',
    'Descarga atmosférica',
    'Vegetação',
  ];
  return [
    {
      id: 'OC-118',
      data: '14/08/2026',
      trecho: 'MT-042',
      local: 'Campo Verde',
      tipo: 'Desarme',
      causa: 'Vegetação',
      duracao: '18 min',
      criticidade: 'alta',
    },
    {
      id: 'OC-117',
      data: '12/07/2026',
      trecho: 'MT-018',
      local: 'Vista Alegre',
      tipo: 'Interrupção',
      causa: 'Vegetação',
      duracao: '42 min',
      criticidade: 'critica',
    },
    {
      id: 'OC-116',
      data: '29/06/2026',
      trecho: 'MT-073',
      local: 'Porto Novo',
      tipo: 'Desarme',
      causa: 'Vegetação',
      duracao: '9 min',
      criticidade: 'moderada',
    },
    {
      id: 'OC-115',
      data: '03/06/2026',
      trecho: 'MT-091',
      local: 'Serra Alta',
      tipo: 'Interrupção',
      causa: 'Vegetação',
      duracao: '61 min',
      criticidade: 'critica',
    },
    {
      id: 'OC-114',
      data: '22/05/2026',
      trecho: 'MT-005',
      local: 'Campo Verde',
      tipo: 'Desarme',
      causa: causas[1],
      duracao: '14 min',
      criticidade: 'alta',
    },
    {
      id: 'OC-113',
      data: '08/05/2026',
      trecho: 'MT-127',
      local: 'Vista Alegre',
      tipo: 'Desarme',
      causa: 'Vegetação',
      duracao: '22 min',
      criticidade: 'moderada',
    },
  ];
}

function generateInterventions(points) {
  return points
    .filter((p) => p.intervencao !== 'concluida' || Math.random() > 0.5)
    .slice(0, 12)
    .map((p, i) => ({
      id: `INT-${300 + i}`,
      ponto: p.id,
      local: p.municipio,
      trecho: p.trecho,
      criticidade: p.criticidade,
      tipo:
        p.criticidade === 'critica'
          ? 'Poda emergencial'
          : p.criticidade === 'alta'
          ? 'Poda programada'
          : 'Poda de manutenção',
      dataPrevista: `${(i % 27) + 1}/09/2026`,
      status: p.intervencao,
    }));
}

/* =========================================================
   HOOKS
   ========================================================= */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 820);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

/* =========================================================
   PRIMITIVES
   ========================================================= */
function CriticalityBadge({ level, size = 'sm' }) {
  const c = CRIT[level];
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${c.border} ${c.bg} ${pad} font-semibold ${c.text} tracking-wide`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pendente;
  return (
    <span
      className={`inline-flex items-center rounded-md ${s.bg} ${s.text} px-2 py-0.5 text-[11px] font-medium`}
    >
      {s.label}
    </span>
  );
}

function KPICard({ label, value, tone = 'default', icon: Icon }) {
  const toneMap = {
    default: 'text-gray-900',
    green: 'text-green-700',
    orange: 'text-orange-600',
    red: 'text-red-600',
  };
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-2 min-w-[140px]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-gray-400" strokeWidth={1.75} />}
      </div>
      <span className={`text-2xl font-semibold font-mono ${toneMap[tone]}`}>
        {value}
      </span>
    </div>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-gray-900">{children}</h2>
      {action}
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 text-gray-400 gap-2 border border-dashed border-gray-200 rounded-lg">
      <ListTree className="h-6 w-6" strokeWidth={1.5} />
      <span className="text-xs">{label}</span>
    </div>
  );
}

/* =========================================================
   NAVIGATION CONFIG
   ========================================================= */
const NAV = [
  { key: 'map', label: 'Mapa de Vegetação', icon: MapIcon },
  { key: 'register', label: 'Registrar Vegetação', icon: PlusCircle },
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'points', label: 'Pontos de Vegetação', icon: ListTree },
  { key: 'interventions', label: 'Intervenções', icon: Wrench },
  { key: 'occurrences', label: 'Ocorrências / Desarmes', icon: AlertTriangle },
  { key: 'settings', label: 'Configurações', icon: Settings },
];

/* =========================================================
   SIDEBAR (desktop) + HEADER
   ========================================================= */
function Sidebar({ page, setPage }) {
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-gray-200 bg-white h-full">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-100">
        <div className="h-8 w-8 rounded-md bg-gray-900 flex items-center justify-center">
          <TreeDeciduous className="h-5 w-5 text-green-400" strokeWidth={2} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-gray-900">ARBORA</p>
          <p className="text-[10px] text-gray-400 tracking-wide">
            MONITORAMENTO
          </p>
        </div>
      </div>
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <div className="rounded-md bg-gray-50 px-3 py-2.5 text-[11px] text-gray-500 leading-relaxed">
          Fase atual:{' '}
          <span className="font-medium text-gray-700">
            Frontend (Fase 1/10)
          </span>
        </div>
      </div>
    </aside>
  );
}

function Header({ title, subtitle, isMobile, onMenu }) {
  return (
    <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-6 z-20">
      <div className="flex items-center gap-3 min-w-0">
        {isMobile && (
          <button onClick={onMenu} className="p-1.5 -ml-1.5 text-gray-500">
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-sm md:text-base font-semibold text-gray-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden md:block text-xs text-gray-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 font-mono">
        <span> Sergipe · ESE </span>
      </div>
    </header>
  );
}

function BottomNav({ page, setPage }) {
  const items = [
    { key: 'map', label: 'Mapa', icon: MapIcon },
    { key: 'points', label: 'Pontos', icon: ListTree },
    { key: 'register', label: 'Registrar', icon: PlusCircle, primary: true },
    { key: 'interventions', label: 'Interv.', icon: Wrench },
    { key: 'dashboard', label: 'Início', icon: LayoutDashboard },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex items-stretch h-16 z-30">
      {items.map((item) => {
        const Icon = item.icon;
        const active = page === item.key;
        if (item.primary) {
          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <span className="h-11 w-11 rounded-full bg-green-600 flex items-center justify-center -mt-5 shadow-md shadow-green-900/20">
                <Icon className="h-5 w-5 text-white" strokeWidth={2} />
              </span>
            </button>
          );
        }
        return (
          <button
            key={item.key}
            onClick={() => setPage(item.key)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 ${
              active ? 'text-green-700' : 'text-gray-400'
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.75} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* =========================================================
   MAP (real — Leaflet + OpenStreetMap, centrado em Sergipe)
   ========================================================= */
// Posição inicial: região central de Aracaju.
const SERGIPE_CENTER = [-10.94720, -37.07310];
const SERGIPE_BOUNDS = [
  [-11.85, -38.35],
  [-9.35, -36.05],
];
// Zoom inicial mais próximo da capital, sem abrir mostrando todo o estado.
const DEFAULT_ZOOM = 12;
// A partir de qual nível de zoom cada criticidade passa a aparecer.
// Quanto maior o número, mais "perto" (zoom) é preciso chegar.
const CRIT_MIN_ZOOM = { critica: 0, alta: 10, moderada: 11, baixa: 13 };

const SERGIPE_NETWORK_LINES = [
  [
    [-10.65, -37.55],
    [-10.72, -37.3],
    [-10.8, -37.2],
    [-10.95, -37.05],
  ],
  [
    [-10.95, -37.05],
    [-11.05, -36.9],
    [-11.15, -37.0],
    [-11.3, -37.6],
  ],
  [
    [-10.72, -37.3],
    [-10.6, -37.05],
    [-10.5, -36.85],
  ],
  [
    [-11.15, -37.0],
    [-11.0, -36.55],
    [-10.8, -36.45],
  ],
];
const SERGIPE_DESARMES = [
  [-10.72, -37.3],
  [-11.05, -36.9],
];

function FlyToLocating({ active }) {
  const map = useMap();
  useEffect(() => {
    if (active) map.flyTo(SERGIPE_CENTER, 14, { duration: 0.8 });
  }, [active]);
  return null;
}

function ZoomWatcher({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });
  return null;
}

const CRIT_HEX = {
  baixa: '#16a34a',
  moderada: '#f59e0b',
  alta: '#f97316',
  critica: '#dc2626',
};

function MapCanvas({
  points,
  layers,
  onSelect,
  selectedId,
  height = '100%',
  locating,
}) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const visiblePoints = points.filter(
    (p) => zoom >= (CRIT_MIN_ZOOM[p.criticidade] ?? 0)
  );

  return (
    <div
      className="relative w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
      style={{ height }}
    >
      <MapContainer
        center={SERGIPE_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={10}
        maxZoom={17}
        maxBounds={SERGIPE_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom
      >
        <ZoomWatcher onZoomChange={setZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {layers.rede &&
          SERGIPE_NETWORK_LINES.map((line, i) => (
            <Polyline
              key={i}
              positions={line}
              pathOptions={{
                color: '#4b5563',
                weight: 2.5,
                dashArray: '6 5',
                opacity: 0.65,
              }}
            />
          ))}

        {layers.pontos &&
          visiblePoints.map((p) => {
            const color = CRIT_HEX[p.criticidade];
            const isSel = selectedId === p.id;
            return (
              <React.Fragment key={p.id}>
                {p.criticidade === 'critica' && (
                  <CircleMarker
                    center={[Number(p.lat), Number(p.lng)]}
                    radius={isSel ? 18 : 14}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.15,
                      weight: 0,
                    }}
                  />
                )}
                <CircleMarker
                  center={[Number(p.lat), Number(p.lng)]}
                  radius={isSel ? 9 : 7}
                  pathOptions={{
                    color: 'white',
                    weight: 2,
                    fillColor: color,
                    fillOpacity: 1,
                  }}
                  eventHandlers={{ click: () => onSelect(p.id) }}
                />
              </React.Fragment>
            );
          })}

        {layers.desarmes &&
          SERGIPE_DESARMES.map((pos, i) => (
            <CircleMarker
              key={i}
              center={pos}
              radius={9}
              pathOptions={{ color: '#dc2626', weight: 2, fillOpacity: 0 }}
            />
          ))}

        {locating && (
          <>
            <CircleMarker
              center={SERGIPE_CENTER}
              radius={16}
              pathOptions={{
                color: '#2563eb',
                fillColor: '#2563eb',
                fillOpacity: 0.15,
                weight: 0,
              }}
            />
            <CircleMarker
              center={SERGIPE_CENTER}
              radius={6}
              pathOptions={{
                color: 'white',
                weight: 2,
                fillColor: '#2563eb',
                fillOpacity: 1,
              }}
            />
            <FlyToLocating active={locating} />
          </>
        )}
      </MapContainer>

      <div className="absolute bottom-2 left-2 rounded bg-white/90 backdrop-blur px-2 py-1 text-[10px] text-gray-400 font-mono border border-gray-200 z-[1000]">
        Sergipe, BR · aproxime o zoom para ver mais pontos
      </div>
    </div>
  );
}

function LayersPanel({ layers, setLayers }) {
  const groups = [
    { title: 'REDE', items: [{ key: 'rede', label: 'Rede de média tensão' }] },
    {
      title: 'VEGETAÇÃO',
      items: [{ key: 'pontos', label: 'Pontos de vegetação' }],
    },
    {
      title: 'OCORRÊNCIAS',
      items: [
        { key: 'desarmes', label: 'Desarmes' },
        { key: 'interrupcoes', label: 'Interrupções' },
      ],
    },
    {
      title: 'INTERVENÇÕES',
      items: [
        { key: 'pendentes', label: 'Pendentes' },
        { key: 'realizadas', label: 'Realizadas' },
      ],
    },
  ];
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="text-[10px] font-semibold text-gray-400 tracking-wide mb-1.5">
            {g.title}
          </p>
          <div className="space-y-1.5">
            {g.items.map((it) => (
              <label
                key={it.key}
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
              >
                <span
                  onClick={() =>
                    setLayers((l) => ({ ...l, [it.key]: !l[it.key] }))
                  }
                  className={`h-4 w-4 rounded flex items-center justify-center border ${
                    layers[it.key]
                      ? 'bg-gray-900 border-gray-900'
                      : 'border-gray-300'
                  }`}
                >
                  {layers[it.key] && (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  )}
                </span>
                {it.label}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PhotoCarousel({ photos, aspect = 'aspect-video' }) {
  const [idx, setIdx] = useState(0);
  if (!photos || photos.length === 0) return null;
  const prev = (e) => {
    e.stopPropagation();
    setIdx((i) => (i - 1 + photos.length) % photos.length);
  };
  const next = (e) => {
    e.stopPropagation();
    setIdx((i) => (i + 1) % photos.length);
  };

  return (
    <div
      className={`relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100 ${aspect}`}
    >
      <img
        src={photos[idx]}
        alt={`Foto ${idx + 1} de ${photos.length}`}
        className="w-full h-full object-cover"
      />
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === idx ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
          <span className="absolute top-2 right-2 rounded-full bg-black/55 text-white text-[10px] font-mono px-1.5 py-0.5">
            {idx + 1}/{photos.length}
          </span>
        </>
      )}
    </div>
  );
}

function PointPopover({ point, onClose, onDetails, isMobile }) {
  if (!point) return null;
  const c = CRIT[point.criticidade];
  const content = (
    <div className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[11px] text-gray-400 font-mono">{point.id}</p>
          <div className="mt-1">
            <CriticalityBadge level={point.criticidade} />
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 p-1">
          <X className="h-4 w-4" />
        </button>
      </div>
      {point.fotos?.length > 0 && (
        <div className="mb-3">
          <PhotoCarousel photos={point.fotos} aspect="aspect-[4/3]" />
        </div>
      )}
      <dl className="space-y-2 text-sm">
        <Row label="Tipo" value={point.tipo} />
        <Row label="Distância da rede" value={`${point.distanciaRede} m`} />
        <Row label="Última inspeção" value={point.ultimaInspecao} />
        <Row
          label="Intervenção"
          value={<StatusBadge status={point.intervencao} />}
        />
        <Row label="Ocorrências relacionadas" value={point.ocorrencias} />
      </dl>
      <button
        onClick={() => onDetails(point.id)}
        className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-md bg-gray-900 text-white text-sm font-medium py-2.5"
      >
        Ver detalhes <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-x-0 bottom-16 z-40">
        <div className="mx-3 mb-2 rounded-xl bg-white border border-gray-200 shadow-lg">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="w-80 shrink-0 rounded-lg bg-white border border-gray-200 shadow-sm h-fit">
      {content}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-gray-400">{label}</dt>
      <dd className="text-gray-800 font-medium text-right">{value}</dd>
    </div>
  );
}

/* =========================================================
   PAGES
   ========================================================= */
function DashboardPage({ points, occurrences, isMobile }) {
  const total = points.length;
  const criticos = points.filter((p) => p.criticidade === 'critica').length;
  const altos = points.filter((p) => p.criticidade === 'alta').length;
  const pendentes = points.filter((p) => p.intervencao === 'pendente').length;
  const realizadas = points.filter((p) => p.intervencao === 'concluida').length;

  const trechoCount = {};
  points.forEach((p) => {
    const weight =
      p.criticidade === 'critica' ? 3 : p.criticidade === 'alta' ? 2 : 1;
    trechoCount[p.trecho] = (trechoCount[p.trecho] || 0) + weight;
  });
  const topTrechos = Object.entries(trechoCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return ( /* TELA DO DASHBOARD */
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Monitoramento de Vegetação
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Gestão preventiva de vegetação próxima à rede de distribuição
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Pontos monitorados" value={total} icon={ListTree} />
        <KPICard
          label="Críticos"
          value={criticos}
          tone="red"
          icon={AlertTriangle}
        />
        <KPICard
          label="Alta criticidade"
          value={altos}
          tone="orange"
          icon={AlertTriangle}
        />
        <KPICard label="Pendentes" value={pendentes} icon={Wrench} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <SectionTitle>Visão geral da região</SectionTitle>
          <MapCanvas
            points={points}
            layers={{ rede: true, pontos: true }}
            onSelect={() => {}}
            height={isMobile ? 220 : 320}
          />
        </div>
        <div>
          <SectionTitle>Áreas com maior criticidade</SectionTitle>
          <div className="space-y-2">
            {topTrechos.map(([trecho, score], i) => (
              <div
                key={trecho}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-6 rounded-md bg-gray-100 text-gray-500 text-xs font-mono flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-800 font-mono">
                    Trecho {trecho}
                  </span>
                </div>
                <span className="text-xs text-gray-400">score {score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Ocorrências recentes</SectionTitle>
        <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
          {occurrences.slice(0, 4).map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-gray-400 font-mono text-xs w-20 shrink-0">
                  {o.data}
                </span>
                <span className="text-gray-800 truncate">
                  {o.local} · Trecho {o.trecho}
                </span>
                <span className="hidden md:inline text-gray-400 text-xs">
                  {o.tipo}
                </span>
              </div>
              <CriticalityBadge level={o.criticidade} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MapPage({
  points,
  selectedId,
  setSelectedId,
  isMobile,
  goDetails,
  setPage,
  nearbyMode = false,
}) {
  const [layers, setLayers] = useState({
    rede: false,
    pontos: true,
    desarmes: false,
    interrupcoes: false,
    pendentes: false,
    realizadas: false,
  });
  const [locating, setLocating] = useState(false);
  const selected = points.find((p) => p.id === selectedId);
  const criticalNearby = points
    .filter((p) => p.criticidade === 'critica' || p.criticidade === 'alta')
    .slice(0, 3);

  if (isMobile) {
    return (
      <div className="relative h-full">
        <MapCanvas
          points={points}
          layers={layers}
          onSelect={setSelectedId}
          selectedId={selectedId}
          height="100%"
          locating={locating}
        />
        <div className="absolute top-3 left-3 right-3 flex gap-2">
          <button
            onClick={() => setLocating((v) => !v)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-200 rounded-full py-2 text-xs font-medium text-gray-700 shadow-sm"
          >
            <Navigation className="h-3.5 w-3.5" /> Minha localização
          </button>
        </div>

        {!selected && (
          <div className="absolute bottom-16 inset-x-0 px-3 pb-2">
            <div className="rounded-xl bg-white border border-gray-200 shadow-lg p-3">
              <p className="text-[11px] font-semibold text-gray-400 mb-2">
                PRÓXIMOS PONTOS CRÍTICOS
              </p>
              <div className="space-y-1.5">
                {criticalNearby.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className="w-full flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          CRIT[p.criticidade].dot
                        }`}
                      />
                      <span className="font-mono text-gray-800">{p.id}</span>
                    </span>
                    <span className="text-gray-400 text-xs">
                      {(60 + Number(p.id.slice(-2))).toString()} m
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-gray-400">
                {points.filter((p) => p.intervencao === 'pendente').length}{' '}
                pontos pendentes próximos
              </p>
            </div>
          </div>
        )}
        <PointPopover
          point={selected}
          onClose={() => setSelectedId(null)}
          onDetails={goDetails}
          isMobile
        />
      </div>
    );
  }

  return ( /* Mapa da Vegetação */
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Mapa de Vegetação
          </h1>
          <p className="text-xs text-gray-400">
            24 pontos monitorados nesta visão
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLocating((v) => !v)}
            className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <Navigation className="h-4 w-4" /> Minha localização
          </button>
          <button 
            onClick={() => setPage('register')}
            className="flex items-center gap-1.5 rounded-md bg-green-700 px-3 py-2 text-sm text-white font-medium hover:bg-green-800">
            <PlusCircle className="h-4 w-4" /> Registrar vegetação
          </button>
        </div>
      </div>
      <div className="flex gap-4 flex-1 min-h-0">
        <div className="w-56 shrink-0 space-y-3 overflow-y-auto">
          <LayersPanel layers={layers} setLayers={setLayers} />
        </div>
        <div className="flex-1 min-h-0">
          <MapCanvas
            points={points}
            layers={layers}
            onSelect={setSelectedId}
            selectedId={selectedId}
            height="100%"
            locating={locating}
          />
        </div>
        {selected && (
          <PointPopover
            point={selected}
            onClose={() => setSelectedId(null)}
            onDetails={goDetails}
            isMobile={false}
          />
        )}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
const inputCls =
  'w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400';

function PhotoUploader({ photos, setPhotos }) {
  const inputRef = useRef(null);
  const MAX = 3;

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = async (fileList) => {
    const remaining = MAX - photos.length;
    const files = Array.from(fileList).slice(0, remaining);
    const dataUrls = await Promise.all(files.map(fileToDataUrl));
    setPhotos((prev) => [...prev, ...dataUrls].slice(0, MAX));
  };

  return (
    <div>
      {photos.length < MAX && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-8 text-gray-400 hover:border-gray-300"
        >
          <Camera className="h-6 w-6" strokeWidth={1.5} />
          <span className="text-xs">
            Toque para adicionar fotografia ({photos.length}/{MAX})
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      {photos.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {photos.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-md overflow-hidden border border-gray-200"
            >
              <img
                src={src}
                alt={`Foto ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setPhotos((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const RISCO_TO_CRIT = {
  baixo: 'baixa',
  moderado: 'moderada',
  alto: 'alta',
  critico: 'critica',
};

function RegisterPage({ isMobile, onRegister }) {
  const [risco, setRisco] = useState('moderado');
  const [lat, setLat] = useState('-10.94720');
  const [lng, setLng] = useState('-37.07310');
  const [locStatus, setLocStatus] = useState(null); // null | "loading" | "ok" | "erro"
  const [tipo, setTipo] = useState(TIPOS_VEG[0]);
  const [porte, setPorte] = useState('Médio');
  const [altura, setAltura] = useState('');
  const [estado, setEstado] = useState(ESTADOS_VEG[0]);
  const [distanciaRede, setDistanciaRede] = useState('');
  const [tipoRede, setTipoRede] = useState('Média tensão');
  const [trecho, setTrecho] = useState(TRECHOS[0]);
  const [alimentador, setAlimentador] = useState('');
  const [municipio, setMunicipio] = useState(MUNICIPIOS[0]);
  const [possuiOcorrencia, setPossuiOcorrencia] = useState(false);
  const [numOcorrencias, setNumOcorrencias] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [photos, setPhotos] = useState([]);

  const riscos = [
    { key: 'baixo', label: 'Baixo', cls: CRIT.baixa },
    { key: 'moderado', label: 'Moderado', cls: CRIT.moderada },
    { key: 'alto', label: 'Alto', cls: CRIT.alta },
    { key: 'critico', label: 'Crítico', cls: CRIT.critica },
  ];

  const usarLocalizacao = () => {
    if (!navigator.geolocation) {
      setLocStatus('erro');
      return;
    }
    setLocStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(5));
        setLng(pos.coords.longitude.toFixed(5));
        setLocStatus('ok');
      },
      () => setLocStatus('erro'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = () => {
    const hoje = new Date().toLocaleDateString('pt-BR');
    const newPoint = {
      id: `VEG-${Date.now().toString().slice(-6)}`,
      lat,
      lng,
      criticidade: RISCO_TO_CRIT[risco],
      tipo,
      porte,
      altura: altura || '-',
      estado,
      distanciaRede: distanciaRede || '-',
      tipoRede,
      trecho,
      alimentador: alimentador || '-',
      municipio,
      ocorrencias: possuiOcorrencia ? Number(numOcorrencias) || 0 : 0,
      intervencao: 'pendente',
      ultimaInspecao: hoje,
      observacoes:
        observacoes ||
        'Ponto identificado durante inspeção de rotina do trecho.',
      fotos: photos,
    };
    onRegister(newPoint);
  };

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 pb-28 md:pb-6">
      <h1 className="text-lg font-semibold text-gray-900">
        Registrar Vegetação
      </h1>
      <p className="text-xs text-gray-400 mb-5">
        Preencha os dados do ponto identificado em campo
      </p>

      <div className="space-y-5">
        <section>
          <p className="text-[11px] font-semibold text-gray-400 mb-2">
            LOCALIZAÇÃO
          </p>
          <button
            type="button"
            onClick={usarLocalizacao}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 py-3 text-sm text-gray-600 mb-2 disabled:opacity-60"
            disabled={locStatus === 'loading'}
          >
            <Navigation className="h-4 w-4" />
            {locStatus === 'loading'
              ? 'Buscando localização...'
              : 'Usar localização automática'}
          </button>
          {locStatus === 'ok' && (
            <p className="text-[11px] text-green-600 mb-2">
              Localização capturada com sucesso.
            </p>
          )}
          {locStatus === 'erro' && (
            <p className="text-[11px] text-red-500 mb-2">
              Não foi possível obter a localização automática. Preencha
              manualmente abaixo.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Latitude">
              <input
                className={inputCls}
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
            </FormField>
            <FormField label="Longitude">
              <input
                className={inputCls}
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
            </FormField>
          </div>
        </section>

        <section>
          <p className="text-[11px] font-semibold text-gray-400 mb-2">
            VEGETAÇÃO
          </p>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Tipo">
              <select
                className={inputCls}
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                {TIPOS_VEG.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Porte">
              <select
                className={inputCls}
                value={porte}
                onChange={(e) => setPorte(e.target.value)}
              >
                <option>Pequeno</option>
                <option>Médio</option>
                <option>Grande</option>
              </select>
            </FormField>
            <FormField label="Altura aproximada (m)">
              <input
                type="number"
                className={inputCls}
                placeholder="ex: 6.5"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
              />
            </FormField>
            <FormField label="Estado">
              <select
                className={inputCls}
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                {ESTADOS_VEG.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="mt-2">
            <FormField label="Distância aproximada da rede (m)">
              <input
                type="number"
                className={inputCls}
                placeholder="ex: 2.4"
                value={distanciaRede}
                onChange={(e) => setDistanciaRede(e.target.value)}
              />
            </FormField>
          </div>
        </section>

        <section>
          <p className="text-[11px] font-semibold text-gray-400 mb-2">REDE</p>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Tipo de rede">
              <select
                className={inputCls}
                value={tipoRede}
                onChange={(e) => setTipoRede(e.target.value)}
              >
                <option>Média tensão</option>
                <option>Baixa tensão</option>
              </select>
            </FormField>
            <FormField label="Trecho">
              <select
                className={inputCls}
                value={trecho}
                onChange={(e) => setTrecho(e.target.value)}
              >
                {TRECHOS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <FormField label="Alimentador">
              <input
                className={inputCls}
                placeholder="ex: ALM-30"
                value={alimentador}
                onChange={(e) => setAlimentador(e.target.value)}
              />
            </FormField>
            <FormField label="Município">
              <select
                className={inputCls}
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
              >
                {MUNICIPIOS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </FormField>
          </div>
        </section>

        <section>
          <p className="text-[11px] font-semibold text-gray-400 mb-2">RISCO</p>
          <div className="grid grid-cols-4 gap-2">
            {riscos.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRisco(r.key)}
                className={`rounded-md border py-2.5 text-xs font-semibold flex flex-col items-center gap-1 ${
                  risco === r.key
                    ? `${r.cls.border} ${r.cls.bg} ${r.cls.text}`
                    : 'border-gray-200 text-gray-400'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${r.cls.dot}`} />
                {r.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="text-[11px] font-semibold text-gray-400 mb-2">
            OCORRÊNCIA
          </p>
          <FormField label="Possui histórico de ocorrência?">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPossuiOcorrencia(false)}
                className={`flex-1 rounded-md border py-2 text-sm ${
                  !possuiOcorrencia
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                Não
              </button>
              <button
                type="button"
                onClick={() => setPossuiOcorrencia(true)}
                className={`flex-1 rounded-md border py-2 text-sm ${
                  possuiOcorrencia
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                Sim
              </button>
            </div>
          </FormField>
          {possuiOcorrencia && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <FormField label="Número de ocorrências">
                <input
                  type="number"
                  className={inputCls}
                  placeholder="0"
                  value={numOcorrencias}
                  onChange={(e) => setNumOcorrencias(e.target.value)}
                />
              </FormField>
            </div>
          )}
          <div className="mt-2">
            <FormField label="Observações">
              <textarea
                rows={3}
                className={inputCls}
                placeholder="Detalhes adicionais sobre o ponto..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </FormField>
          </div>
        </section>

        <section>
          <p className="text-[11px] font-semibold text-gray-400 mb-2">
            FOTOS (até 3)
          </p>
          <PhotoUploader photos={photos} setPhotos={setPhotos} />
        </section>
      </div>

      {isMobile ? (
        <div className="fixed bottom-16 inset-x-0 bg-white border-t border-gray-200 p-3 flex gap-2 z-20">
          <button className="flex-1 rounded-md border border-gray-200 py-3 text-sm font-medium text-gray-600">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-md bg-green-700 py-3 text-sm font-semibold text-white"
          >
            Registrar ponto
          </button>
        </div>
      ) : (
        <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
          <button className="flex-1 rounded-md border border-gray-200 py-3 text-sm font-medium text-gray-600">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-md bg-green-700 py-3 text-sm font-semibold text-white"
          >
            Registrar ponto
          </button>
        </div>
      )}
    </div>
  );
}

function PointsPage({ points, goDetails, isMobile }) {
  const [filter, setFilter] = useState('todos');
  const filtered =
    filter === 'todos'
      ? points
      : points.filter((p) => p.criticidade === filter);

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-lg font-semibold text-gray-900">
          Pontos de Vegetação
        </h1>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        {filtered.length} pontos encontrados
      </p>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-1 -mx-1 px-1">
        {['todos', ...CRIT_ORDER].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border ${
              filter === f
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-500'
            }`}
          >
            {f === 'todos' ? 'Todos' : CRIT[f].label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => goDetails(p.id)}
            className="text-left rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono text-xs text-gray-400">{p.id}</span>
              <CriticalityBadge level={p.criticidade} />
            </div>
            <p className="text-sm font-medium text-gray-800">{p.tipo}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Trecho {p.trecho} · {p.municipio}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
              <span>{p.distanciaRede} m da rede</span>
              <StatusBadge status={p.intervencao} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailPage({ point, onBack }) {
  if (!point)
    return (
      <div className="p-6">
        <EmptyState label="Selecione um ponto para ver os detalhes" />
      </div>
    );
  const timeline = [
    { data: point.ultimaInspecao, texto: 'Ponto cadastrado' },
    { data: '20/08/2026', texto: 'Inspeção realizada' },
    {
      data: '25/08/2026',
      texto:
        point.intervencao === 'concluida'
          ? 'Intervenção concluída'
          : 'Intervenção programada',
    },
  ];
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24 md:pb-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="font-mono text-sm text-gray-400">{point.id}</p>
          <h1 className="text-lg font-semibold text-gray-900">{point.tipo}</h1>
        </div>
        <CriticalityBadge level={point.criticidade} size="lg" />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-5">
        <div className="md:col-span-2 space-y-4">
          {point.fotos?.length > 0 ? (
            <PhotoCarousel photos={point.fotos} aspect="aspect-video" />
          ) : (
            <div className="rounded-lg bg-gray-100 aspect-video flex items-center justify-center border border-gray-200">
              <Camera className="h-8 w-8 text-gray-300" strokeWidth={1.2} />
            </div>
          )}
          <MapCanvas
            points={[point]}
            layers={{ rede: true, pontos: true }}
            onSelect={() => {}}
            selectedId={point.id}
            height={220}
          />

          <div>
            <SectionTitle>Linha do tempo</SectionTitle>
            <div className="space-y-0">
              {timeline.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-900 mt-1" />
                    {i < timeline.length - 1 && (
                      <span className="w-px flex-1 bg-gray-200" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs text-gray-400 font-mono">{t.data}</p>
                    <p className="text-sm text-gray-700">{t.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[11px] font-semibold text-gray-400 mb-2">
              DADOS DA VEGETAÇÃO
            </p>
            <dl className="space-y-2 text-sm">
              <Row label="Porte" value={point.porte} />
              <Row label="Altura" value={`${point.altura} m`} />
              <Row label="Estado" value={point.estado} />
              <Row
                label="Distância da rede"
                value={`${point.distanciaRede} m`}
              />
            </dl>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[11px] font-semibold text-gray-400 mb-2">
              DADOS DA REDE
            </p>
            <dl className="space-y-2 text-sm">
              <Row label="Tipo" value={point.tipoRede} />
              <Row label="Trecho" value={point.trecho} />
              <Row label="Alimentador" value={point.alimentador} />
              <Row label="Município" value={point.municipio} />
            </dl>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[11px] font-semibold text-gray-400 mb-2">
              STATUS
            </p>
            <dl className="space-y-2 text-sm">
              <Row
                label="Intervenção"
                value={<StatusBadge status={point.intervencao} />}
              />
              <Row label="Ocorrências relacionadas" value={point.ocorrencias} />
              <Row label="Última inspeção" value={point.ultimaInspecao} />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function OccurrencesPage({ occurrences }) {
  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6">
      <h1 className="text-lg font-semibold text-gray-900 mb-1">
        Ocorrências / Desarmes
      </h1>
      <p className="text-xs text-gray-400 mb-4">
        Eventos de rede relacionados à vegetação
      </p>

      <div className="flex gap-2 overflow-x-auto mb-4">
        {['Período', 'Município', 'Trecho', 'Criticidade', 'Causa'].map((f) => (
          <button
            key={f}
            className="shrink-0 flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600"
          >
            <Filter className="h-3 w-3" /> {f}{' '}
            <ChevronDown className="h-3 w-3" />
          </button>
        ))}
      </div>

      <div className="hidden md:block rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide">
            <tr>
              {[
                'Data',
                'Local',
                'Trecho',
                'Tipo',
                'Causa',
                'Duração',
                'Criticidade',
              ].map((h) => (
                <th key={h} className="text-left font-medium px-4 py-2.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {occurrences.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  {o.data}
                </td>
                <td className="px-4 py-3 text-gray-800">{o.local}</td>
                <td className="px-4 py-3 font-mono text-gray-500">
                  {o.trecho}
                </td>
                <td className="px-4 py-3 text-gray-600">{o.tipo}</td>
                <td className="px-4 py-3 text-gray-600">{o.causa}</td>
                <td className="px-4 py-3 text-gray-500">{o.duracao}</td>
                <td className="px-4 py-3">
                  <CriticalityBadge level={o.criticidade} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-2">
        {occurrences.map((o) => (
          <div
            key={o.id}
            className="rounded-lg border border-gray-200 bg-white p-3"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs text-gray-400">{o.data}</span>
              <CriticalityBadge level={o.criticidade} />
            </div>
            <p className="text-sm font-medium text-gray-800">
              {o.tipo} · Trecho {o.trecho}
            </p>
            <p className="text-xs text-gray-400">
              {o.local} · {o.causa} · {o.duracao}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InterventionsPage({ interventions }) {
  const cols = ['pendente', 'programada', 'execucao', 'concluida'];
  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6">
      <h1 className="text-lg font-semibold text-gray-900 mb-1">Intervenções</h1>
      <p className="text-xs text-gray-400 mb-5">
        Poda e manutenção preventiva de vegetação
      </p>

      <div className="grid md:grid-cols-4 gap-4">
        {cols.map((status) => (
          <div key={status}>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[status].bg} ring-2 ring-offset-1`}
              />
              <p className="text-xs font-semibold text-gray-500">
                {STATUS_STYLE[status].label}
              </p>
              <span className="text-[10px] text-gray-300 font-mono">
                {interventions.filter((i) => i.status === status).length}
              </span>
            </div>
            <div className="space-y-2">
              {interventions
                .filter((i) => i.status === status)
                .map((it) => (
                  <div
                    key={it.id}
                    className="rounded-lg border border-gray-200 bg-white p-3"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs text-gray-400">
                        {it.ponto}
                      </span>
                      <CriticalityBadge level={it.criticidade} />
                    </div>
                    <p className="text-sm text-gray-800">{it.tipo}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {it.local} · Trecho {it.trecho}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      Previsto: {it.dataPrevista}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="p-4 md:p-6 max-w-2xl pb-24 md:pb-6">
      <h1 className="text-lg font-semibold text-gray-900 mb-1">
        Configurações
      </h1>
      <p className="text-xs text-gray-400 mb-5">
        Preferências do sistema e integrações
      </p>

      <div className="rounded-lg border border-gray-200 bg-white p-4 mb-4">
        <div className="flex items-center gap-3 mb-1">
          <RadioTower className="h-4 w-4 text-gray-400" />
          <p className="text-sm font-medium text-gray-800">
            Rede elétrica (KMZ)
          </p>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Importe o arquivo KMZ com a rede de média tensão para exibição no
          mapa.
        </p>
        <button className="flex items-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-500">
          <FileUp className="h-4 w-4" /> Importar KMZ
        </button>
        <p className="mt-2 text-[11px] text-gray-300">
          Processamento será habilitado na Fase 3.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 mb-4">
        <div className="flex items-center gap-3 mb-1">
          <Zap className="h-4 w-4 text-gray-400" />
          <p className="text-sm font-medium text-gray-800">
            Alimentadores e trechos
          </p>
        </div>
        <p className="text-xs text-gray-400">
          Gestão de cadastro de alimentadores — habilitado após integração com
          API.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3 mb-1">
          <ClipboardList className="h-4 w-4 text-gray-400" />
          <p className="text-sm font-medium text-gray-800">
            Roadmap do produto
          </p>
        </div>
        <ul className="mt-2 space-y-1 text-xs text-gray-500">
          {[
            'Mapa real (Leaflet/MapLibre)',
            'Importação KMZ',
            'GPS do dispositivo',
            'Banco de dados',
            'API',
            'Fotos',
            'Criticidade automática',
            'Histórico de desarmes',
            'Análise espacial',
          ].map((f, i) => (
            <li key={f} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-gray-300" /> Fase {i + 2}
              : {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* =========================================================
   APP
   ========================================================= */
export default function App() {
  const isMobile = useIsMobile();
  const [page, setPage] = useState('map');
  const [selectedId, setSelectedId] = useState(null);

  const [points, setPoints] = useState(() => generatePoints());
  const occurrences = useMemo(() => generateOccurrences(points), []);
  const interventions = useMemo(() => generateInterventions(points), []);
  const [extraInterventions, setExtraInterventions] = useState([]);

  const goDetails = (id) => {
    setSelectedId(id);
    setPage('detail');
  };
  const selectedPoint = points.find((p) => p.id === selectedId);

  const handleRegister = (newPoint) => {
    setPoints((prev) => [...prev, newPoint]);
    setExtraInterventions((prev) => [
      ...prev,
      {
        id: `INT-${newPoint.id}`,
        ponto: newPoint.id,
        local: newPoint.municipio,
        trecho: newPoint.trecho,
        criticidade: newPoint.criticidade,
        tipo:
          newPoint.criticidade === 'critica'
            ? 'Poda emergencial'
            : newPoint.criticidade === 'alta'
            ? 'Poda programada'
            : 'Poda de manutenção',
        dataPrevista: newPoint.ultimaInspecao,
        status: 'pendente',
      },
    ]);
    setSelectedId(newPoint.id);
    setPage('map');
  };

  const titles = {
    dashboard: ['Dashboard', null],
    map: ['Mapa de Vegetação', null],
    register: ['Registrar Vegetação', null],
    points: ['Pontos de Vegetação', null],
    detail: [
      selectedPoint ? selectedPoint.id : 'Detalhes',
      'Detalhes do ponto',
    ],
    interventions: ['Intervenções', null],
    occurrences: ['Ocorrências / Desarmes', null],
    settings: ['Configurações', null],
  };

  return (
    <div className="h-screen bg-gray-50 text-gray-900 font-sans flex overflow-hidden">
      {!isMobile && <Sidebar page={page} setPage={setPage} />}

      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <Header
          title={titles[page][0]}
          subtitle={titles[page][1]}
          isMobile={isMobile}
          onMenu={() => setPage('dashboard')}
        />

        <div className="flex-1 overflow-y-auto">
          {page === 'dashboard' && (
            <DashboardPage
              points={points}
              occurrences={occurrences}
              isMobile={isMobile}
            />
          )}
          {page === 'map' && (
            <MapPage
              points={points}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              isMobile={isMobile}
              goDetails={goDetails}
              setPage={setPage}
            />
          )}
          {page === 'register' && (
            <RegisterPage isMobile={isMobile} onRegister={handleRegister} />
          )}
          {page === 'points' && (
            <PointsPage
              points={points}
              goDetails={goDetails}
              isMobile={isMobile}
            />
          )}
          {page === 'detail' && (
            <DetailPage
              point={selectedPoint}
              onBack={() => setPage('points')}
            />
          )}
          {page === 'interventions' && (
            <InterventionsPage
              interventions={[...interventions, ...extraInterventions]}
            />
          )}
          {page === 'occurrences' && (
            <OccurrencesPage occurrences={occurrences} />
          )}
          {page === 'settings' && <SettingsPage />}
        </div>
      </div>

      {isMobile && <BottomNav page={page} setPage={setPage} />}
    </div>
  );
}
