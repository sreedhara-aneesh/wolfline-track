import {
    Route,
    Segment,
    Vehicle,
    Stop,
    Location,
    ArrivalEstimate,
    DissolvedSegment
} from './structures';

const dissolve = require('geojson-linestring-dissolve');
const polyline = require('@mapbox/polyline');

/**
 * Creates an array of DissolvedSegment objects that will be used for map rendering.
 * By joining segments that share the same routes and are on the same line, rendering can be sped up greatly.
 *
 * @param {Map<string,Route>} routeMap route map
 * @param {Map<string,Segment>} segmentMap segment map
 * @return {[DissolvedSegment]} DissolvedSegment array
 */
const dissolveSegmentsMatchingRoutes = (routeMap, segmentMap) => {
    const dissolvedSegments = [];
    for (const [key, value] of segmentMap) {
        const dissolved = new DissolvedSegment(
            [key],
            polyline.toGeoJSON(value.polyline),
            getSegmentRoutes(key, segmentMap, routeMap)
        );
        dissolvedSegments.push(dissolved);
    }

    for (let i = 0; i < dissolvedSegments.length; i++) {
        for (let j = i + 1; j < dissolvedSegments.length; j++) {
            const merged = mergeDissolvedSegments(dissolvedSegments[i], dissolvedSegments[j]);
            if (merged != null) {
                dissolvedSegments.splice(j, 1);
                dissolvedSegments.splice(i, 1);
                dissolvedSegments.push(merged);
                j--;
            }
        }
    }

    return dissolvedSegments;
}

/**
 * Attempt to merge two DissolvedSegment objects.
 * This can only be done if the lines themselves (GeoJSON) can be be dissolved AND if both hold the same routes.
 *
 * @param {DissolvedSegment} dSegmentA dissolved segment a
 * @param {DissolvedSegment} dSegmentB dissolved segment b
 * @return {DissolvedSegment | null} new DissolvedSegment or null if cannot be merged
 */
const mergeDissolvedSegments = (dSegmentA, dSegmentB) => {
    const res = dissolve([dSegmentA.data, dSegmentB.data]);
    if (res.type === 'MultiLineString') {
        return null;
    }

    if (dSegmentA.routes.length !== dSegmentB.routes.length) {
        return null;
    }
    for (const route of dSegmentA.routes) {
        if (!dSegmentB.routes.includes(route)) {
            return null;
        }
    }

    const dissolved = new DissolvedSegment(
        [...dSegmentA.segments, ...dSegmentB.segments],
        res,
        dSegmentA.routes
    );

    return dissolved;
}

/**
 * Gets a segment's routes.
 *
 * @param {string} segment segment id
 * @param {Map<string,Segment>} segmentMap segment map
 * @param {Map<string,Route>} routeMap route map
 * @return {[string]} string array of route ids
 */
const getSegmentRoutes = (segment, segmentMap, routeMap) => {
    const routes = [];
    for (const [key, value] of routeMap) {
        if (value.segments.includes(segment)) {
            routes.push(key);
        }
    }
    return routes;
}

export {
    dissolveSegmentsMatchingRoutes,
    getSegmentRoutes
}