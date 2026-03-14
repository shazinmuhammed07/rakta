'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the MapComponent with SSR disabled
const MapPickerComponent = dynamic(() => import('./MapPickerComponent'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] bg-neutral-900/50 rounded-xl border border-red-500/20 flex flex-col items-center justify-center animate-pulse glass-panel">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-red-400">Loading Map...</p>
        </div>
    ),
});

export default function MapPicker({ onLocationSelect, defaultLocation, initialLocationName }) {
    const [locationName, setLocationName] = useState(initialLocationName || '');

    useEffect(() => {
        if (initialLocationName) setLocationName(initialLocationName);
    }, [initialLocationName]);

    const handleLocationSelect = (location) => {
        setLocationName(location.name || '');
        onLocationSelect?.(location);
    };

    return (
        <div className="w-full">
            <div className="h-[250px] sm:h-[300px] md:h-[350px] rounded-xl overflow-hidden">
                <MapPickerComponent
                    onLocationSelect={handleLocationSelect}
                    defaultLocation={defaultLocation}
                    initialLocationName={initialLocationName}
                />
            </div>

            <div className="mt-3 text-sm text-gray-700">
                <span className="font-semibold">Selected location: </span>
                <span className="text-gray-500">
                    {locationName || 'Click on the map to choose a location'}
                </span>
            </div>
        </div>
    );
}
