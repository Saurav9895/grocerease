
'use client';

import * as React from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
} from '@react-google-maps/api';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/lib/types';
import { ArrowLeft, LocateFixed, MapPin, Search, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

// Default center (Kathmandu)
const defaultCenter = {
  lat: 27.7172,
  lng: 85.324,
};

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

const formatSuggestionForDisplay = (place: google.maps.GeocoderResult) => {
    if (!place.address_components || place.address_components.length === 0) {
        return { main_text: place.formatted_address, secondary_text: "" };
    }
    
    const establishment = place.address_components.find(c => c.types.includes('establishment'))?.long_name;
    const pointOfInterest = place.address_components.find(c => c.types.includes('point_of_interest'))?.long_name;
    const premise = place.address_components.find(c => c.types.includes('premise'))?.long_name;
    
    let main_text = establishment || pointOfInterest || premise;
    let secondary_text = place.formatted_address;

    if (main_text) {
        secondary_text = place.formatted_address.replace(`${main_text}, `, '');
    } else {
        const secondary_text_parts = place.formatted_address.split(',');
        main_text = secondary_text_parts[0];
        secondary_text = secondary_text_parts.slice(1).join(', ');
    }
    
    return { main_text, secondary_text };
}


export function GoogleMapPicker({ onConfirm, onClose }: { onConfirm: (address: Partial<Address>) => void; onClose: () => void; }) {
  const { toast } = useToast();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places', 'geocoding'],
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  
  const [displayAddress, setDisplayAddress] = React.useState<string>('Move the map to select your address');
  const [selectedAddressDetails, setSelectedAddressDetails] = React.useState<Partial<Address> | null>(null);
  const [isGeocoding, setIsGeocoding] = React.useState(false);
  const [isLocating, setIsLocating] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<'map' | 'search'>('map');
  const [currentUserPosition, setCurrentUserPosition] = React.useState<google.maps.LatLngLiteral | null>(null);
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<google.maps.GeocoderResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const mapRef = React.useRef<google.maps.Map | null>(null);

  const parseAddressComponents = (components: google.maps.GeocoderAddressComponent[]): Partial<Address> => {
      const parsed: Partial<Address> = {};
      const get = (type: string, useShortName = false): string => {
        const component = components.find(c => c.types.includes(type));
        return component ? (useShortName ? component.short_name : component.long_name) : '';
      };
      
      const route = get('route');
      const establishment = get('establishment');
      const pointOfInterest = get('point_of_interest');
      const premise = get('premise');

      let streetAddress = route;
      if (!streetAddress) {
        streetAddress = establishment || pointOfInterest || premise || get('sublocality_level_1') || get('sublocality');
      }
      
      parsed.street = streetAddress;
      parsed.apartment = get('subpremise');
      parsed.city = get('locality') || get('administrative_area_level_2') || get('postal_town');
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
    if (!navigator.geolocation || !mapRef.current) {
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
   
  const handleSuggestionClick = (place: google.maps.GeocoderResult) => {
    if (place.geometry && place.geometry.location && mapRef.current) {
        mapRef.current.panTo(place.geometry.location);
        mapRef.current.setZoom(17);
        setViewMode('map');
        setSearchQuery('');
        setSuggestions([]);
    } else {
        toast({ variant: 'destructive', title: 'Location not found', description: 'Could not get coordinates for this location.' });
    }
  };
  
  const handleSearch = React.useCallback(
    debounce(async (query: string) => {
        if (!query.trim() || !isLoaded) {
            setSuggestions([]);
            return;
        }
        setIsSearching(true);
        const geocoder = new window.google.maps.Geocoder();
        try {
            const request: google.maps.GeocoderRequest = {
                address: query,
                bounds: map?.getBounds(),
            };
            const { results } = await geocoder.geocode(request);
            setSuggestions(results);
        } catch (error: any) {
            if (error.code === google.maps.GeocoderStatus.ZERO_RESULTS) {
                setSuggestions([]);
            } else {
                console.error('Geocoding search error:', error);
                setSuggestions([]);
            }
        } finally {
            setIsSearching(false);
        }
    }, 400),
    [isLoaded, map]
  );

  React.useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);


  const handleConfirm = () => {
    if (!selectedAddressDetails) {
        toast({ variant: "destructive", title: "No location selected", description: "Please select a valid location on the map." });
        return;
    }
    onConfirm(selectedAddressDetails);
    onClose();
  };

  if (!apiKey) {
    return (
        <div className="flex flex-col items-center justify-center h-[350px] text-center p-4 bg-muted rounded-md">
            <h3 className="text-lg font-semibold text-destructive">Google Maps API Key Missing</h3>
            <p className="text-sm text-muted-foreground mt-2">Please provide a valid NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file to use this feature.</p>
        </div>
    );
  }

  if (loadError) {
      return <div className="text-center p-4">Error loading maps. Check your API key and network connection.</div>;
  }
  
  return isLoaded ? (
    <div className="relative h-[450px] w-full bg-background overflow-hidden">
      <div className={cn("absolute inset-0 z-0")}>
        <GoogleMap
            mapContainerClassName="w-full h-full"
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
      </div>

       <div className={cn("absolute inset-0 pointer-events-none", viewMode === 'search' && 'hidden')}>
            <div className="absolute top-4 left-4 z-10 pointer-events-auto">
                <Button variant="secondary" size="icon" onClick={handleUseCurrentLocation} disabled={isLocating} className="h-12 w-12 rounded-full shadow-lg">
                    <LocateFixed className="h-6 w-6" />
                </Button>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <MapPin className="h-10 w-10 text-primary drop-shadow-lg" />
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 p-4">
              <div className="pointer-events-auto rounded-lg bg-background/80 p-3 shadow-lg backdrop-blur-sm">
                <div className="space-y-1">
                  <p className="font-semibold text-primary">Select delivery location</p>
                  <p className={cn("text-sm text-muted-foreground truncate", isGeocoding && "animate-pulse")}>
                    {isGeocoding ? 'Loading address...' : displayAddress}
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    className="w-full justify-center font-normal"
                    onClick={() => setViewMode('search')}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    <span>Search</span>
                  </Button>
                  <Button onClick={handleConfirm} disabled={!selectedAddressDetails || isGeocoding} className="w-full">
                    {isGeocoding ? "Locating..." : "Confirm"}
                  </Button>
                </div>
              </div>
            </div>
       </div>

      {viewMode === 'search' && (
        <div className="absolute inset-0 pt-4 px-4 pb-4 flex flex-col h-full bg-background z-20">
            <div className="flex items-center gap-2 mb-4 flex-shrink-0 pt-10">
                <Button variant="ghost" size="icon" onClick={() => setViewMode('map')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                 <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        id="location-search-focused"
                        type="text"
                        placeholder="Search for an area, street name..."
                        className="w-full pl-10 h-12"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="flex-grow mt-4 overflow-y-auto">
                {isSearching ? (
                    <div className="text-center text-muted-foreground py-4 flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin"/>
                        <span>Searching...</span>
                    </div>
                ) : suggestions.length > 0 ? (
                    <ul className="divide-y divide-border">
                        {suggestions.map((place) => {
                             const { main_text, secondary_text } = formatSuggestionForDisplay(place);
                             return (
                                <li
                                    key={place.place_id}
                                    onClick={() => handleSuggestionClick(place)}
                                    className="flex items-center gap-4 p-3 cursor-pointer hover:bg-muted"
                                >
                                    <div className="flex-shrink-0 bg-muted p-2 rounded-full">
                                        <MapPin className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-grow overflow-hidden">
                                        <p className="font-medium truncate">{main_text}</p>
                                        {secondary_text && <p className="text-sm text-muted-foreground truncate">{secondary_text}</p>}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : searchQuery ? (
                    <div className="text-center text-muted-foreground py-4">No results found for "{searchQuery}".</div>
                ): null}
            </div>

            <div className="flex-shrink-0 border-t pt-4">
                <Button 
                    variant="ghost" 
                    className="w-full justify-start h-14 text-left text-primary font-semibold"
                    onClick={() => {
                        handleUseCurrentLocation();
                        setViewMode('map');
                    }}
                >
                    <LocateFixed className="mr-4 h-5 w-5" />
                    Use your current location
                </Button>
            </div>
        </div>
      )}
    </div>
  ) : (
    <Skeleton className="h-[450px] w-full" />
  );
}
