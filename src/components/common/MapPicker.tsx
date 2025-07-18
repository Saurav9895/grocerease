'use client';

import type { LatLng } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as React from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { Button } from '../ui/button';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationMarkerProps {
  position: LatLng | null;
  setPosition: React.Dispatch<React.SetStateAction<LatLng | null>>;
}

function LocationMarker({ position, setPosition }: LocationMarkerProps) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  React.useEffect(() => {
    if (!position) {
      map.locate().on('locationfound', function (e) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      });
    }
  }, [map, position, setPosition]);

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => setPosition(e.target.getLatLng())
      }}
    />
  );
}

export interface MapPickerProps {
  onConfirm: (position: LatLng) => void;
}

export function MapPicker({ onConfirm }: MapPickerProps) {
  const [position, setPosition] = React.useState<LatLng | null>(null);

  // Use a dynamic key to force MapContainer remount if needed
  const mapKey = position ? `${position.lat}-${position.lng}` : 'default';

  return (
    <div className="space-y-4">
      <MapContainer
        key={mapKey} // ensure remounting and cleanup
        center={[27.7172, 85.3240]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-[400px] w-full rounded-md border z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      <Button
        onClick={() => position && onConfirm(position)}
        disabled={!position}
        className="w-full"
      >
        Confirm Location
      </Button>
    </div>
  );
}
