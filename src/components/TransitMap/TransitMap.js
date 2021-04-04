import React, {useRef, useEffect, useState} from 'react';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';
import {StaticMap} from 'react-map-gl';
import {
    Route,
    Segment,
    Vehicle,
    Stop,
    Location,
    ArrivalEstimate,
    DissolvedSegment
} from '../../services/transit/structures';
import {
    genRouteMap,
    genSegmentMap,
    genVehicleMap,
    genStopMap
} from '../../services/transit/endpoints';
import {
    dissolveSegmentsMatchingRoutes
} from '../../services/transit/utils';
const convert = require('color-convert');

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const INITIAL_VIEW_STATE = {
    latitude: 35.78,
    longitude: -78.68,
    zoom: 13,
    pitch: 0,
    bearing: 0
}

const TransitMap = () => {

    const [routeMap, setRouteMap] = useState(null);
    const [segmentMap, setSegmentMap] = useState(null);
    const [routeLayers, setRouteLayers] = useState([]);

    useEffect(() => {
        genRouteMap().then((map) => {
            setRouteMap(map);
        });
        genSegmentMap().then((map) => {
            setSegmentMap(map);
        });
    }, []);

    useEffect(() => {
        if (routeMap == null || segmentMap == null) {
            return;
        }
        setRouteLayers(makeRouteVisuals(routeMap, segmentMap));
    }, [routeMap, segmentMap]);

    useEffect(() => {
        console.log(routeLayers);
    }, [routeLayers])

    return (
        <DeckGL
            initialViewState={INITIAL_VIEW_STATE}
            controller={true}
            layers={routeLayers}
        >
            <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
        </DeckGL>
    );
}

/**
 * Loads array of layers for route visuals
 *
 * @param {Map<string,Route>} routeMap route map
 * @param {Map<string,Segment>} segmentMap segment map
 * @return {[PathLayer]} array of layers
 */
const makeRouteVisuals = (routeMap, segmentMap) => {
    const layers = [];

    const dissolvedSegments = dissolveSegmentsMatchingRoutes(routeMap, segmentMap);
    for (const dissolved of dissolvedSegments) {
        for (const route of dissolved.routes) {
            const dashScale = 8;
            const dashLength = (dissolved.routes.length - dissolved.routes.indexOf(route)) * dashScale;
            const gapLength = dissolved.routes.indexOf(route) * dashScale;
            const dashArray = [dashLength, gapLength];

            const layer = new GeoJsonLayer({
                id: `segments-${dissolved.segments.toString()}-route-${route}`,
                data: dissolved.data,
                lineWidthMinPixels: 2,

                getLineWidth: 4,
                getLineColor: convert.hex.rgb(routeMap.get(route).color),

                getDashArray: dashArray,
                extensions: [new PathStyleExtension({
                    dash: true,
                    highPrecisionDash: true
                })]
            });

            layers.push(layer);
        }
    }

    return layers;
}

//     // components for segment visuals
//     const [segmentVisuals, setSegmentVisuals] = useState(null);
//     // components for vehicle visuals
//     const [vehicleVisuals, setVehicleVisuals] = useState(null);
//     // components for stop visuals
//     const [stopVisuals, setStopVisuals] = useState(null);
//
//
//
//
//
//
//
//
//     // will have fields routes segments vehicles stops
//     const [transitData, setTransitData] = useState(null);
//     const [routeVisuals, setRouteVisuals] = useState(null);
//     const [transitVisuals, setTransitVisuals] = useState([]);
//
//     // const [routes, setRoutes] = useState(null);
//     // const [segments, setSegments] = useState(null);
//     // const [vehicles, setVehicles] = useState(null);
//     // const [stops, setStops] = useState(null);
//
//     useEffect(() => {
//         (async () => {
//             const routes = await allRoutes();
//
//             const segments = await allSegments();
//             for (const [key, value] of routes) {
//                 for (const segment of value.segments) {
//                     const oldValue = segments.get(segment[0]);
//                     if (oldValue.colors.includes(value.color)) {
//                         continue;
//                     }
//                     segments.set(segment[0], {
//                         GeoJSON: oldValue.GeoJSON,
//                         colors: [...oldValue.colors, value.color]
//                     });
//                 }
//             }
//
//             // const vehicles = await allVehicles();
//             // for (const [key, value] of vehicles) {
//             //     vehicles.set(key, {
//             //         location: value.location,
//             //         route: value.route_id,
//             //         heading: value.heading,
//             //         color: routes.get(value.route_id).color
//             //     });
//             // }
//             //
//             // const stops = await allStops();
//             //
//             setTransitData({
//                 routes: routes,
//                 segments: segments,
//                 // vehicles: vehicles,
//                 // stops: stops
//             });
//         })();
//     }, []);
//
//     useEffect(() => {
//         if (transitData == null) {
//             return;
//         }
//         console.log(transitData);
//         const visuals = Array.from(transitData.segments).map((entry) => {
//             console.log(entry);
//             return (
//                 <Source
//                     id={`src-segment-${entry[0]}`}
//                     type={'geojson'}
//                     data={{
//                         type: 'Feature',
//                         properties: {},
//                         geometry: entry[1].GeoJSON
//                     }}
//                 >
//                     {entry[1].colors.map((color) => {
//                         console.log(color);
//                         const i = entry[1].colors.indexOf(color);
//                         const dashWidth = 3;
//                         const intervalWidth = entry[1].colors.length * dashWidth;
//                         const dasharray = [0, i * dashWidth, dashWidth, intervalWidth - (i * dashWidth) - dashWidth];
//                         return (
//                             <Layer
//                                 id={`lay-segment-${entry[0]}-${color}`}
//                                 type={'line'}
//                                 source={`src-segment-${entry[0]}`}
//                                 layout={{
//                                     'line-join': 'miter',
//                                     'line-cap': 'butt'
//                                 }}
//                                 paint={{
//                                     'line-color': `#${color}`,
//                                     'line-width': 3,
//                                     'line-dasharray': dasharray
//                                 }}
//                             />
//                         );
//                     })}
//                 </Source>
//             );
//         });
//         setTransitVisuals(visuals);
//     }, [transitData]);
//
//     return (
//         <div id={'TransitMap'}>
//             <ReactMapGL
//                 {...viewport}
//                 onViewportChange={nextViewport => setViewport(nextViewport)}
//                 mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
//             >
//                 {transitVisuals}
//             </ReactMapGL>
//         </div>
//     );
//
//     // const mapContainer = useRef();
//     // const [lng, setLng] = useState(-78.68);
//     // const [lat, setLat] = useState(35.78);
//     // const [zoom, setZoom] = useState(13);
//     //
//     // const vehicleMarkers = useRef(new Map());
//     //
//     // useEffect(() => {
//     //     const map = new mapboxgl.Map({
//     //         container: mapContainer.current,
//     //         style: 'mapbox://styles/mapbox/streets-v11?optimize=true',
//     //         center: [lng, lat],
//     //         zoom: zoom
//     //     });
//     //
//     //     map.on('load', async () => {
//     //         const segmentMap = await allSegments();
//     //         for (const [key, value] of segmentMap) {
//     //             map.addSource(`segment${key}`, {
//     //                 type: 'geojson',
//     //                 data: {
//     //                     type: 'Feature',
//     //                     properties: {},
//     //                     geometry: value.GeoJSON
//     //                 }
//     //             });
//     //             for (let i = 0; i < value.colors.length; i++) {
//     //                 const dashWidth = 3;
//     //                 const intervalWidth = value.colors.length * dashWidth;
//     //                 const dasharray = [0, i * dashWidth, dashWidth, intervalWidth - (i * dashWidth) - dashWidth];
//     //                 map.addLayer({
//     //                     id: `segment${key}${value.colors[i]}`,
//     //                     type: 'line',
//     //                     source: `segment${key}`,
//     //                     layout: {
//     //                         'line-join': 'round',
//     //                         'line-cap': 'round'
//     //                     },
//     //                     paint: {
//     //                         'line-color': `#${value.colors[i]}`,
//     //                         'line-width': 3,
//     //                         'line-dasharray': dasharray
//     //                     }
//     //                 });
//     //             }
//     //         }
//     //     });
//     //
//     //     map.on('load', async () => {
//     //         const vehicleMap = await allVehicles();
//     //         for (const [key, value] of vehicleMap) {
//     //             const marker = new mapboxgl.Marker({
//     //                 color: `#${value.color}`,
//     //                 draggable: false,
//     //                 rotation: value.heading + 180,
//     //                 rotationAlignment: 'map',
//     //                 anchor: 'center',
//     //                 offset: [0, 0]
//     //             }).setLngLat([value.location.lng, value.location.lat]).addTo(map);
//     //             vehicleMarkers.current.set(key, marker);
//     //         }
//     //     });
//     //
//     //     map.on('load', async () => {
//     //         const stopMap = await allStops();
//     //         for (const [key, value] of stopMap) {
//     //             const marker = new mapboxgl.Marker({
//     //                 scale: 0.3,
//     //                 color: '#000000',
//     //                 draggable: false,
//     //                 rotationAlignment: 'viewport'
//     //             }).setLngLat([value.location.lng, value.location.lat]).addTo(map);
//     //         }
//     //     });
//     //
//     //     map.on('busLoad', async () => {
//     //         const vehicleMap = await allVehicles();
//     //         for (const [key, value] of vehicleMap) {
//     //             vehicleMarkers.current.get(key).setLngLat([value.location.lng, value.location.lat]).setRotation(value.heading + 180);
//     //         }
//     //     });
//     //
//     //     const interval = setInterval(() => map.fire('busLoad'), 5000);
//     //
//     //     return () => {
//     //         clearInterval(interval);
//     //         map.remove();
//     //     }
//     // }, []);
//
//     // return (
//     //     <div className={"c-TransitMap"}>
//     //         <div className="map-container" ref={mapContainer}/>
//     //     </div>
//     // )
// }

export default TransitMap;