import axios from "axios";
import {
    Route,
    Segment,
    Vehicle,
    Stop,
    Location,
    ArrivalEstimate
} from './structures';

/**
 * Generates a map of Route objects, routeId => Route
 * @returns {Promise<Map<string, Route>>}
 */
const genRouteMap = async () => {
    const options = {
        method: 'GET',
        url: 'https://transloc-api-1-2.p.rapidapi.com/routes.json',
        params: {agencies: '16'},
        headers: {
            'x-rapidapi-key': process.env.REACT_APP_TRANSLOC_KEY,
            'x-rapidapi-host': process.env.REACT_APP_TRANSLOC_HOST
        }
    }
    const routeData = (await axios.request(options)).data.data['16'];

    const routeMap = new Map();

    for (const el of routeData) {
        const segments = el['segments'].map((es) => {
            return es[0];
        })
        const route = new Route(
            el['route_id'],
            el['short_name'],
            el['long_name'],
            segments,
            el['stops'],
            el['is_active'],
            el['color'],
            el['text_color']
        );
        routeMap.set(route.routeId, route);
    }

    return routeMap;
}

/**
 * Generates a map of Segment objects, id => Segment
 * @returns {Promise<Map<string, Segment>}
 */
const genSegmentMap = async() => {
    const options = {
        method: 'GET',
        url: 'https://transloc-api-1-2.p.rapidapi.com/segments.json',
        params: {agencies: '16'},
        headers: {
            'x-rapidapi-key': process.env.REACT_APP_TRANSLOC_KEY,
            'x-rapidapi-host': process.env.REACT_APP_TRANSLOC_HOST
        }
    };
    const segmentData = (await axios.request(options)).data.data;

    const segmentMap = new Map();

    for (const [key, value] of Object.entries(segmentData)) {
        const segment = new Segment(
            key,
            value
        );
        segmentMap.set(segment.segmentId, segment);
    }

    return segmentMap;
}

/**
 * Generates a map of Vehicle objects, id => Vehicle
 * @returns {Promise<Map<string, Vehicle>>}
 */
const genVehicleMap = async() => {
    const options = {
        method: 'GET',
        url: 'https://transloc-api-1-2.p.rapidapi.com/vehicles.json',
        params: {agencies: '16'},
        headers: {
            'x-rapidapi-key': process.env.REACT_APP_TRANSLOC_KEY,
            'x-rapidapi-host': process.env.REACT_APP_TRANSLOC_HOST
        }
    }
    const vehicleData = (await axios.request(options)).data.data['16'];

    const vehicleMap = new Map();

    // if no vehicles are reported
    if (vehicleData == null) {
        return vehicleMap;
    }

    for (const el of vehicleData) {
        const location = new Location(
            el['location']['lat'],
            el['location']['lng']
        );
        const arrivalEstimates = el['arrival_estimates'].map((es) => {
            const arrivalEstimate = new ArrivalEstimate(
                es['route_id'],
                es['arrival_at'],
                es['stop_id']
            );
            return arrivalEstimate;
        });
        const vehicle = new Vehicle(
            el['vehicle_id'],
            el['route_id'],
            el['call_name'],
            location,
            el['heading'],
            arrivalEstimates,
            el['tracking_status'],
            el['passenger_load'],
            el['standing_capacity'],
            el['seating_capacity']
        );
        vehicleMap.set(vehicle.vehicleId, vehicle);
    }

    return vehicleMap;
}

/**
 * Generates a map of Stop objects, id => Stop
 * @returns {Promise<Map<string, Stop>>}
 */
const genStopMap = async() => {
    const options = {
        method: 'GET',
        url: 'https://transloc-api-1-2.p.rapidapi.com/stops.json',
        params: {agencies: '16'},
        headers: {
            'x-rapidapi-key': process.env.REACT_APP_TRANSLOC_KEY,
            'x-rapidapi-host': process.env.REACT_APP_TRANSLOC_HOST
        }
    };
    const stopData = (await axios.request(options)).data.data;

    const stopMap = new Map();

    for (const el of stopData) {
        const location = new Location(
            el['location']['lat'],
            el['location']['lng']
        );
        const stop = new Stop(
            el['stop_id'],
            el['stop_code'],
            location,
            el['routes'],
            el['name']
        );
        stopMap.set(stop.stopId, stop);
    }

    return stopMap;
}

export {
    genRouteMap,
    genSegmentMap,
    genStopMap,
    genVehicleMap
}