import {GeoJSON} from "react-leaflet";
import React, {useState, useEffect} from "react";
import polyline from '@mapbox/polyline';

/**
 * Layer for BaseMap that shows routes.
 *
 * @param {Object} props props
 * @param {TransitManager} manager manager
 * @param {[string]} routeIds selected route ids
 * @param {function} setSelection function to set selection
 * @returns {JSX.Element} component
 */
const RouteLayer = ({manager, routeIds, setSelection}) => {

    const [displayInfo, setDisplayInfo] = useState([]);

    /**
     * Generates a route's GeoJSON features.
     *
     * @param {TransitManager} manager manager
     * @param {string} routeId id of route
     * @returns {[Object]} GeoJSON features
     */
    const getRouteFeatures = (manager, routeId) => {
        const route = manager.getRoute(routeId);
        return route.segments.map(segmentId => {
            const segment = manager.getSegment(segmentId);
            const geometry = polyline.toGeoJSON(segment.polyline);
            const segRouteIds = routeIds.filter(routeId => {
                return manager.getRoute(routeId).segments.includes(segmentId);
            });

            const dashLength = 8;
            const dashesInGroup = segRouteIds.length;
            const dashGroupIndex = segRouteIds.indexOf(routeId);
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
    }

    useEffect(() => {
        const newDisplayInfo = routeIds.map(routeId => {
            const features = getRouteFeatures(manager, routeId);
            return {
                routeId: routeId,
                features: features
            }
        });
        setDisplayInfo(newDisplayInfo);
        console.log(newDisplayInfo);
    }, [routeIds]);

    return (
        <React.Fragment>
            {displayInfo.map(info => info.features.map(feature => (
                <GeoJSON {...feature}/>
            )))}
        </React.Fragment>
    );
}

export default RouteLayer;
