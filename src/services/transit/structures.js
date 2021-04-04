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
     * Class constructor
     *
     * @param {string} routeId route id
     * @param {string} arrivalAt arrival time (ISO string)
     * @param {string} stopId stop id
     */
    constructor(routeId, arrivalAt, stopId) {
        this._routeId = routeId;
        this._arrivalAt = arrivalAt;
        this._stopId = stopId;
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
}

/**
 * Holds data that will be used when rendering segment visuals.
 */
class DissolvedSegment {
    /**
     * Array of segment IDs dissolved into this.
     */
    segments;
    /**
     * GeoJSON LineString data for this.
     */
    data;
    /**
     * Array of route IDs that service this DissolvedSegment
     */
    routes;

    /**
     * Class constructor
     *
     * @param {[string]} segments array of segment ids
     * @param {LineString} data GeoJSON LineString data
     * @param {[string]} routes array of route ids
     */
    constructor(segments, data, routes) {
        this._segments = segments;
        this._data = data;
        this._routes = routes;
    }

    /**
     * Gets segments
     * @return {string[]}
     */
    get segments() {
        return this._segments;
    }

    /**
     * Gets data
     * @return {LineString}
     */
    get data() {
        return this._data;
    }

    /**
     * Gets routes
     * @return {string[]}
     */
    get routes() {
        return this._routes;
    }
}

export {
    Route,
    Segment,
    Vehicle,
    Stop,
    Location,
    ArrivalEstimate,
    DissolvedSegment
}