import {Collapse, Drawer, Tag, Timeline} from "antd";
import datefmt from "date-format";

/**
 * Drawer to display information when the user selects a component.
 *
 * @param {Object} props props
 * @param {TransitManager} props.manager manager in use
 * @param {[string]} props.routeIds ids of selected routes
 * @param {{
 *     type: ("vehicle"|"route"|"stop")
 *     id: string
 * } | null} props.selection selection to display info for
 * @param {function} props.setSelection function to set selection
 * @returns {JSX.Element} component
 */
const SelectionDrawer = ({manager, routeIds, selection, setSelection}) => {

    /**
     * Generates a Collapse for information of upcoming arrivals for a stop.
     *
     * @param {Object} args arguments
     * @param {TransitManager} args.manager manager
     * @param {string} args.stopId stop id
     * @param {[string]} args.routeIds ids of selected routes
     * @returns {JSX.Element} component
     */
    const generateStopRouteCollapse = ({manager, stopId, routeIds}) => {
        const collapsePanels = routeIds.map(routeId => {
            const route = manager.getRoute(routeId);

            const stop = manager.getStop(stopId);
            if (!stop.routes.includes(routeId)) return null;

            return (
                <Collapse.Panel key={`${stopId}-${routeId}`} header={<span><Tag color={`#${route.color}`}>{route.shortName}</Tag>{route.longName}</span>}>
                    {generateStopRouteCollapsePanelTimeline({
                        manager: manager,
                        stopId: stopId,
                        routeId: routeId
                    })}
                </Collapse.Panel>
            );
        });
        return (
            <Collapse>
                {collapsePanels}
            </Collapse>
        );
    }

    /**
     * Generates a Timeline that should be placed within a Collapse Panel.
     *
     * @param {Object} args arguments
     * @param {TransitManager} args.manager manager
     * @param {string} args.stopId stop id
     * @param {string} args.routeId route id
     * @returns {JSX.Element} component
     */
    const generateStopRouteCollapsePanelTimeline = ({manager, stopId, routeId}) => {
        const allEstimates = manager.arrivalEstimates;
        const estimates = allEstimates.filter(estimate => {
            return estimate.routeId === routeId && estimate.stopId === stopId;
        });
        estimates.sort((a, b) => {
            return (new Date(a.arrivalAt)).getTime() - (new Date(b.arrivalAt)).getTime();
        });
        const timelineItems = estimates.map(estimate => {
            const date = new Date(estimate.arrivalAt);
            const vehicle = manager.getVehicle(estimate.vehicleId);
            return (
                <Timeline.Item key={`${estimate.vehicleId}-${estimate.stopId}-${estimate.arrivalAt}`}>
                    <p><b>Vehicle:</b> {vehicle.callName}</p>
                    <p><b>Arrival:</b> {datefmt('hh:mm', date)}</p>
                </Timeline.Item>
            );
        });
        return (
            <Timeline>
                {timelineItems}
            </Timeline>
        );
    }

    /**
     * Generates a Timeline of a vehicle's ArrivalEstimates
     *
     * @param {Object} props props
     * @param {TransitManager} props.manager manager
     * @param {string} props.vehicleId id of vehicle
     * @returns {JSX.Element} Timeline component
     */
    const generateVehicleTimeline = ({manager, vehicleId}) => {
        const allEstimates = manager.arrivalEstimates;
        const estimates = allEstimates.filter(estimate => {
            return estimate.vehicleId === vehicleId;
        });
        estimates.sort((a, b) => {
            return (new Date(a.arrivalAt)).getTime() - (new Date(b.arrivalAt)).getTime();
        });
        const timelineItems = estimates.map(estimate => {
            const date = new Date(estimate.arrivalAt);
            const stop = manager.getStop(estimate.stopId);
            return (
                <Timeline.Item key={`${estimate.vehicleId}-${estimate.stopId}-${estimate.arrivalAt}`}>
                    <p><b>Stop:</b> {stop.name}</p>
                    <p><b>Arrival:</b> {datefmt('hh:mm', date)}</p>
                </Timeline.Item>
            );
        });
        return (
            <Timeline>
                {timelineItems}
            </Timeline>
        );
    }

    /**
     * Generates a title for the Drawer based off selection.
     *
     * @param {Object} props props
     * @param {TransitManager} props.manager manager
     * @param {{
     *     type: ("vehicle"|"route"|"stop")
     *     id: string
     * } | null} props.selection selection to display info for
     * @returns {string|null} title, or null if no/invalid selection
     */
    const generateTitle = ({manager, selection}) => {
        if (selection?.type === 'vehicle') {
            return `Vehicle: ${manager.getVehicle(selection.id).callName}`;
        }
        if (selection?.type === 'stop') {
            return `Stop: ${manager.getStop(selection.id).name}`;
        }
        return null;
    }

    return (
        <Drawer
            title={generateTitle({
                manager: manager,
                selection: selection
            })}
            placement={"left"}
            closable={true}
            onClose={() => {
                setSelection(null);
            }}
            visible={selection !== null}
        >
            {selection?.type === "stop" ? (
                generateStopRouteCollapse({
                    manager: manager,
                    stopId: selection.id,
                    routeIds: routeIds
                })
            ) : null}
            {selection?.type === "vehicle" ? (
                generateVehicleTimeline({
                    manager: manager,
                    vehicleId: selection.id
                })
            ) : null}
        </Drawer>
    );
}

export default SelectionDrawer;