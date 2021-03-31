import React, {useRef, useEffect, useState} from 'react';
import mapboxgl from 'mapbox-gl';
import './TransitMap.css';
import {allSegments, allStops, allVehicles, routeGeoJSON, routesInfo} from "../../services/transitData";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const TransitMap = () => {

    const mapContainer = useRef();
    const [lng, setLng] = useState(-78.68);
    const [lat, setLat] = useState(35.78);
    const [zoom, setZoom] = useState(13);

    const vehicleMarkers = useRef(new Map());

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11?optimize=true',
            center: [lng, lat],
            zoom: zoom
        });

        map.on('load', async () => {
            const segmentMap = await allSegments();
            for (const [key, value] of segmentMap) {
                map.addSource(`segment${key}`, {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: value.GeoJSON
                    }
                });
                for (let i = 0; i < value.colors.length; i++) {
                    const dashWidth = 3;
                    const intervalWidth = value.colors.length * dashWidth;
                    const dasharray = [0, i * dashWidth, dashWidth, intervalWidth - (i * dashWidth) - dashWidth];
                    map.addLayer({
                        id: `segment${key}${value.colors[i]}`,
                        type: 'line',
                        source: `segment${key}`,
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        paint: {
                            'line-color': `#${value.colors[i]}`,
                            'line-width': 3,
                            'line-dasharray': dasharray
                        }
                    });
                }
            }
        });

        map.on('load', async () => {
            const vehicleMap = await allVehicles();
            for (const [key, value] of vehicleMap) {
                const marker = new mapboxgl.Marker({
                    color: `#${value.color}`,
                    draggable: false,
                    rotation: value.heading + 180,
                    rotationAlignment: 'map',
                    anchor: 'center',
                    offset: [0, 0]
                }).setLngLat([value.location.lng, value.location.lat]).addTo(map);
                vehicleMarkers.current.set(key, marker);
            }
        });

        map.on('load', async () => {
            const stopMap = await allStops();
            for (const [key, value] of stopMap) {
                const marker = new mapboxgl.Marker({
                    scale: 0.3,
                    color: '#000000',
                    draggable: false,
                    rotationAlignment: 'viewport'
                }).setLngLat([value.location.lng, value.location.lat]).addTo(map);
            }
        });

        map.on('busLoad', async () => {
            const vehicleMap = await allVehicles();
            for (const [key, value] of vehicleMap) {
                vehicleMarkers.current.get(key).setLngLat([value.location.lng, value.location.lat]).setRotation(value.heading + 180);
            }
        });

        const interval = setInterval(() => map.fire('busLoad'), 5000);

        return () => {
            clearInterval(interval);
            map.remove();
        }
    }, []);

    return (
        <div className={"c-TransitMap"}>
            <div className="map-container" ref={mapContainer}/>
        </div>
    )
}

export default TransitMap;
