import ReactLeafletDriftMarker from "react-leaflet-drift-marker";
import {divIcon} from "leaflet";
import React, {useState, useEffect} from "react";
import './VehicleLayer.css';

/**
 * Layer for BaseMap that displays vehicles.
 *
 * @param {Object} props props
 * @param {TransitManager} props.manager manager
 * @param {[string]} props.vehicleIds ids of vehicles to display
 *
 * @returns {JSX.Element} component
 */
const VehicleLayer = ({manager, vehicleIds, setSelection}) => {
    const [displayInfo, setDisplayInfo] = useState([]);

    const VEHICLE_DATA_UPDATE_INTERVAL = 3000;

    useEffect(() => {
        loadDisplayInfo({manager: manager, vehicleIds: vehicleIds});
    }, [vehicleIds]);

    useEffect(() => {
        const updateLoop = setTimeout(() => {
            loadDisplayInfo({manager: manager, vehicleIds: vehicleIds});
        }, VEHICLE_DATA_UPDATE_INTERVAL);
        return () => clearTimeout(updateLoop);
    }, [displayInfo]);

    const loadDisplayInfo = ({manager, vehicleIds}) => {
        const newDisplayInfo = vehicleIds.map(vehicleId => {
            const vehicle = manager.getVehicle(vehicleId);
            const route = manager.getRoute(vehicle.routeId);
            return {
                vehicleId: vehicleId,
                location: {
                    lat: vehicle.location.lat,
                    lon: vehicle.location.lng
                },
                color: `#${route.color}`,
                textColor: `#${route.textColor}`,
                routeShortName: route.shortName
            }
        });
        console.log(vehicleIds);
        console.log(newDisplayInfo);
        setDisplayInfo(newDisplayInfo);
    }

    const generateVehicleMarkers = ({displayInfo, setSelection}) => {
        const markers = displayInfo.map(info => (
            <ReactLeafletDriftMarker
                key={info.vehicleId}
                position={info.location}
                icon={divIcon({
                    html: `<div style="border-radius: 50%; background: ${info.color}; border-style: solid; border-color: black; border-width: 2px; width: 16px; height: 16px; font-size: 8px; font-weight: bolder; color: ${info.textColor}; display: flex; align-items: center; justify-content: center">${info.routeShortName}</div>`,
                })}
                duration={VEHICLE_DATA_UPDATE_INTERVAL}
                eventHandlers={{
                    click: () => setSelection({ type: "vehicle", id: info.vehicleId})
                }}
            />
        ));
        return markers;
    }

    return (
        <React.Fragment>
            {generateVehicleMarkers({
                displayInfo: displayInfo,
                setSelection: setSelection
            })}
        </React.Fragment>
    );
}

export default VehicleLayer;