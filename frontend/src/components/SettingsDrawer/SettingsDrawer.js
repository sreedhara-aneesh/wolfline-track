import {Drawer, Switch, Tag, Typography} from "antd";
import React from "react";

/**
 * Settings drawer component.
 *
 * @param {Object} props props
 * @param {TransitManager} props.manager manager to be used
 * @param {[string]} props.routeIds selected route ids
 * @param {function} props.setRouteIds function to change routeIds
 * @param {boolean} props.settingsOpen true if settings is open
 * @param {function} props.setSettingsOpen function to change if settings is open
 *
 * @returns {JSX.Element} component
 */
const SettingsDrawer = ({manager, routeIds, setRouteIds, settingsOpen, setSettingsOpen}) => {

    /**
     * Generates a list of route availability information and display toggles.
     *
     * @param {Object} args arguments
     * @param {TransitManager} args.manager manager to be used
     * @param {[string]} args.routeIds selected route ids
     * @param {function} args.setRouteIds function to change selected route ids
     *
     * @returns {{
     *     active: [JSX.Element]
     *     inactive: [JSX.Element]
     * }} active and inactive route elements with information and toggles
     */
    const routeVisibility = ({manager, routeIds, setRouteIds}) => {

        const style = {
            wrapper: {
                display: "flex",
                justifyContent: "space-between"
            }
        }

        const makeRouteComponent = (routeId) => {
            const route = manager.getRoute(routeId);
            return (
                <div key={routeId} style={style.wrapper}>
                    <p><Tag color={`#${route.color}`}>{route.shortName}</Tag></p>
                    <p>{route.longName}</p>
                    <Switch
                        onChange={(checked) => handleSwitch({
                            checked: checked,
                            routeId: route.routeId,
                            routeIds: routeIds,
                            setRouteIds: setRouteIds
                        })}
                        checked={routeIds.includes(route.routeId)}
                    />
                </div>
            );
        }

        const activeComponents = manager.getRouteIds().sort((a,b) => manager.getRoute(a).shortName.localeCompare(manager.getRoute(b).shortName)).filter(routeId => manager.getRoute(routeId).isActive).map(routeId => makeRouteComponent(routeId));
        const inactiveComponents = manager.getRouteIds().sort((a,b) => manager.getRoute(a).shortName.localeCompare(manager.getRoute(b).shortName)).filter(routeId => !manager.getRoute(routeId).isActive).map(routeId => makeRouteComponent(routeId));

        return {
            active: activeComponents,
            inactive: inactiveComponents
        };
    }

    /**
     * Handler for a toggle is switched.
     *
     * @param {Object} args arguments
     * @param {boolean} args.checked whether toggle is now checked or not
     * @param {string} args.routeId route id that the toggle is for
     * @param {[string]} args.routeIds list of selected route ids prior to this
     * @param {function} args.setRouteIds function to set new route ids
     */
    const handleSwitch = ({checked, routeId, routeIds, setRouteIds}) => {
        if (checked) {
            const newRouteIds = [...routeIds];
            newRouteIds.push(routeId);
            setRouteIds(newRouteIds);
        } else {
            const newRouteIds = [];
            for (const exRouteId of routeIds) {
                if (exRouteId === routeId) continue;
                newRouteIds.push(exRouteId);
            }
            setRouteIds(newRouteIds);
        }
    }

    return (
        <React.Fragment>
            <Drawer
                title={"Route Visibility"}
                placement={"left"}
                closable={true}
                onClose={() => {setSettingsOpen(false)}}
                visible={settingsOpen}
                width={300}
            >
                {/* TODO: refactor to not call routeVisibility twice */}
                <Typography.Title level={5}>Active Routes</Typography.Title>
                {routeVisibility({
                    manager: manager,
                    routeIds: routeIds,
                    setRouteIds: setRouteIds
                }).active}
                <Typography.Title level={5}>Inactive Routes</Typography.Title>
                {routeVisibility({
                    manager: manager,
                    routeIds: routeIds,
                    setRouteIds: setRouteIds
                }).inactive}
            </Drawer>
        </React.Fragment>
    );
}

export default SettingsDrawer;