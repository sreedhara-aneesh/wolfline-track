import axios from "axios";

const getTransitDirections = async ({origin, destination, arrivalTime, departureTime}) => {
    const options = {
        method: 'GET',
        url: `${process.env.CORS_PROXY}/https://maps.googleapis.com/maps/api/directions/json`,
        params: {
            origin: origin,
            destination: destination,
            arrival_time: arrivalTime,
            departure_time: departureTime,
            mode: 'transit',
            alternatives: true,
            units: 'imperial',
            key: process.env.REACT_APP_GOOGLE_KEY
        }
    }
    const data = (await axios.request(options)).data;

    const res = data.routes.map(route => {
        return {
            summary: route.summary,
            legs: route.legs?.map(leg => {
                return {
                    steps: leg.steps?.map(step => {
                        return {
                            htmlInstructions: step.html_instructions,
                            distance: {
                                value: step.distance?.value,
                                text: step.distance?.text
                            },
                            duration: {
                                value: step.duration?.value,
                                text: step.duration?.text
                            },
                            startLocation: {
                                lat: step.start_location?.lat,
                                lng: step.start_location?.lng
                            },
                            endLocation: {
                                lat: step.end_location?.lat,
                                lng: step.end_location?.lng
                            },
                            maneuver: step.maneuver,
                            polyline: step.polyline,
                            transitDetails: {
                                arrivalStop: {
                                    name: step.transit_details?.arrival_stop?.name,
                                    location: {
                                        lat: step.transit_details?.arrival_stop?.location?.lat,
                                        lng: step.transit_details?.arrival_stop?.location?.lng
                                    },
                                },
                                departureStop: {
                                    name: step.transit_details?.departure_stop?.name,
                                    location: {
                                        lat: step.transit_details?.departure_stop?.location?.lat,
                                        lng: step.transit_details?.departure_stop?.location?.lng
                                    }
                                },
                                arrivalTime: {
                                    text: step.transit_details?.arrival_time?.text,
                                    value: step.transit_details?.arrival_time?.value
                                },
                                departureTime: {
                                    text: step.transit_details?.departure_time?.text,
                                    value: step.transit_details?.departure_time?.value
                                },
                                numStops: step.transit_details?.num_stops,
                                line: {
                                    name: step.transit_details?.line?.name,
                                    shortName: step.transit_details?.line?.short_name,
                                    color: step.transit_details?.line?.color,
                                    agency: {
                                        name: step.transit_details?.line?.agencies[0]?.name,
                                        phone: step.transit_details?.line?.agencies[0]?.phone,
                                        url: step.transit_details?.line?.agencies[0]?.url
                                    }
                                }
                            },
                            travelMode: step.travel_mode,
                            // steps: step.steps.map(subStep => {
                            //     return {
                            //
                            //     }
                            // })
                        }
                    }),
                    distance: {
                        value: leg.distance?.value,
                        text: leg.distance?.text
                    },
                    duration: {
                        value: leg.duration?.value,
                        text: leg.duration?.text
                    },
                    arrivalTime: {
                        value: leg.arrival_time?.value,
                        text: leg.arrival_time?.text
                    },
                    departureTime: {
                        value: leg.departure_time?.value,
                        text: leg.departure_time?.text
                    },
                    startLocation: {
                        lat: leg.startLocation?.lat,
                        lng: leg.startLocation?.lng
                    },
                    endLocation: {
                        lat: leg.endLocation?.lat,
                        lng: leg.endLocation?.lng
                    },
                }
            }),
            bounds: route.bounds,
            copyrights: route.copyrights,
            warnings: route.warnings,
            fare: {
                currency: route.fare?.currency,
                value: route.fare?.value,
                text: route.fare?.text
            }
        }
    });

    return res;
}

export {
    getTransitDirections
}