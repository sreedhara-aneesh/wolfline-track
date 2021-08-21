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
} from 'antd';
import {
    MapContainer,
    TileLayer,
} from "react-leaflet";
import VehicleLayer from "../VehicleLayer/VehicleLayer";
import RouteLayer from "../RouteLayer/RouteLayer";
import StopLayer from "../StopLayer/StopLayer";
import SelectionDrawer from "../SelectionDrawer/SelectionDrawer";
import UserLayer from "../UserLayer/UserLayer";

/**
 * Transit Map component.
 *
 * @return {JSX.Element} component
 */
const TransitMap = () => {

    /**
     * Interval in milliseconds between updates of vehicle data.
     *
     * @type {number}
     */
    const VEHICLE_DATA_UPDATE_INTERVAL = 3000;

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
            // get active routes
            const initRouteIds = manager.getRouteIds().filter((routeId) => {
                const route = manager.getRoute(routeId);
                return route.isActive;
            });
            // set active routes as initial selected
            setRouteIds(initRouteIds);
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
                Route Visibility
            </Button>

        </div>
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

    const INITIAL_VIEW_STATE = {
        latitude: 35.78,
        longitude: -78.68,
        zoom: 14
    }

    return (
        <MapContainer
            center={[INITIAL_VIEW_STATE.latitude, INITIAL_VIEW_STATE.longitude]}
            zoom={INITIAL_VIEW_STATE.zoom}
            style={{height: "100vh"}}
        >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url={"https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png"}
                // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
            <UserLayer />
        </MapContainer>
    );
}



export default TransitMap;