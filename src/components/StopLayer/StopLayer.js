import {Marker} from "react-leaflet";
import {divIcon} from "leaflet";
import React, {useState, useEffect} from "react";

/**
 * Layer for BaseMap to display stops.
 *
 * @param {TransitManager} manager manager
 * @param {[string]} stopIds ids of stops to display
 * @param {[string]} routeIds ids of routes to handle
 * @param {function} setSelection function to set selection
 * @returns {JSX.Element} component
 */
const StopLayer = ({manager, stopIds, routeIds, setSelection}) => {
    const [displayInfo, setDisplayInfo] = useState([]);

    useEffect(() => {
        const newDisplayInfo = stopIds.map(stopId => {
            const stop = manager.getStop(stopId);
            const colors = [];

            for (const routeId of stop.routes) {
                if (!routeIds.includes(routeId)) continue;
                const route = manager.getRoute(routeId);
                colors.push(route.color);
            }

            const data = {
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

            return {
                data: data,
                bgGradient: bgGradient
            };
        });
        setDisplayInfo(newDisplayInfo);
    }, [stopIds, routeIds]);

    return (
        <React.Fragment>
            {displayInfo.map(info => {
                const data = info.data;
                const bgGradient = info.bgGradient;

                return (
                    <Marker
                        key={`stop-${data.stopId}`}
                        position={[data.latitude, data.longitude]}
                        icon={divIcon({
                            className: "",
                            html: `<div style="border-radius: 50%; background: ${bgGradient}; border-style: solid; border-color: black; border-width: 1px; width: 8px; height: 8px"/>`
                        })}
                        eventHandlers={{
                            click: (e) => {
                                setSelection({ type: "stop", id: data.stopId });
                            }
                        }}
                    />
                );
            })}
        </React.Fragment>
    )
}

export default StopLayer;