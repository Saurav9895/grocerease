
'use client';

import * as React from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Autocomplete,
  MarkerF,
} from '@react-google-maps/api';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/lib/types';
import { ArrowLeft, LocateFixed, MapPin, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader } from '../ui/card';
import { cn } from '@/lib/utils';

// Default center (Kathmandu)
const defaultCenter = {
  lat: 27.7172,
  lng: 85.324,
};

interface GoogleMapPickerProps {
  onConfirm: (address: Partial<Address>) => void;
  onClose: () => void;
}

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
}


export function GoogleMapPicker({ onConfirm, onClose }: GoogleMapPickerProps) {
  const { toast } = useToast();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places', 'geocoding'],
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = React.useState<google.maps.places.Autocomplete | null>(null);

  const [displayAddress, setDisplayAddress] = React.useState<string>('Move the map to select your address');
  const [selectedAddressDetails, setSelectedAddressDetails] = React.useState<Partial<Address> | null>(null);
  const [isGeocoding, setIsGeocoding] = React.useState(false);
  const [isLocating, setIsLocating] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<'map' | 'search'>('map');
  const [currentUserPosition, setCurrentUserPosition] = React.useState<google.maps.LatLngLiteral | null>(null);


  const mapRef = React.useRef<google.maps.Map | null>(null);

  const parseAddressComponents = (components: google.maps.GeocoderAddressComponent[]): Partial<Address> => {
      const parsed: Partial<Address> = {};
      const get = (type: string, useShortName = false): string => {
        const component = components.find(c => c.types.includes(type));
        return component ? (useShortName ? component.short_name : component.long_name) : '';
      };
      
      const streetNumber = get('street_number');
      const route = get('route');
      parsed.street = [streetNumber, route].filter(Boolean).join(' ');
      parsed.city = get('locality') || get('administrative_area_level_2');
      parsed.state = get('administrative_area_level_1', true);
      parsed.zip = get('postal_code');
      parsed.country = get('country');
      return parsed;
  }
  
  const reverseGeocode = React.useCallback(async (latLng: google.maps.LatLng) => {
    if (!isLoaded) return;
    setIsGeocoding(true);
    const geocoder = new window.google.maps.Geocoder();
    try {
      const { results } = await geocoder.geocode({ location: latLng });
      if (results && results[0]) {
        setDisplayAddress(results[0].formatted_address);
        const parsed = parseAddressComponents(results[0].address_components);
        setSelectedAddressDetails({
          ...parsed,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${latLng.lat()},${latLng.lng()}`,
        });
      } else {
        setDisplayAddress('Address not found. Please try another location.');
        setSelectedAddressDetails(null);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setDisplayAddress('Could not fetch address. Please check your connection.');
      setSelectedAddressDetails(null);
    } finally {
      setIsGeocoding(false);
    }
  }, [isLoaded]);

  const debouncedReverseGeocode = React.useMemo(() => debounce(reverseGeocode, 500), [reverseGeocode]);

  const handleMapIdle = React.useCallback(() => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      if (center) {
        debouncedReverseGeocode(center);
      }
    }
  }, [debouncedReverseGeocode]);
  
  const onLoad = React.useCallback(function callback(mapInstance: google.maps.Map) {
    mapRef.current = mapInstance;
    setMap(mapInstance);
    setIsLocating(true);
    toast({ title: 'Locating you...', description: 'Getting an accurate position.' });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setCurrentUserPosition(pos);
                mapInstance.setCenter(pos);
                mapInstance.setZoom(17);
                toast({ title: 'Location Found!', description: 'You can now fine-tune your address.' });
                handleMapIdle(); // Initial geocode
                setIsLocating(false);
            },
            () => {
                toast({ variant: 'destructive', title: 'Could not get location', description: 'Defaulting to city center. Please move the map.' });
                mapInstance.setCenter(defaultCenter);
                handleMapIdle();
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    } else {
        toast({ variant: 'destructive', title: 'Geolocation not supported' });
        mapInstance.setCenter(defaultCenter);
        handleMapIdle();
        setIsLocating(false);
    }
  }, [toast, handleMapIdle]);


  const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
    mapRef.current = null;
    setMap(null);
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
        toast({ variant: 'destructive', title: 'Geolocation not supported' });
        return;
    }
    
    setIsLocating(true);
    toast({ title: 'Getting your location...' });

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            setCurrentUserPosition(pos);
            mapRef.current?.panTo(pos);
            mapRef.current?.setZoom(17);
            setIsLocating(false);
        },
        () => {
            toast({ variant: 'destructive', title: 'Could not get location', description: 'Please grant location permissions.' });
            setIsLocating(false);
        }
    );
  };
  
  const onAutocompleteLoad = React.useCallback((ac: google.maps.places.Autocomplete) => {
    setAutocomplete(ac);
  }, []);

  const onPlaceChanged = React.useCallback(() => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        mapRef.current?.panTo(place.geometry.location);
        mapRef.current?.setZoom(17);
        setViewMode('map');
      } else {
          toast({ variant: 'destructive', title: 'Invalid location', description: 'Please select a valid location from the list.' });
      }
    }
  }, [autocomplete, toast]);

  const handleConfirm = () => {
    if (!selectedAddressDetails) {
        toast({ variant: 'destructive', title: "No location selected", description: "Please select a valid location on the map." });
        return;
    }
    onConfirm(selectedAddressDetails);
    onClose();
  };

  if (!apiKey) {
    return (
        <div className="flex flex-col items-center justify-center h-[450px] text-center p-4 bg-muted rounded-md">
            <h3 className="text-lg font-semibold text-destructive">Google Maps API Key Missing</h3>
            <p className="text-sm text-muted-foreground mt-2">Please provide a valid NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file to use this feature.</p>
        </div>
    );
  }

  if (loadError) {
      return <div className="text-center p-4">Error loading maps. Check your API key and network connection.</div>;
  }
  
  return isLoaded ? (
    <div className="h-[70vh] w-full bg-background flex flex-col">
       {viewMode === 'map' && (
         <div className="relative flex-grow h-full">
            <div className="absolute top-4 left-4 right-4 z-[1]">
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal shadow-lg bg-background"
                onClick={() => setViewMode('search')}
              >
                <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                Search for area, street name...
              </Button>
            </div>

            <div className="absolute top-1/2 left-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <MapPin className="h-10 w-10 text-primary drop-shadow-lg" style={{transform: 'translateY(-50%)'}} />
            </div>

            <GoogleMap
              mapContainerClassName="w-full h-full rounded-md"
              center={defaultCenter}
              zoom={12}
              onLoad={onLoad}
              onUnmount={onUnmount}
              onIdle={handleMapIdle}
              options={{ 
                  streetViewControl: false, 
                  mapTypeControl: false, 
                  fullscreenControl: false,
                  zoomControl: false,
              }}
            >
              {currentUserPosition && (
                  <MarkerF
                    position={currentUserPosition}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      fillColor: '#4285F4',
                      fillOpacity: 1,
                      scale: 8,
                      strokeColor: 'white',
                      strokeWeight: 2,
                    }}
                  />
              )}
            </GoogleMap>
            
            <div className="absolute bottom-16 right-4 z-[1]">
                <Button variant="secondary" size="icon" onClick={handleUseCurrentLocation} disabled={isLocating} className="h-12 w-12 rounded-full shadow-lg">
                  <LocateFixed className="h-6 w-6" />
                </Button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-[1] p-4 bg-gradient-to-t from-background via-background/90 to-transparent">
                  <Card className="shadow-lg">
                      <CardHeader>
                          <div className="flex items-start gap-3">
                              <MapPin className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                              <div>
                                  <p className="font-semibold text-primary">Select delivery location</p>
                                  <p className={cn("text-sm text-muted-foreground", isGeocoding && "animate-pulse")}>
                                      {isGeocoding ? 'Loading address...' : displayAddress}
                                  </p>
                              </div>
                          </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                          <Button onClick={handleConfirm} disabled={!selectedAddressDetails || isGeocoding} className="w-full">
                              {isGeocoding ? "Locating..." : "Confirm Location"}
                          </Button>
                      </CardContent>
                  </Card>
            </div>
        </div>
      )}

      {viewMode === 'search' && (
        <div className="p-4 flex flex-col h-full bg-background">
            <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => setViewMode('map')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-lg font-semibold">Change delivery location</h2>
            </div>
            
            <div className="flex-shrink-0">
                <Autocomplete
                  onLoad={onAutocompleteLoad}
                  onPlaceChanged={onPlaceChanged}
                  options={{
                    bounds: map?.getBounds(),
                    strictBounds: false,
                  }}
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="location-search-focused"
                      type="text"
                      placeholder="Search for an area, street name..."
                      className="w-full pl-10 h-12"
                      autoFocus
                    />
                  </div>
                </Autocomplete>
                
                <Button 
                    variant="ghost" 
                    className="w-full justify-start h-14 text-left my-4 text-primary font-semibold"
                    onClick={() => {
                      handleUseCurrentLocation();
                      setViewMode('map');
                    }}
                >
                    <LocateFixed className="mr-4 h-5 w-5" />
                    Use your current location
                </Button>
            </div>
            
            {/* Suggestions from Autocomplete will appear below the input field, styled by Google's script */}
        </div>
      )}
    </div>
  ) : (
    <Skeleton className="h-[70vh] w-full" />
  );
}
