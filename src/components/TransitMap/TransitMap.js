import React, {useRef, useEffect, useState} from 'react';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, IconLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';
import {BASEMAP} from '@deck.gl/carto';
import {_MapContext as MapContext, NavigationControl, Marker, StaticMap} from 'react-map-gl';
import {
    Route,
    Segment,
    Vehicle,
    Stop,
    Location,
    ArrivalEstimate,
    TransitManager
} from '../../services/transit/structures';
const convert = require('color-convert');
const polyline = require('@mapbox/polyline');

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const INITIAL_VIEW_STATE = {
    latitude: 35.78,
    longitude: -78.68,
    zoom: 13,
    pitch: 0,
    bearing: 0
}

const TransitMap = () => {

    const [manager, setManager] = useState(new TransitManager());
    const [initialized, setInitialized] = useState(false);

    const [routeLayer, setRouteLayer] = useState([]);
    const [vehicleMarkers, setVehicleMarkers] = useState([]);
    const [stopMarkers, setStopMarkers] = useState([]);

    // initialize manager
    useEffect(() => {
        (async () => {
            await manager.initialize();
            setInitialized(true);
        })();
    }, []);

    // once initialized, create layers
    useEffect(() => {
        if (initialized === false) {
            return;
        }
        setRouteLayer(createRouteLayer(manager));
        setVehicleMarkers(createVehicleMarkers(manager));
        setStopMarkers(createStopMarkers(manager));
    }, [initialized]);

    // update vehicle markers regularly
    useEffect(() => {
        const interval = setInterval(() => {
            if (manager.initialized === true) {
                (async () => {
                    await manager.updateVehicleData();
                    setVehicleMarkers(createVehicleMarkers(manager));
                })();
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            style={{
                height: '100vh',
                width: '100vw',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <DeckGL
                ContextProvider={MapContext.Provider}
                initialViewState={INITIAL_VIEW_STATE}
                controller={true}
                layers={[routeLayer]}
            >
                {stopMarkers}
                {vehicleMarkers}
                <StaticMap mapStyle={BASEMAP.POSITRON} />
            </DeckGL>
        </div>
    );
}

/**
 * Creates layer needed for route visuals
 * @param manager {TransitManager} manager to pull data from
 * @param routes {string[] | null} an array of route ids, or null as default to display all
 * @return {GeoJsonLayer} layer
 */
const createRouteLayer = (manager, routes = null) => {
    if (routes == null) routes = manager.getRouteIds();
    const data = [];

    for (const segmentId of manager.getSegmentIds()) {
        const segment = manager.getSegment(segmentId);
        const routeIds = manager.getSegmentRoutes(segmentId);
        // remove routes that we are ignoring
        for (let i = 0; i < routeIds.length; i++) {
            if (!routes.includes(routeIds[i])){
                routeIds.splice(i, 1);
                i--;
            }
        }
        // create the data
        for (const routeId of routeIds) {
            const route = manager.getRoute(routeId);

            // create dash array for layer
            const dashScale = 8;
            const dashLength = (routeIds.length - routeIds.indexOf(routeId)) * dashScale;
            const gapLength = routeIds.indexOf(routeId) * dashScale;
            const dashArray = [dashLength, gapLength]

            const dataPoint = {
                type: 'Feature',
                geometry: polyline.toGeoJSON(segment.polyline),
                properties: {
                    lineColor: convert.hex.rgb(route.color),
                    dashArray: dashArray
                }
            }

            data.push(dataPoint);
        }
    }

    // make the layer
    const layer = new GeoJsonLayer({
        id: `RouteLayer`,
        data: data,
        getLineColor: d => d.properties.lineColor,
        getDashArray: d => d.properties.dashArray,
        lineWidthMinPixels: 2,
        getLineWidth: 4,
        extensions: [new PathStyleExtension({
            dash: true,
            highPrecisionDash: true
        })]
    });

    return layer;
}

/**
 * Creates markers needed for vehicle visuals
 * @param manager {TransitManager} manager to pull data from
 * @param routes {string[] | null} an array of route ids, or null as default to display all
 * @return {Marker[]} markers
 */
const createVehicleMarkers = (manager, routes = null) => {
    if (routes == null) routes = manager.getRouteIds();
    const markers = [];
    const vehicleIds = manager.getVehicleIds();

    for (const vehicleId of vehicleIds) {
        const vehicle = manager.getVehicle(vehicleId);
        const route = manager.getRoute(vehicle.routeId);
        if (!routes.includes(route.routeId)) continue;

        const marker = (
            <Marker
                key={`vehicle-${vehicleId}`}
                longitude={vehicle.location.lng}
                latitude={vehicle.location.lat}
                offsetTop={-9}
                offsetLeft={-9}
            >
                <div
                    style={{
                        transform: `rotate(${(vehicle.heading - 45) % 360}deg)`,
                        width: `16px`,
                        height: '16px',
                        position: 'relative',
                        borderRadius: '8px',
                        borderStyle: 'solid',
                        borderWidth: '1px',
                        borderColor: "black",
                        backgroundColor: 'white'
                    }}
                >
                    <svg
                        style={{
                            position: 'absolute',
                            top: '2px',
                            left: '2px',
                            width: '12px',
                            height: '12px'
                        }}
                        xmlns="http://www.w3.org/2000/svg" fill={`#${route.color}`}
                        className="bi bi-cursor-fill" viewBox="0 0 16 16">
                        <path
                            d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"/>
                    </svg>
                </div>
            </Marker>
        );

        markers.push(marker);
    }

    return markers;
}

/**
 * Creates markers for stops
 * @param manager {TransitManager} manager to pull data from
 * @param routes {string[] | null} array of route ids, or default null for all routes
 * @return {Marker[]} array of markers
 */
const createStopMarkers = (manager, routes = null) => {
    if (routes == null) routes = manager.getRouteIds();
    const stopIds = manager.getStopIds();
    const markers = [];

    for (const stopId of stopIds) {
        const stop = manager.getStop(stopId);
        let bg = 'conic-gradient(';

        let i;
        for (i = 0; i < stop.routes.length; i++) {
            const routeId = stop.routes[i];
            if (!routes.includes(routeId)) continue;
            const route = manager.getRoute(routeId);
            const color = route.color;
            const deg = (360 / stop.routes.length) * (i + 1);
            bg += `#${color} 0 ${deg}deg${i === stop.routes.length - 1 ? ')' : ','}`;
        }
        if (i === 0) continue;

        const style = {
            position: 'absolute',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: `${bg}`,
            borderStyle: 'solid',
            borderColor: '#000000',
            borderWidth: '1px'
        }

        const marker = (
            <Marker
                key={`stop-${stop.stopId}`}
                longitude={stop.location.lng}
                latitude={stop.location.lat}
                offsetTop={-4}
                offsetLeft={-4}
            >
                <div
                    style={style}
                />
            </Marker>
        );

        markers.push(marker);
    }

    return markers;
}


export default TransitMap;