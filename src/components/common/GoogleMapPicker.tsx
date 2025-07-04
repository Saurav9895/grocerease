'use client';

import * as React from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
} from '@react-google-maps/api';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/lib/types';
import { LocateFixed } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

// Default center (Kathmandu)
const defaultCenter = {
  lat: 27.7172,
  lng: 85.324,
};

interface GoogleMapPickerProps {
  onConfirm: (address: Partial<Address>) => void;
  onClose: () => void;
}

export function GoogleMapPicker({ onConfirm, onClose }: GoogleMapPickerProps) {
  const { toast } = useToast();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
        <div className="flex flex-col items-center justify-center h-[400px] text-center p-4 bg-muted rounded-md">
            <h3 className="text-lg font-semibold text-destructive">Google Maps API Key Missing</h3>
            <p className="text-sm text-muted-foreground mt-2">Please provide a valid NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file to use this feature.</p>
        </div>
    );
  }

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  const [markerPosition, setMarkerPosition] = React.useState<google.maps.LatLngLiteral | null>(null);
  const [currentLocation, setCurrentLocation] = React.useState<google.maps.LatLngLiteral | null>(null);
  const [isGeocoding, setIsGeocoding] = React.useState(false);

  const blueDotSvg = `
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#4285F4" fill-opacity="0.2"/>
      <circle cx="12" cy="12" r="5" fill="#4285F4" stroke="white" stroke-width="2"/>
  </svg>`;

  const blueDotIcon = isLoaded ? {
      url: `data:image/svg+xml;base64,${btoa(blueDotSvg)}`,
      anchor: new window.google.maps.Point(12, 12),
      scaledSize: new window.google.maps.Size(24, 24),
  } : undefined;

  const handleMapClick = React.useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      setMarkerPosition({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    }
  }, []);
  
  const mapRef = React.useRef<google.maps.Map | null>(null);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map;
    // Try to get user's current location on load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(pos);
          setMarkerPosition(pos);
          setCurrentLocation(pos);
        },
        () => {
          // Error or permission denied, use default center
           map.setCenter(defaultCenter);
           setMarkerPosition(defaultCenter);
        }
      );
    } else {
      // Browser doesn't support Geolocation
       map.setCenter(defaultCenter);
       setMarkerPosition(defaultCenter);
    }
  }, []);

  const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
    mapRef.current = null;
  }, []);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          if (mapRef.current) {
            mapRef.current.panTo(pos);
            mapRef.current.setZoom(15);
          }
          setMarkerPosition(pos);
          setCurrentLocation(pos);
          toast({ title: 'Location updated', description: 'Marker moved to your current location.' });
        },
        () => {
          toast({
            variant: 'destructive',
            title: 'Geolocation failed',
            description: 'Could not get your location. Please check your browser permissions.',
          });
        }
      );
    } else {
      toast({
        variant: 'destructive',
        title: 'Geolocation not supported',
        description: 'Your browser does not support a geolocation service.',
      });
    }
  };

  const handleConfirm = () => {
    if (!markerPosition) {
        toast({ variant: 'destructive', title: "No location selected", description: "Please place a marker on the map." });
        return;
    }
    
    setIsGeocoding(true);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: markerPosition }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
            const resultAddress = results[0];
            const parsedAddress: Partial<Address> = {};
            
            let streetNumber = '';
            let route = '';

            resultAddress.address_components.forEach(component => {
                const types = component.types;
                if (types.includes('street_number')) streetNumber = component.long_name;
                if (types.includes('route')) route = component.long_name;
                if (types.includes('locality')) parsedAddress.city = component.long_name;
                if (types.includes('administrative_area_level_1')) parsedAddress.state = component.short_name;
                if (types.includes('country')) parsedAddress.country = component.long_name;
                if (types.includes('postal_code')) parsedAddress.zip = component.long_name;
            });
            parsedAddress.street = `${streetNumber} ${route}`.trim();
            
            onConfirm(parsedAddress);
            onClose();
        } else {
            console.error('Geocode was not successful for the following reason: ' + status);
            toast({ variant: 'destructive', title: "Could not find address", description: "Please try a different location." });
        }
        setIsGeocoding(false);
    });
  };

  if (loadError) {
      return <div className="text-center p-4">Error loading maps. Check your API key and network connection.</div>;
  }

  return isLoaded ? (
    <div className="space-y-4">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
      >
        {currentLocation && (
          <Marker position={currentLocation} icon={blueDotIcon} zIndex={1} />
        )}
        {markerPosition && <Marker position={markerPosition} draggable={true} onDragEnd={handleMapClick} zIndex={2} />}
      </GoogleMap>
       <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={handleUseCurrentLocation}>
          <LocateFixed className="mr-2 h-4 w-4" />
          Use My Location
        </Button>
        <Button onClick={handleConfirm} disabled={!markerPosition || isGeocoding}>
          {isGeocoding ? "Finding Address..." : "Confirm Location"}
        </Button>
      </div>
    </div>
  ) : (
    <Skeleton className="h-[400px] w-full" />
  );
}
