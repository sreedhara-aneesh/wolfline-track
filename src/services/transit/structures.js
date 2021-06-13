import {
    genRouteMap,
    genVehicleMap,
    genStopMap,
    genSegmentMap, genArrivalEstimates
} from "./endpoints";

/**
 * A manager class for transit data.
 */
class TransitManager {
    /**
     * Route map
     */
    _routeMap;
    /**
     * Segment map
     */
    _segmentMap;
    /**
     * Vehicle map
     */
    _vehicleMap;
    /**
     * Stop map
     */
    _stopMap;
    /**
     * Arrival estimates
     */
    _arrivalEstimates;
    /**
     * Whether or not the manager is initialized
     */
    _initialized = false;

    /**
     * Class constructor
     */
    constructor() {}

    /**
     * Initializes the manager
     * @return {Promise<boolean>} true if initialized
     */
    async initialize() {
        this.routeMap = await genRouteMap();
        this.segmentMap = await genSegmentMap();
        this.stopMap = await genStopMap();
        this.vehicleMap = await genVehicleMap();
        this.arrivalEstimates = await genArrivalEstimates();
        // TODO: deal with api failures
        this.initialized = true;
        return this.initialized;
    }

    /**
     * Updates vehicle information
     * @return {Promise<boolean>} true if successful
     */
    async updateVehicleData() {
        this.vehicleMap = await genVehicleMap();
        // TODO: deal with api failures
        return true;
    }

    /**
     * Updates arrival estimates
     * @return {Promise<boolean>} true if successful
     */
    async updateArrivalEstimates() {
        this.arrivalEstimates = await genArrivalEstimates();
        // TODO: deal with api failures
        return true;
    }

    /**
     * Gets an array of route ids
     * @return {string[]} ids
     */
    getRouteIds() {
        if (!this.initialized) return [];
        return Array.from(this.routeMap.keys());
    }

    /**
     * Gets a route object for given id
     * @param routeId route id
     * @return {Route} route object
     */
    getRoute(routeId) {
        return this.routeMap.get(routeId);
    }

    /**
     * Gets an array of segment ids
     * @return {string[]} ids
     */
    getSegmentIds() {
        if (!this.initialized) return [];
        return Array.from(this.segmentMap.keys());
    }

    /**
     * Gets a segment object for given ids
     * @param segmentId segment id
     * @return {Segment} segment object
     */
    getSegment(segmentId) {
        return this.segmentMap.get(segmentId);
    }

    /**
     * Gets an array of vehicle ids
     * @return {string[]} ids
     */
    getVehicleIds() {
        if (!this.initialized) return [];
        return Array.from(this.vehicleMap.keys());
    }

    /**
     * Gets a vehicle object for given id
     * @param vehicleId vehicle id
     * @return {Vehicle} vehicle object
     */
    getVehicle(vehicleId) {
        return this.vehicleMap.get(vehicleId);
    }

    /**
     * Gets an array of stop ids
     * @return {string[]} ids
     */
    getStopIds() {
        if (!this.initialized) return [];
        return Array.from(this.stopMap.keys());
    }

    /**
     * Gets a stop object for given id
     * @param stopId stop id
     * @return {Stop} stop object
     */
    getStop(stopId) {
        return this.stopMap.get(stopId);
    }

    /**
     * Gets the ids of routes which have a segment
     * @param segmentId id of segment
     * @return {string[]} route ids
     */
    getSegmentRoutes(segmentId) {
        const routes = [];
        for (const routeId of this.getRouteIds()) {
            if (routes.includes(routeId)) continue;
            if (this.getRoute(routeId).segments.includes(segmentId)) routes.push(routeId);
        }
        return routes;
    }

    /**
     * Gets route map
     * @return {Map<string,Route>} route map
     */
    get routeMap() {
        return this._routeMap;
    }

    /**
     * Sets route map
     * @param {Map<string,Route>} value
     */
    set routeMap(value) {
        this._routeMap = value;
    }

    /**
     * Gets segment map
     * @return {Map<string,Segment>} segment map
     */
    get segmentMap() {
        return this._segmentMap;
    }

    /**
     * Sets segment map
     * @param {Map<string,Segment>} value
     */
    set segmentMap(value) {
        this._segmentMap = value;
    }

    /**
     * Gets vehicle map
     * @return {Map<string,Vehicle>} vehicle map
     */
    get vehicleMap() {
        return this._vehicleMap;
    }

    /**
     * Sets vehicle map
     * @param {Map<string,Vehicle>} value
     */
    set vehicleMap(value) {
        this._vehicleMap = value;
    }

    /**
     * Gets stop map
     * @return {Map<string,Stop>} stop map
     */
    get stopMap() {
        return this._stopMap;
    }

    /**
     * Sets stop map
     * @param {Map<string,Stop>} value
     */
    set stopMap(value) {
        this._stopMap = value;
    }

    /**
     * Whether or not the manageris initialized
     * @return {boolean} true if initialized
     */
    get initialized() {
        return this._initialized;
    }

    /**
     * Set if manager is initialized
     * @param {boolean} value
     */
    set initialized(value) {
        this._initialized = value;
    }

    /**
     * Get arrival estimates
     * @return {[ArrivalEstimate]} arrival estimates
     */
    get arrivalEstimates() {
        return this._arrivalEstimates;
    }

    set arrivalEstimates(value) {
        this._arrivalEstimates = value;
    }
}

/**
 * Holds information on a route.
 */
class Route {
    /**
     * Route ID
     */
    routeId;
    /**
     * Route short name (like, "7R")
     */
    shortName;
    /**
     * Route long name (like, "Wolflink Shuttle")
     */
    longName;
    /**
     * Array of segment ids for this route's segments
     */
    segments;
    /**
     * Array of stop ids for this route's stops
     */
    stops;
    /**
     * Whether or not the route is active as of the time the current data was pulled.
     */
    isActive;
    /**
     * Route color in hex form without the starting #
     */
    color;
    /**
     * Route text color in hex form without the starting #
     */
    textColor;

    /**
     * Class constructor
     *
     * @param {string} routeId route id
     * @param {string} shortName short name
     * @param {string} longName long name
     * @param {[string]} segments array of segment ids
     * @param {[string]} stops array of stop ids
     * @param {boolean} isActive true if route is active
     * @param {string} color route's color
     * @param {string} textColor route's text color
     */
    constructor(routeId, shortName, longName, segments, stops, isActive, color, textColor) {
        this._routeId = routeId;
        this._shortName = shortName;
        this._longName = longName;
        this._segments = segments;
        this._stops = stops;
        this._isActive = isActive;
        this._color = color;
        this._textColor = textColor;
    }

    /**
     * Gets route id
     * @returns {string}
     */
    get routeId() {
        return this._routeId;
    }

    /**
     * Gets short name
     * @returns {string}
     */
    get shortName() {
        return this._shortName;
    }

    /**
     * Gets long name
     * @returns {string}
     */
    get longName() {
        return this._longName;
    }

    /**
     * Gets array of segment ids
     * @returns {[string]}
     */
    get segments() {
        return this._segments;
    }

    /**
     * Gets array of stop ids
     * @returns {[string]}
     */
    get stops() {
        return this._stops;
    }

    /**
     * Gets whether stop is active or not
     * @returns {boolean}
     */
    get isActive() {
        return this._isActive;
    }

    /**
     * Gets stop color
     * @returns {string}
     */
    get color() {
        return this._color;
    }

    /**
     * Gets stop text color
     * @returns {string}
     */
    get textColor() {
        return this._textColor;
    }
}

/**
 * Holds information on a segment.
 */
class Segment {
    /**
     * Segment id
     */
    segmentId;
    /**
     * Segment polyline encoded geography data (line)
     */
    polyline;

    /**
     * Class constructor
     *
     * @param {string} segmentId segment id
     * @param {string} polyline polyline encoded geography data
     */
    constructor(segmentId, polyline) {
        this._segmentId = segmentId;
        this._polyline = polyline;
    }

    /**
     * Gets segment id
     * @returns {string}
     */
    get segmentId() {
        return this._segmentId;
    }

    /**
     * Gets segment polyline
     * @returns {string]}
     */
    get polyline() {
        return this._polyline;
    }
}

/**
 * Holds information on a vehicle.
 */
class Vehicle {
    /**
     * Vehicle id
     */
    vehicleId;
    /**
     * ID of route for which this vehicle is running
     */
    routeId;
    /**
     * Vehicle call name
     */
    callName;
    /**
     * Location object for vehicle's location
     */
    location;
    /**
     * Vehicle heading
     */
    heading;
    /**
     * ArrivalEstimate object for vehicle's estimated stop arrivals
     */
    arrivalEstimates;
    /**
     * Vehicle tracking status
     */
    trackingStatus;
    /**
     * Vehicle's current passenger load
     */
    passengerLoad;
    /**
     * Vehicle's standing capacity
     */
    standingCapacity;
    /**
     * Vehicle's seating capacity
     */
    seatingCapacity;

    /**
     * Class constructor
     *
     * @param {string} vehicleId vehicle id
     * @param {string} routeId route id
     * @param {string} callName call name
     * @param {Location} location location
     * @param {number} heading heading
     * @param {[ArrivalEstimate]} arrivalEstimates array of arrival estimates
     * @param {string} trackingStatus tracking status
     * @param {number} passengerLoad passenger load
     * @param {number} standingCapacity standing capacity
     * @param {number} seatingCapacity seating capacity
     */
    constructor(vehicleId, routeId, callName, location, heading, arrivalEstimates, trackingStatus, passengerLoad, standingCapacity, seatingCapacity) {
        this._vehicleId = vehicleId;
        this._routeId = routeId;
        this._callName = callName;
        this._location = location;
        this._heading = heading;
        this._arrivalEstimates = arrivalEstimates;
        this._trackingStatus = trackingStatus;
        this._passengerLoad = passengerLoad;
        this._standingCapacity = standingCapacity;
        this._seatingCapacity = seatingCapacity;
    }

    /**
     * Gets vehicle id
     * @returns {string}
     */
    get vehicleId() {
        return this._vehicleId;
    }

    /**
     * Gets route id
     * @returns {string}
     */
    get routeId() {
        return this._routeId;
    }

    /**
     * Gets call name
     * @returns {string}
     */
    get callName() {
        return this._callName;
    }

    /**
     * Gets location
     * @returns {Location}
     */
    get location() {
        return this._location;
    }

    /**
     * Gets heading
     * @returns {number}
     */
    get heading() {
        return this._heading;
    }

    /**
     * Gets an array of arrival estimates
     * @returns {[ArrivalEstimate]}
     */
    get arrivalEstimates() {
        return this._arrivalEstimates;
    }

    /**
     * Gets tracking status
     * @returns {string}
     */
    get trackingStatus() {
        return this._trackingStatus;
    }

    /**
     * Gets passenger load
     * @returns {number}
     */
    get passengerLoad() {
        return this._passengerLoad;
    }

    /**
     * Gets standing capacity
     * @returns {number}
     */
    get standingCapacity() {
        return this._standingCapacity;
    }

    /**
     * Gets seating capacity
     * @returns {number}
     */
    get seatingCapacity() {
        return this._seatingCapacity;
    }
}

/**
 * Holds information on a stop.
 */
class Stop {
    /**
     * Stop id
     */
    stopId;
    /**
     * Stop code
     */
    code;
    /**
     * Location object for stop's location
     */
    location;
    /**
     * Array of route ids for the routes which service this stop
     */
    routes;
    /**
     * Stop's name
     */
    name;

    /**
     * Class constructor
     *
     * @param {string} stopId stop id
     * @param {string} code stop code
     * @param {Location} location stop location
     * @param {[string]} routes array of route ids
     * @param {string} name stop name
     */
    constructor(stopId, code, location, routes, name) {
        this._stopId = stopId;
        this._code = code;
        this._location = location;
        this._routes = routes;
        this._name = name;
    }

    /**
     * Gets stop ID
     * @returns {string}
     */
    get stopId() {
        return this._stopId;
    }

    /**
     * Gets stop code
     * @returns {string}
     */
    get code() {
        return this._code;
    }

    /**
     * Gets stop location
     * @returns {Location}
     */
    get location() {
        return this._location;
    }

    /**
     * Gets stop routes
     * @returns {[string]}
     */
    get routes() {
        return this._routes;
    }

    /**
     * Gets stop name
     * @returns {string}
     */
    get name() {
        return this._name;
    }
}

/**
 * Holds location information.
 */
class Location {
    /**
     * Latitude
     */
    lat;
    /**
     * Longitude
     */
    lng;

    /**
     * Class constructor
     * @param {number} lat latitude
     * @param {number} lng longitude
     */
    constructor(lat, lng) {
        this._lat = lat;
        this._lng = lng;
    }

    /**
     * Gets latitude
     * @returns {number}
     */
    get lat() {
        return this._lat;
    }

    /**
     * Gets longitude
     * @returns {number}
     */
    get lng() {
        return this._lng;
    }
}

/**
 * Holds information of an arrival estimate
 */
class ArrivalEstimate {
    /**
     * ID of route for which this applies.
     */
    routeId;
    /**
     * Time of arrival (ISO string).
     */
    arrivalAt;
    /**
     * ID of stop for which this applies.
     */
    stopId;
    /**
     * ID of vehicle for which this applies.
     */
    vehicleId;

    /**
     * Class constructor
     *
     * @param {string} routeId route id
     * @param {string} arrivalAt arrival time (ISO string)
     * @param {string} stopId stop id
     * @param {string} vehicleId vehicle id
     */
    constructor(routeId, arrivalAt, stopId, vehicleId) {
        this._routeId = routeId;
        this._arrivalAt = arrivalAt;
        this._stopId = stopId;
        this._vehicleId = vehicleId;
    }

    /**
     * Gets route ID
     * @returns {string}
     */
    get routeId() {
        return this._routeId;
    }

    /**
     * Gets arrival time (ISO string)
     * @returns {string}
     */
    get arrivalAt() {
        return this._arrivalAt;
    }

    /**
     * Gets stop ID
     * @returns {string}
     */
    get stopId() {
        return this._stopId;
    }

    /**
     * Gets vehicle ID
     * @returns {string}
     */
    get vehicleId() {
        return this._vehicleId;
    }
}

export {
    Route,
    Segment,
    Vehicle,
    Stop,
    Location,
    ArrivalEstimate,
    TransitManager
}