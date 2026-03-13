'use client';

import dynamic from 'next/dynamic';

// Dynamically import the MapComponent with SSR disabled
const MapPickerComponent = dynamic(() => import('./MapPickerComponent'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[350px] bg-neutral-900/50 rounded-xl border border-red-500/20 flex flex-col items-center justify-center animate-pulse glass-panel">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-red-400">Loading Map...</p>
        </div>
    ),
});

export default function MapPicker({ onLocationSelect, defaultLocation, initialLocationName }) {
    return <MapPickerComponent onLocationSelect={onLocationSelect} defaultLocation={defaultLocation} initialLocationName={initialLocationName} />;
}
