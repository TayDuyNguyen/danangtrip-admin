import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Fix Leaflet icon issue in React
// @ts-expect-error: Leaflet icon prototype fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapPickerProps {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number) => void;
    address?: string;
}

const DANANG_CENTER: [number, number] = [16.0544, 108.2022];

function LocationMarker({ position, setPosition }: { position: L.LatLngExpression, setPosition: (pos: L.LatLng) => void }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position ? <Marker position={position} /> : null;
}

function ChangeView({ center }: { center: L.LatLngExpression }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

const MapPicker = ({ lat, lng, onChange, address }: MapPickerProps) => {
    const { t } = useTranslation('location');
    const [position, setPosition] = useState<L.LatLngExpression>(
        lat && lng ? [lat, lng] : DANANG_CENTER
    );

    const handleSetPosition = useCallback((newPos: L.LatLng) => {
        setPosition([newPos.lat, newPos.lng]);
        onChange(newPos.lat, newPos.lng);
    }, [onChange]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Navigation className="w-4 h-4 text-[#14b8a6]" />
                    <span>{t('form.map.helper')}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1">
                        <span className="text-slate-400">LAT:</span>
                        <span className="text-slate-700 font-bold">{lat?.toFixed(6) || '—'}</span>
                    </div>
                    <div className="w-px h-3 bg-slate-300" />
                    <div className="flex items-center gap-1">
                        <span className="text-slate-400">LNG:</span>
                        <span className="text-slate-700 font-bold">{lng?.toFixed(6) || '—'}</span>
                    </div>
                </div>
            </div>

            <div className="relative h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner group">
                <MapContainer
                    center={position}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="h-full w-full z-10"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={handleSetPosition} />
                    <ChangeView center={position} />
                </MapContainer>
                
                {/* Overlay buttons or info can go here */}
                <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setPosition(DANANG_CENTER);
                            onChange(DANANG_CENTER[0], DANANG_CENTER[1]);
                        }}
                        className="p-2 bg-white rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-[#14b8a6] transition-colors"
                        title="Reset to Da Nang Center"
                    >
                        <MapPin className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {address && (
                <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-600 italic">
                    <Info className="w-5 h-5 text-[#14b8a6] shrink-0 mt-0.5" />
                    <span>{address}</span>
                </div>
            )}
        </div>
    );
};

export default MapPicker;
