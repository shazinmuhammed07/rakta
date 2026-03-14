'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { LocateFixed } from 'lucide-react';

function LocationMarker({ position, setPosition, setLocationName }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
            fetchLocationName(e.latlng.lat, e.latlng.lng, setLocationName);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

const fetchLocationName = async (lat, lng, setLocationName) => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        if (data && data.display_name) {
            // Extract a shorter name for better UX
            const address = data.address;
            const shortName = address.city || address.town || address.village || address.suburb || address.county || data.name || data.display_name;
            setLocationName(shortName);
        }
    } catch (error) {
        console.error("Error fetching location name:", error);
    }
};

const MapPickerComponent = ({ onLocationSelect, defaultLocation, initialLocationName }) => {
    const [position, setPosition] = useState(defaultLocation || null);
    const [locationName, setLocationName] = useState(initialLocationName || "");
    const [mapCenter, setMapCenter] = useState(defaultLocation || [20.5937, 78.9629]); // Default to India center
    const [zoom, setZoom] = useState(defaultLocation ? 13 : 5);
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        if (position) {
            onLocationSelect({
                lat: position.lat || position[0],
                lng: position.lng || position[1],
                name: locationName
            });
        }
    }, [position, locationName]);

    const handleGetCurrentLocation = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setPosition(newPos);
                    setMapCenter(newPos);
                    setZoom(15);
                    fetchLocationName(newPos.lat, newPos.lng, setLocationName);
                    setIsLocating(false);
                },
                (err) => {
                    console.error("Error getting location: ", err);
                    alert("Could not get your current location. Please select it on the map.");
                    setIsLocating(false);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser");
            setIsLocating(false);
        }
    };

    return (
        <div className="w-full h-full relative group rounded-xl overflow-hidden border border-red-500/20 glass-panel">
            <div className="absolute top-4 right-4 z-[400]">
                <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="p-2 sm:p-3 bg-red-600/90 text-white rounded-full shadow-lg hover:bg-red-500 transition-all active:scale-95 disabled:opacity-70 disabled:animate-pulse flex items-center justify-center backdrop-blur-md"
                    title="Use Current Location"
                >
                    <LocateFixed className={`w-4 h-4 sm:w-5 sm:h-5 ${isLocating ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="absolute top-4 left-4 z-[400] bg-black/60 backdrop-blur-md text-white/90 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm border border-red-500/30 max-w-[calc(100%-134px)] sm:max-w-[250px] truncate shadow-xl">
                {position ? (locationName || "Location Selected") : "Click map to set location"}
            </div>

            <MapContainer
                center={mapCenter}
                zoom={zoom}
                scrollWheelZoom={true}
                className="w-full h-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    className="map-tiles"
                />
                <LocationMarker position={position} setPosition={setPosition} setLocationName={setLocationName} />
            </MapContainer>
        </div>
    );
};

export default MapPickerComponent;
