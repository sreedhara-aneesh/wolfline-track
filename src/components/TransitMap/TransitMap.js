import React from 'react';
import {
    useState,
    useEffect
} from 'react';
import {
    TransitManager
} from '../../services/transit/structures';
import {
    Button,
    Drawer,
    Tag,
    Switch,
    Timeline,
    Card
} from 'antd';
import {
    MapContainer,
    TileLayer,
    GeoJSON,
    Marker
} from "react-leaflet";
import {
    divIcon
} from "leaflet";
import ReactLeafletDriftMarker from 'react-leaflet-drift-marker';



const polyline = require('@mapbox/polyline');



/**
 * Initial view state for the map.
 *
 * @type {{latitude: number, zoom: number, longitude: number}}
 */
const INITIAL_VIEW_STATE = {
    latitude: 35.78,
    longitude: -78.68,
    zoom: 13
}

/**
 * Interval in milliseconds between updates of vehicle data.
 *
 * @type {number}
 */
const VEHICLE_DATA_UPDATE_INTERVAL = 3000;

/**
 * Transit Map component.
 *
 * @return {JSX.Element} component
 */
const TransitMap = () => {

    // transit manager
    const [manager, setManager] = useState(new TransitManager());
    const [initialized, setInitialized] = useState(false);

    // ids of elements to be shown
    const [vehicleIds, setVehicleIds] = useState([]);
    const [routeIds, setRouteIds] = useState([]);
    const [stopIds, setStopIds] = useState([]);

    // set when an element is selected
    const [selection, setSelection] = useState(null);

    // true if settings drawer is open
    const [settingsOpen, setSettingsOpen] = useState(false);

    // create and initialize transit manager
    // periodically update manager data
    useEffect(() => {
        manager.initialize().then(() => {
            console.log("manager initialized");
            setInitialized(true);
        }).catch(() => {
            console.log("manager could not be initialized")
        });

        const updateInterval = setInterval(() => {
            if (manager.initialized) {
                manager.updateVehicleData();
                manager.updateArrivalEstimates();
            }
        }, VEHICLE_DATA_UPDATE_INTERVAL);

        return () => clearInterval(updateInterval);
    }, []);

    // upon initialization of transit manager, load in id information
    useEffect(() => {
        if (manager.initialized) {
            setRouteIds(manager.getRouteIds());
        }
    }, [initialized]);

    // when routes are selected / deselected, update shown vehicles and stops
    useEffect(() => {
        if (manager.initialized) {
            const newVehicleIds = [];
            const newStopIds = [];

            for (const vehicleId of manager.getVehicleIds()) {
                const vehicle = manager.getVehicle(vehicleId);
                if (routeIds.includes(vehicle.routeId)) newVehicleIds.push(vehicleId);
            }

            for (const stopId of manager.getStopIds()) {
                const stop = manager.getStop(stopId);
                for (const routeId of stop.routes) {
                    if (routeIds.includes(routeId)) {
                        newStopIds.push(stopId);
                        break;
                    }
                }
            }

            setVehicleIds(newVehicleIds);
            setStopIds(newStopIds);
        }
    }, [routeIds]);

    return (
        <div className={"TransitMap"}>

            <SettingsDrawer
                manager={manager}
                routeIds={routeIds}
                setRouteIds={setRouteIds}
                settingsOpen={settingsOpen}
                setSettingsOpen={setSettingsOpen}
            />

            <InfoDrawer
                manager={manager}
                selection={selection}
                setSelection={setSelection}
            />

            <BaseMap
                setSelection={setSelection}
                selection={selection}
                manager={manager}
                routeIds={routeIds}
                stopIds={stopIds}
                vehicleIds={vehicleIds}
            />

            <Button
                style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "20px",
                    zIndex: 400
                }}
                onClick={() => {
                    setSettingsOpen(true);
                    console.log(settingsOpen);
                }}
                type={"primary"}
            >
                Route Selection
            </Button>

        </div>
    );
}

/**
 * Settings Drawer component.
 *
 * @param context {{
 *     manager: TransitManager
 *     routeIds: string[]
 *     setRouteIds: function(string[])
 *     settingsOpen: boolean
 *     setSettingsOpen: function(boolean)
 * }} information to be passed in from parent component
 *
 * @return {JSX.Element} component
 */
const SettingsDrawer = (context) => {

    return (
        <React.Fragment>
            <Drawer
                title={"Settings"}
                placement={"left"}
                closable={true}
                onClose={() => {
                    context.setSettingsOpen(false);
                }}
                visible={context.settingsOpen}
            >
                <h3>Route Visibility</h3>
                {context.manager.getRouteIds().map((routeId) => {
                    const route = context.manager.getRoute(routeId);
                    return (
                        <div
                            key={`toggle-route-${routeId}`}
                            style={{
                                display: "flex",
                                justifyContent: "space-between"
                            }}
                        >
                            <p><Tag color={"#" + route.color}>{route.shortName}</Tag></p>
                            <p>{route.longName}</p>
                            <Switch
                                onChange={(checked, event) => {
                                    if (checked) {
                                        const newRouteIds = [...context.routeIds];
                                        newRouteIds.push(route.routeId);
                                        context.setRouteIds(newRouteIds);
                                    } else {
                                        const newRouteIds = [];
                                        for (const routeId of context.routeIds) {
                                            if (routeId === route.routeId) continue;
                                            newRouteIds.push(routeId);
                                        }
                                        context.setRouteIds(newRouteIds);
                                    }
                                }}
                                checked={context.routeIds.includes(route.routeId)}
                            />
                        </div>
                    );
                })}

            </Drawer>
        </React.Fragment>
    );
}

/**
 * Info Drawer component.
 *
 * @param context {{
 *     manager: TransitManager
 *     selection: {
 *         type: ("vehicle"|"route"|"stop")
 *         id: string
 *     } | null
 *     setSelection: function({
 *         type: ("vehicle"|"route"|"stop")
 *         id: string
 *     }) | null
 * }} information to be passed in from parent component
 *
 * @return {JSX.Element} component
 */
const InfoDrawer = (context) => {
    return (
        <React.Fragment>
            <Drawer
                title={"Selection"}
                placement={"left"}
                closable={true}
                onClose={() => {
                    context.setSelection(null);
                }}
                visible={context.selection !== null}
            >
                {(() => {
                    if (context.selection === null) return null;
                    if (context.selection.type === "vehicle") {
                        const vehicle = context.manager.getVehicle(context.selection.id);
                        const route = context.manager.getRoute(vehicle.routeId);
                        return (
                            <React.Fragment>
                                <p><b>Vehicle:</b> {vehicle.callName}</p>
                                <p><b>Route:</b> <Tag color={"#" + route.color}>{route.shortName}</Tag>{route.longName}</p>
                                <Timeline>
                                    {vehicle.arrivalEstimates.map((estimate) => {
                                        const stop = context.manager.getStop(estimate.stopId);
                                        return (
                                            <Timeline.Item
                                                key={`arrival-estimate_vehicle-${vehicle.vehicleId}_stop-${stop.stopId}_time-${estimate.arrivalAt}`}
                                            >
                                                <p><b>Stop:</b> {stop.name}</p>
                                                <p><b>When:</b> {estimate.arrivalAt}</p>
                                            </Timeline.Item>
                                        );
                                    })}
                                </Timeline>
                            </React.Fragment>
                        );
                    } else if (context.selection.type === "stop") {
                        const stop = context.manager.getStop(context.selection.id);
                        const stopRouteIds = stop.routes;
                        const arrivalEstimates = [...context.manager.arrivalEstimates];
                        arrivalEstimates.sort((e1, e2) => (new Date(e1.arrivalAt)) - (new Date(e2.arrivalAt)));
                        return (
                            <React.Fragment>
                                <p><b>Stop:</b> {stop.name}</p>
                                {stopRouteIds.map((routeId) => {
                                    const route = context.manager.getRoute(routeId);
                                    return (
                                        <Card
                                            key={`arrival-estimate-stop-${stop.stopId}_route-${routeId}`}
                                        >
                                            <p><b>Route:</b> <Tag color={"#" + route.color}>{route.shortName}</Tag>{route.longName}</p>
                                            <Timeline>
                                                {arrivalEstimates.map(estimate => {
                                                    if (estimate.routeId !== routeId) return null;
                                                    const vehicle = context.manager.getVehicle(estimate.vehicleId);
                                                    return (
                                                        <Timeline.Item
                                                            key={`arrival-estimate_vehicle-${vehicle.vehicleId}_stop-${stop.stopId}_time-${estimate.arrivalAt}`}
                                                        >
                                                            <p><b>Vehicle:</b> {vehicle.callName}</p>
                                                            <p><b>When:</b> {estimate.arrivalAt}</p>
                                                        </Timeline.Item>
                                                    );
                                                })}
                                            </Timeline>
                                        </Card>
                                    );
                                })}
                            </React.Fragment>
                        );
                    }
                })()}
            </Drawer>
        </React.Fragment>
    );
}

/**
 * Base Map component.
 *
 * @param context {{
 *     manager: TransitManager
 *     vehicleIds: string[]
 *     routeIds: string[]
 *     stopIds: string[]
 *     selection: {
 *         type: ("vehicle"|"route"|"stop")
 *         id: string
 *     } | null
 *     setSelection: function({
 *         type: ("vehicle"|"route"|"stop")
 *         id: string
 *     }) | null
 * }} information to be passed in from parent component
 *
 * @return component.
 */
const BaseMap = (context) => {
    return (
        <React.Fragment>
            <MapContainer
                center={[INITIAL_VIEW_STATE.latitude, INITIAL_VIEW_STATE.longitude]}
                zoom={INITIAL_VIEW_STATE.zoom}
                style={{height: "100vh"}}
            >
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <TransitLayer
                    vehicleIds={context.vehicleIds}
                    stopIds={context.stopIds}
                    routeIds={context.routeIds}
                    manager={context.manager}
                    selection={context.selection}
                    setSelection={context.setSelection}
                />
            </MapContainer>
        </React.Fragment>
    );
}




/**
 * Transit Layer component.
 *
 * @param context {{
 *     manager: TransitManager
 *     vehicleIds: string[]
 *     routeIds: string[]
 *     stopIds: string[]
 *     selection: {
 *         type: ("vehicle"|"route"|"stop")
 *         id: string
 *     } | null
 *     setSelection: function({
 *         type: ("vehicle"|"route"|"stop")
 *         id: string
 *     }) | null
 * }} information to be passed in from parent component
 *
 * @return {JSX.Element} component
 */
const TransitLayer = (context) => {
    return (
        <React.Fragment>

            {context.vehicleIds.map((vehicleId) => (
                <VehicleElement
                    key={`vehicle-${vehicleId}`}
                    manager={context.manager}
                    vehicleId={vehicleId}
                    setSelection={context.setSelection}
                />
            ))}

            {context.routeIds.map((routeId) => (
                <RouteElement
                    key={`route-${routeId}`}
                    manager={context.manager}
                    routeIds={context.routeIds}
                    routeId={routeId}
                    setSelection={context.setSelection}
                />
            ))}

            {context.stopIds.map((stopId) => (
                <StopElement
                    key={`stop-${stopId}`}
                    manager={context.manager}
                    routeIds={context.routeIds}
                    stopId={stopId}
                    setSelection={context.setSelection}
                />
            ))}

        </React.Fragment>
    );
}

/**
 * Vehicle Element component.
 *
 * @param context {{
 *     manager: TransitManager
 *     vehicleId: string
 *     setSelection: function({
 *         type: ("vehicle"|"route"|"stop")
 *         id: string
 *     }) | null
 * }} information to be passed in from parent component
 *
 * @return component
 */
const VehicleElement = (context) => {

    const [position, setPosition] = useState([0,0]);

    useEffect(() => {
        const updatePositionInterval = setInterval(() => {
            const vehicle = context.manager.getVehicle(context.vehicleId);
            setPosition([vehicle.location.lat, vehicle.location.lng]);
        }, VEHICLE_DATA_UPDATE_INTERVAL);

        return () => clearInterval(updatePositionInterval);
    }, [])

    return (
        <React.Fragment>

            {(() => {
                const vehicle = context.manager.getVehicle(context.vehicleId);
                const route = context.manager.getRoute(vehicle.routeId);
                return (
                    <ReactLeafletDriftMarker
                        position={{
                            lat: position[0],
                            lon: position[1]
                        }}
                        icon={divIcon({
                            html: `<div style="border-radius: 50%; background: #${route.color}; border-style: solid; border-color: black; border-width: 1px; width: 15px; height: 15px; font-size: 10px; font-weight: bolder; color: #${route.textColor}">${route.shortName}</div>`
                        })}
                        duration={VEHICLE_DATA_UPDATE_INTERVAL}
                        eventHandlers={{
                            click: () => context.setSelection({ type: "vehicle", id: context.vehicleId})
                        }}
                    />
                );
            })()}

        </React.Fragment>
    );
}

/**
 * Route Element component
 *
 * @param context {{
 *     manager: TransitManager
 *     routeIds: string[]
 *     routeId: string
 *     setSelection: function({
 *         type: ("vehicle"|"route"|"stop")
 *         id: string
 *     }) | null
 * }} information to be passed in from parent component
 *
 * @return {JSX.Element} component
 */
const RouteElement = (context) => {

    const [geoFeatures, setGeoFeatures] = useState([]);

    useEffect(() => {
        const route = context.manager.getRoute(context.routeId);
        const features = route.segments.map((segmentId) => {
            const segment = context.manager.getSegment(segmentId);
            const geometry = polyline.toGeoJSON(segment.polyline);
            const routeIds = context.routeIds.filter((routeId, i) => {
                return context.manager.getRoute(routeId).segments.includes(segmentId);
            });

            const dashLength = 8;
            const dashesInGroup = routeIds.length;
            const dashGroupIndex = routeIds.indexOf(context.routeId);
            const preGap = dashGroupIndex * dashLength;
            const postGap = dashesInGroup * dashLength - preGap - dashLength;

            const dashArray = [0, preGap, dashLength, postGap];

            return {
                key: `route-${route.routeId}_segment-${segment.segmentId}_dash-${dashArray.toString()}`,
                data: geometry,
                style: {
                    color: "#" + route.color,
                    dashArray: dashArray
                }
            }
        });

        setGeoFeatures(features);
    }, [context.routeIds]);

    return (
        <React.Fragment>
            {geoFeatures.map((feature) => (
                <GeoJSON {...feature} />
            ))}
        </React.Fragment>
    );

}

/**
 * Stop Element component
 *
 * @param context {{
 *     manager: TransitManager
 *     routeIds: string[]
 *     stopId: string
 *     setSelection: function({
 *         type: ("vehicle"|"route"|"stop")
 *         id: string
 *     }) | null
 *
 * }} information to be passed in from parent component
 *
 * @return {JSX.Element} component
 */
const StopElement = (context) => {
    return (
        <React.Fragment>
            {(() => {
                const stop = context.manager.getStop(context.stopId);
                const colors = [];

                for (const routeId of stop.routes) {
                    if (!context.routeIds.includes(routeId)) continue;
                    const route = context.manager.getRoute(routeId);
                    colors.push(route.color);
                }

                const d = {
                    stopId: stop.stopId,
                    name: stop.name,
                    latitude: stop.location.lat,
                    longitude: stop.location.lng,
                    colors: colors
                }

                let bgGradient = 'conic-gradient(';
                for (let i = 0; i < colors.length; i++) {
                    const el = `#${colors[i]} 0 ${(360 / colors.length) * (i + 1)}deg`;
                    bgGradient += `${el}${i === colors.length - 1 ? ')' : ','}`;
                }

                return (
                    <Marker
                        position={[d.latitude, d.longitude]}
                        icon={divIcon({
                            className: "",
                            html: `<div style="border-radius: 50%; background: ${bgGradient}; border-style: solid; border-color: black; border-width: 1px; width: 8px; height: 8px"/>`
                        })}
                        eventHandlers={{
                            click: (e) => {
                                context.setSelection({ type: "stop", id: context.stopId });
                            }
                        }}
                    />
                );
            })()}
        </React.Fragment>
    );
}

export default TransitMap;