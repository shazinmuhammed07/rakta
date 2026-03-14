'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { User, Hospital } from 'lucide-react';
import { divIcon } from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

// Create custom icons showing blood drop and hospital
const renderHospitalIcon = () => divIcon({
    html: renderToStaticMarkup(
        <div className="bg-red-600 rounded-full p-2 border-2 border-white shadow-lg flex items-center justify-center -ml-3 -mt-3 w-8 h-8 sm:w-10 sm:h-10">
            <Hospital className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
    ),
    className: 'custom-leaflet-icon',
});

const renderDonorIcon = (bloodGroup) => divIcon({
    html: renderToStaticMarkup(
        <div className="bg-green-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg -ml-3 -mt-3 w-10 h-10 flex-col">
            <span className="text-white text-xs font-bold leading-none">{bloodGroup}</span>
        </div>
    ),
    className: 'custom-leaflet-icon',
});

const MapDisplayComponent = ({ centerPosition, donorPositions, radius = 10000 }) => {
    const [isClient, setIsClient] = useState(false);

    // Convert [lng, lat] from Mongo to [lat, lng] for Leaflet if needed
    const formatPosition = (pos) => {
        if (Array.isArray(pos)) {
            return [pos[1], pos[0]]; // [lng, lat] -> [lat, lng]
        }
        return [pos.lat, pos.lng];
    };

    const centerPos = formatPosition(centerPosition);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return (
        <div className="w-full h-full relative group rounded-xl overflow-hidden border border-red-500/20 glass-panel">
            <MapContainer
                center={centerPos}
                zoom={13}
                scrollWheelZoom={true}
                className="w-full h-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    className="map-tiles"
                />

                {/* Hospital Marker */}
                <Marker position={centerPos} icon={renderHospitalIcon()}>
                    <Popup>
                        <div className="text-center">
                            <p className="font-bold text-red-600">Hospital / Request Location</p>
                            <p className="text-xs text-gray-500">{radius === 5000 ? "Emergency Request (5km radius)" : "Normal Request (10km radius)"}</p>
                        </div>
                    </Popup>
                </Marker>

                {/* Radius Circle */}
                <Circle
                    center={centerPos}
                    radius={radius}
                    pathOptions={{ color: radius === 5000 ? 'red' : 'blue', fillColor: radius === 5000 ? 'red' : 'blue', fillOpacity: 0.1 }}
                />

                {/* Donor Markers */}
                {donorPositions && donorPositions.map((donor, idx) => (
                    <Marker
                        key={idx}
                        position={formatPosition(donor.location.coordinates)}
                        icon={renderDonorIcon(donor.bloodGroup)}
                    >
                        <Popup>
                            <div className="p-1 min-w-[100px] sm:min-w-[120px]">
                                <p className="font-bold text-gray-900 border-b pb-1 mb-1">{donor.name}</p>
                                <p className="text-sm text-gray-700">Blood Group: <span className="font-bold text-red-600">{donor.bloodGroup}</span></p>
                                <p className="text-sm text-gray-700 mt-1">Phone: {donor.phone}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

            </MapContainer>
        </div>
    );
};

export default MapDisplayComponent;
