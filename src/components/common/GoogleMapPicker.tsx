
'use client';

import * as React from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from '@react-google-maps/api';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/lib/types';
import { LocateFixed } from 'lucide-react';
import { Input } from '../ui/input';

const containerStyle = {
  width: '100%',
  height: '300px',
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
        <div className="flex flex-col items-center justify-center h-[300px] text-center p-4 bg-muted rounded-md">
            <h3 className="text-lg font-semibold text-destructive">Google Maps API Key Missing</h3>
            <p className="text-sm text-muted-foreground mt-2">Please provide a valid NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file to use this feature.</p>
        </div>
    );
  }

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places'],
  });

  const [markerPosition, setMarkerPosition] = React.useState<google.maps.LatLngLiteral | null>(null);
  const [currentLocation, setCurrentLocation] = React.useState<google.maps.LatLngLiteral | null>(null);
  const [isGeocoding, setIsGeocoding] = React.useState(false);
  const [autocomplete, setAutocomplete] = React.useState<google.maps.places.Autocomplete | null>(null);
  
  const mapRef = React.useRef<google.maps.Map | null>(null);
  const watchIdRef = React.useRef<number | null>(null);
  const initialLocationSetRef = React.useRef(false);


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
  
  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map;
    initialLocationSetRef.current = false;

    if (navigator.geolocation) {
        toast({ title: 'Locating you...', description: 'Getting an accurate position...' });

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                
                setCurrentLocation(pos);

                if (!initialLocationSetRef.current && mapRef.current) {
                    mapRef.current.panTo(pos);
                    mapRef.current.setZoom(17);
                    setMarkerPosition(pos);
                    initialLocationSetRef.current = true;
                    toast({ title: 'Location Found!', description: 'Your blue dot location will refine. You can adjust the pin.' });
                }
            },
            () => {
                if (!initialLocationSetRef.current) {
                    toast({ variant: 'destructive', title: 'Could not get location', description: 'Please grant location permissions or set manually.' });
                    map.setCenter(defaultCenter);
                    setMarkerPosition(defaultCenter);
                    initialLocationSetRef.current = true;
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        toast({ variant: 'destructive', title: 'Geolocation not supported', description: 'Defaulting to Kathmandu.' });
        map.setCenter(defaultCenter);
        setMarkerPosition(defaultCenter);
    }
}, [toast]);


  const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    mapRef.current = null;
  }, []);

  const handleUseCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.panTo(currentLocation);
      mapRef.current.setZoom(17);
      setMarkerPosition(currentLocation);
      toast({ title: 'Location centered', description: 'Marker moved to your last known location.' });
    } else {
      toast({
        variant: 'destructive',
        title: 'Location not available',
        description: 'Could not get your location yet. Please check permissions.',
      });
    }
  };
  
  const onAutocompleteLoad = React.useCallback((ac: google.maps.places.Autocomplete) => {
    setAutocomplete(ac);
  }, []);

  const onPlaceChanged = React.useCallback(() => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const newPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        if (mapRef.current) {
          mapRef.current.panTo(newPos);
          mapRef.current.setZoom(17);
        }
        setMarkerPosition(newPos);
      } else {
         toast({ variant: 'destructive', title: 'Invalid location', description: 'Please select a valid location from the list.' });
      }
    } else {
      console.error('Autocomplete is not loaded yet!');
    }
  }, [autocomplete, toast]);


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
            const addressComponents = resultAddress.address_components;
            const parsedAddress: Partial<Address> = {};
            
            const get = (type: string, useShortName = false): string => {
              const component = addressComponents.find(c => c.types.includes(type));
              return component ? (useShortName ? component.short_name : component.long_name) : '';
            };

            const streetNumber = get('street_number');
            const route = get('route');
            const neighborhood = get('neighborhood');
            const sublocality = get('sublocality_level_1');

            const streetParts = [streetNumber, route, neighborhood, sublocality].filter(Boolean);
            let street = streetParts.join(', ');
            
            if (!street && resultAddress.formatted_address) {
                street = resultAddress.formatted_address.split(',')[0];
            }

            parsedAddress.street = street;
            parsedAddress.city = get('locality') || get('administrative_area_level_2');
            parsedAddress.state = get('administrative_area_level_1', true);
            parsedAddress.zip = get('postal_code');
            parsedAddress.country = get('country');
            parsedAddress.googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${markerPosition.lat},${markerPosition.lng}`;
            
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
       <Autocomplete
        onLoad={onAutocompleteLoad}
        onPlaceChanged={onPlaceChanged}
        className="w-full"
      >
        <Input
          type="text"
          placeholder="Search for a location..."
          className="w-full"
        />
      </Autocomplete>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
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
      <p className="text-xs text-muted-foreground text-center">
        Your blue dot location will refine over time. Drag the red pin to the exact spot.
      </p>
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
    <Skeleton className="h-[368px] w-full" />
  );
}
