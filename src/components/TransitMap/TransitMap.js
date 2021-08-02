import React from 'react';
import {
    useState,
    useEffect
} from 'react';
import {
    TransitManager
} from '../../services/transit/structures';
import SettingsDrawer from "../SettingsDrawer/SettingsDrawer";
import {
    Button,
    Drawer,
    Tag,
    Switch,
    Timeline,
    Card, Collapse
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
import VehicleLayer from "../VehicleLayer/VehicleLayer";
import RouteLayer from "../RouteLayer/RouteLayer";
import StopLayer from "../StopLayer/StopLayer";



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
            console.log("manager could not be initialized");
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

            // push ids of vehicles that service selected routes to above array
            for (const vehicleId of manager.getVehicleIds()) {
                const vehicle = manager.getVehicle(vehicleId);
                if (routeIds.includes(vehicle.routeId)) newVehicleIds.push(vehicleId);
            }

            // push ids of stops that service selected routes to above array
            for (const stopId of manager.getStopIds()) {
                const stop = manager.getStop(stopId);
                for (const routeId of stop.routes) {
                    if (routeIds.includes(routeId)) {
                        newStopIds.push(stopId);
                        break;
                    }
                }
            }

            // set updated information
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

            {/*<InfoDrawer*/}
            {/*    manager={manager}*/}
            {/*    selection={selection}*/}
            {/*    setSelection={setSelection}*/}
            {/*/>*/}

            <SelectionDrawer
                manager={manager}
                routeIds={routeIds}
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

            {/* button to open settings drawer */}
            <Button
                style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "20px",
                    zIndex: 400
                }}
                onClick={() => {
                    setSettingsOpen(true);
                    console.log("settings open: " + settingsOpen);
                }}
                type={"primary"}
            >
                Route Selection
            </Button>

        </div>
    );
}


/**
 * Drawer to display information when the user selects a component.
 *
 * @param {Object} props props
 * @param {TransitManager} manager manager in use
 * @param {[string]} routeIds ids of selected routes
 * @param {{
 *     type: ("vehicle"|"route"|"stop")
 *     id: string
 * } | null} selection selection to display info for
 * @param {function} setSelection function to set selection
 * @returns {JSX.Element} component
 */
const SelectionDrawer = ({manager, routeIds, selection, setSelection}) => {

    /**
     * Generates a Collapse for information of upcoming arrivals for a stop.
     *
     * @param {Object} args arguments
     * @param {TransitManager} args.manager manager
     * @param {string} args.stopId stop id
     * @param {[string]} args.routeIds ids of selected routes
     * @returns {JSX.Element} component
     */
    const generateStopRouteCollapse = ({manager, stopId, routeIds}) => {
        const collapsePanels = routeIds.map(routeId => {
            const route = manager.getRoute(routeId);
            return (
                <Collapse.Panel key={`${stopId}-${routeId}`} header={<span><Tag color={`#${route.color}`}>{route.shortName}</Tag>{route.longName}</span>}>
                    {generateStopRouteCollapsePanelTimeline({
                        manager: manager,
                        stopId: stopId,
                        routeId: routeId
                    })}
                </Collapse.Panel>
            );
        });
        return (
            <Collapse>
                {collapsePanels}
            </Collapse>
        )
    }

    /**
     * Generates a Timeline that should be placed within a Collapse Panel.
     *
     * @param {Object} args arguments
     * @param {TransitManager} args.manager manager
     * @param {string} args.stopId stop id
     * @param {string} args.routeId route id
     * @returns {JSX.Element} component
     */
    const generateStopRouteCollapsePanelTimeline = ({manager, stopId, routeId}) => {
        const allEstimates = manager.arrivalEstimates;
        const estimates = allEstimates.filter(estimate => {
            return estimate.routeId === routeId && estimate.stopId === stopId;
        });
        estimates.sort((a, b) => {
            return (new Date(a.arrivalAt)).getTime() - (new Date(b.arrivalAt)).getTime();
        });
        const timelineItems = estimates.map(estimate => {
            const date = new Date(estimate.arrivalAt);
            const vehicle = manager.getVehicle(estimate.vehicleId);
            return (
                <Timeline.Item key={`${estimate.vehicleId}-${estimate.stopId}-${estimate.arrivalAt}`}>
                    <p><b>Vehicle:</b> {vehicle.callName}</p>
                    <p><b>Arrival:</b> `${date.getHours()}:${date.getMinutes()}</p>
                </Timeline.Item>
            );
        });
        return (
            <Timeline>
                {timelineItems}
            </Timeline>
        );
    }

    return (
        <Drawer
            title={"Selection"}
            placement={"left"}
            closable={true}
            onClose={() => {
                setSelection(null);
            }}
            visible={selection !== null}
        >
            {selection?.id === "stop" ? (
                generateStopRouteCollapse({
                    manager: manager,
                    stopId: selection.id,
                    routeIds: routeIds
                })
            ) : null}
        </Drawer>
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
        <MapContainer
            center={[INITIAL_VIEW_STATE.latitude, INITIAL_VIEW_STATE.longitude]}
            zoom={INITIAL_VIEW_STATE.zoom}
            style={{height: "100vh"}}
        >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <VehicleLayer
                manager={context.manager}
                vehicleIds={context.vehicleIds}
                setSelection={context.setSelection}
            />
            <RouteLayer
                manager={context.manager}
                routeIds={context.routeIds}
                setSelection={context.setSelection}
            />
            <StopLayer
                manager={context.manager}
                stopIds={context.stopIds}
                routeIds={context.routeIds}
                setSelection={context.setSelection}
            />
        </MapContainer>
    );
}

export default TransitMap;