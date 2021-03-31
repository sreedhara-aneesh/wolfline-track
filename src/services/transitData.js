const polyline = require('@mapbox/polyline');
const axios = require("axios").default;

const allRoutes = async () => {
    const opRoutes = {
        method: 'GET',
        url: 'https://transloc-api-1-2.p.rapidapi.com/routes.json',
        params: {agencies: '16'},
        headers: {
            'x-rapidapi-key': process.env.REACT_APP_TRANSLOC_KEY,
            'x-rapidapi-host': process.env.REACT_APP_TRANSLOC_HOST
        }
    };
    const rawRoutes = (await axios.request(opRoutes)).data.data['16'];

    let routeMap = new Map();
    for (const route of rawRoutes) {
        routeMap.set(route.route_id, {
            segments: route.segments,
            color: route.color
        });
    }

    return routeMap;
}

const allSegments = async () => {
    const opSegments = {
        method: 'GET',
        url: 'https://transloc-api-1-2.p.rapidapi.com/segments.json',
        params: {agencies: '16'},
        headers: {
            'x-rapidapi-key': process.env.REACT_APP_TRANSLOC_KEY,
            'x-rapidapi-host': process.env.REACT_APP_TRANSLOC_HOST
        }
    };
    const rawSegments = (await axios.request(opSegments)).data.data;

    const segmentMap = new Map();
    for (const [key, value] of Object.entries(rawSegments)) {
        segmentMap.set(key, {
            GeoJSON: polyline.toGeoJSON(value),
            colors: []
        });
    }

    const routes = await allRoutes();
    for (const [key, value] of routes) {
        for (const segment of value.segments) {
            const oldValue = segmentMap.get(segment[0]);
            if (oldValue.colors.includes(value.color)) {
                continue;
            }
            segmentMap.set(segment[0], {
                GeoJSON: oldValue.GeoJSON,
                colors: [...oldValue.colors, value.color]
            });
        }
    }

    return segmentMap;
}

const allVehicles = async () => {
    const opVehicles = {
        method: 'GET',
        url: 'https://transloc-api-1-2.p.rapidapi.com/vehicles.json',
        params: {agencies: '16'},
        headers: {
            'x-rapidapi-key': process.env.REACT_APP_TRANSLOC_KEY,
            'x-rapidapi-host': process.env.REACT_APP_TRANSLOC_HOST
        }
    };
    const rawVehicles = (await axios.request(opVehicles)).data.data['16'];

    const routes = await allRoutes();

    let vehicleMap = new Map();
    for (const vehicle of rawVehicles) {
        vehicleMap.set(vehicle.vehicle_id, {
            location: vehicle.location,
            route: vehicle.route_id,
            color: routes.get(vehicle.route_id).color,
            heading: vehicle.heading
        });
    }
    console.log(vehicleMap);
    return vehicleMap;
}

const allStops = async () => {
    const opStops = {
        method: 'GET',
        url: 'https://transloc-api-1-2.p.rapidapi.com/stops.json',
        params: {agencies: '16'},
        headers: {
            'x-rapidapi-key': process.env.REACT_APP_TRANSLOC_KEY,
            'x-rapidapi-host': process.env.REACT_APP_TRANSLOC_HOST
        }
    };
    const rawStops = (await axios.request(opStops)).data.data;

    let stopMap = new Map();
    for (const stop of rawStops) {
        stopMap.set(stop.stop_id, {
            location: stop.location,
            routes: stop.routes
        });
    }

    return stopMap;
}

module.exports = {
    allSegments,
    allVehicles,
    allStops
};