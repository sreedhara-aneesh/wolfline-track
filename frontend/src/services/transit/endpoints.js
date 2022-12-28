import axios from "axios";
import {
    Route,
    Segment,
    Vehicle,
    Stop,
    Location,
    ArrivalEstimate
} from './structures';

const backend_url = 'http://localhost:5000'

/**
 * Generates a map of Route objects, routeId => Route
 * @returns {Promise<Map<string, Route>>}
 */
const genRouteMap = async () => {
    const options = {
        method: 'GET',
        url: `${backend_url}/routeData`
    }
    const routeData = (await axios.request(options)).data;

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
        url: `${backend_url}/segmentData`
    };
    const segmentData = (await axios.request(options)).data;

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
        url: `${backend_url}/vehicleData`
    }
    const vehicleData = (await axios.request(options)).data;
    console.log(vehicleData);

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
        url: `${backend_url}/stopData`
    };
    const stopData = (await axios.request(options)).data;

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

/**
 * Generates an array of the latest arrival estimates.
 * @returns {Promise<[ArrivalEstimate]>}
 */
const genArrivalEstimates = async () => {
    const options = {
        method: 'GET',
        url: `${backend_url}/arrivalEstimateData`,
    };

    const arrivalEstimateData = (await axios.request(options)).data;
    const retArr = [];

    for (const datum of arrivalEstimateData) {
        for (const arrival of datum['arrivals']) {
            retArr.push(new ArrivalEstimate(
                arrival['route_id'],
                arrival['arrival_at'],
                datum['stop_id'],
                arrival['vehicle_id']
            ));
        }
    }

    return retArr;
}

export {
    genRouteMap,
    genSegmentMap,
    genStopMap,
    genVehicleMap,
    genArrivalEstimates
}