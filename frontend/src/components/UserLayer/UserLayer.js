import ReactLeafletDriftMarker from "react-leaflet-drift-marker";
import {divIcon} from "leaflet";
import React, {useEffect, useState} from "react";

const UserLayer = () => {
    // How often we update user position (ms)
    const USER_POSITION_UPDATE_INTERVAL = 3000;

    // Whether geolocation data for the user is available or not (undefined if we don't know yet)
    const [geoAvailable, setGeoAvailable] = useState(undefined);
    // Current position of the user (undefined if we don't know yet), object with "lat" and "lon" attributes
    const [userPosition, setUserPosition] = useState(undefined);

    useEffect(() => {
        // TODO: Use geoAvailable to prompt error/warning screen
        if ("geolocation" in navigator) {
            console.log("geolocation available");
            setGeoAvailable(true);
        } else {
            console.log("geolocation not available");
            setGeoAvailable(false);
        }
    }, []);

    useEffect(() => {
        // TODO: Refactor to use watchPosition instead
        const updateLoop = setTimeout(() => {
            navigator.geolocation.getCurrentPosition((res) => {
                setUserPosition({
                    lat: res.coords.latitude,
                    lon: res.coords.longitude
                });
                console.log(res);
                console.log(userPosition);
            }, (err) => {
                setUserPosition(undefined);
                console.log(err);
            });
        }, USER_POSITION_UPDATE_INTERVAL);
        return () => clearTimeout(updateLoop);
    }, [userPosition]);

    return (
        <React.Fragment>
            {((userPosition) => {
                console.log(userPosition);
                if (!userPosition) return null;
                return (
                    <ReactLeafletDriftMarker
                        key={'user-marker'}
                        position={userPosition}
                        icon={divIcon({
                            html: `<div style="border-radius: 50%; background: dodgerblue; border-style: solid; border-color: white; box-shadow: 0 0 0 1px black; border-width: 3px; width: 14px; height: 14px; font-size: 8px; font-weight: bolder; display: flex; align-items: center; justify-content: center"></div>`,
                        })}
                        duration={USER_POSITION_UPDATE_INTERVAL}
                    />
                );
            })(userPosition)}
        </React.Fragment>
    );
}

export default UserLayer;