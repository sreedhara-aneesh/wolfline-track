import React, {useEffect, useState} from 'react';
import DeckGL from '@deck.gl/react';
import {BASEMAP} from '@deck.gl/carto';
import {_MapContext as MapContext, StaticMap} from 'react-map-gl';
import {TransitManager} from '../../services/transit/structures';
import StopMarkers from "../StopMarkers/StopMarkers";
import VehicleLayer from "../VehicleLayer/VehicleLayer";
import RouteLayer from "../RouteLayer/RouteLayer";
const convert = require('color-convert');
const polyline = require('@mapbox/polyline');

const INITIAL_VIEW_STATE = {
    latitude: 35.78,
    longitude: -78.68,
    zoom: 13,
    pitch: 0,
    bearing: 0
}

const MAP_WRAPPER_STYLE = {
    height: '100vh',
    width: '100vw',
    position: 'relative',
    overflow: 'hidden'
}

/**
 * A map for viewing transit routes and vehicles, with vehicles being updated in real time.
 *
 * @return {JSX.Element} transit map
 */
const TransitMap = () => {

    // manager information
    const [manager] = useState(new TransitManager());
    const [initialized, setInitialized] = useState(false);

    // layer data
    const [routeLayerData, setRouteLayerData] = useState([]);
    const [vehicleLayerData, setVehicleLayerData] = useState([]);
    const [stopMarkerData, setStopMarkerData] = useState([]);

    // initialize manager
    useEffect(() => {
        (async () => {
            await manager.initialize();
            setInitialized(true);
        })();
    }, []);

    // create layers when manager is initialized
    useEffect(() => {
        if (initialized === false) {
            return;
        }
        setRouteLayerData(createRouteLayerData(manager));
        setVehicleLayerData(createVehicleLayerData(manager));
        setStopMarkerData(createStopMarkerData(manager));
    }, [initialized]);

    // update vehicle layer data regularly
    useEffect(() => {
        const interval = setInterval(() => {
            if (manager.initialized === true)
                manager.updateVehicleData().then(() =>
                    setVehicleLayerData(createVehicleLayerData(manager)));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // component jsx
    return (
        <div style={MAP_WRAPPER_STYLE}>
            <DeckGL
                ContextProvider={MapContext.Provider}
                initialViewState={INITIAL_VIEW_STATE}
                controller={true}
            >
                {/*Routes*/}
                <RouteLayer data={routeLayerData} />
                {/*Vehicles*/}
                <VehicleLayer data={vehicleLayerData} />
                {/*Stops*/}
                <StopMarkers data={stopMarkerData} />
                {/*Map*/}
                <StaticMap mapStyle={BASEMAP.POSITRON} />
            </DeckGL>
        </div>
    );
}

/**
 * Creates data that can be passed to RouteLayer.
 *
 * @param manager {TransitManager} manager to pull data from
 * @param routes {string[] | null} an array of route ids, or null as default to display all
 * @return {Object[]} array of data for RouteLayer
 */
const createRouteLayerData = (manager, routes = null) => {
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

            const datum = {
                type: 'Feature',
                geometry: polyline.toGeoJSON(segment.polyline),
                properties: {
                    lineColor: convert.hex.rgb(route.color),
                    dashArray: dashArray
                }
            }
            data.push(datum);
        }
    }

    return data;
}

/**
 * Creates data that can be passed into VehicleLayer.
 *
 * @param manager {TransitManager} manager to pull data from
 * @param routes {string[] | null} an array of route ids, or null as default to display all
 * @return {Object[]} array of data for VehicleLayer
 */
const createVehicleLayerData = (manager, routes = null) => {
    if (routes == null) routes = manager.getRouteIds();
    const vehicleIds = manager.getVehicleIds();

    const data = [];

    for (const vehicleId of vehicleIds) {
        const vehicle = manager.getVehicle(vehicleId);
        const route = manager.getRoute(vehicle.routeId);
        if (!routes.includes(route.routeId)) continue;

        const datum = {
            position: [vehicle.location.lng, vehicle.location.lat],
            angle: -1 * vehicle.heading + 90,
            color: convert.hex.rgb(route.color)
        };
        data.push(datum);
    }

    console.log(data);
    return data;
}

/**
 * Creates data that can be passed into StopMarkers.
 *
 * @param manager {TransitManager} manager to pull data from
 * @param routes {string[] | null} array of route ids, or default null for all routes
 * @return {Object[]} array of data for StopMarkers
 */
const createStopMarkerData = (manager, routes = null) => {
    if (routes == null) routes = manager.getRouteIds();
    const stopIds = manager.getStopIds();
    const data = [];

    for (const stopId of stopIds) {
        const stop = manager.getStop(stopId);
        const colors = [];

        for (const routeId of stop.routes) {
            const route = manager.getRoute(routeId);
            colors.push(route.color);
        }

        const datum = {
            key: `stop-${stop.stopId}`,
            longitude: stop.location.lng,
            latitude: stop.location.lat,
            colors: colors
        }

        data.push(datum);
    }

    return data;
}


export default TransitMap;