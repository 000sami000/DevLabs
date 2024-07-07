import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default icon not displaying
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RoutingMachine = ({ userLocation, destination }) => {
    const map = useMap();
    const [routingControl, setRoutingControl] = useState(null);

    useEffect(() => {
        if (!map) return;

        if (userLocation && destination && !routingControl) {
            const control = L.Routing.control({
                waypoints: [
                    L.latLng(userLocation[0], userLocation[1]),
                    L.latLng(destination[0], destination[1]),
                ],
                router: L.Routing.osrmv1({
                    serviceUrl: 'https://router.project-osrm.org/route/v1',
                }),
                lineOptions: {
                    styles: [{ color: 'blue', weight: 4 }],
                },
                createMarker: (i, waypoint, n) => {
                    return L.marker(waypoint.latLng).bindPopup(i === 0 ? "Your Location" : "Job Location");
                }
            }).addTo(map);

            setRoutingControl(control);
        }

        return () => {
            if (routingControl) {
                map.removeControl(routingControl);
                setRoutingControl(null);
            }
        };
    }, [map, userLocation, destination, routingControl]);

    return null;
};

const Map = ({ destination }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [showRoute, setShowRoute] = useState(false);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                setUserLocation([position.coords.latitude, position.coords.longitude]);
            });
        }
    }, []);

    const toggleRoute = () => {
        setShowRoute(prev => !prev);
    };

    return (
        <div className='pb-10'>
            <MapContainer center={destination} zoom={13} style={{ height: '400px', width: '100%' ,borderRadius:"10px"}}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {userLocation && <Marker position={userLocation}>
                    <Popup>Your Location</Popup>
                </Marker>}
                <Marker position={destination}>
                    <Popup>Job Location</Popup>
                </Marker>
                {userLocation && showRoute && (
                    <RoutingMachine
                        userLocation={userLocation}
                        destination={destination}
                    />
                )}
            </MapContainer>
            <div className='p-4'>
            <button className='bg-[orange] p-1 rounded-lg text-[white]' onClick={toggleRoute}>
                {showRoute ? 'Hide Route' : 'Show Route'}
            </button>
            </div>
        </div>
    );
};

export default Map;
