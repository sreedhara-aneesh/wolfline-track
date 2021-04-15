import {PureComponent} from 'react';
import {Marker} from "react-map-gl";

/**
 * Symbol size (pixels)
 * @type {number}
 */
const SYMBOL_SIZE = 8;

/**
 * Component to represent a bus stop on a TransitMap.
 * Props are as follows.
 * data: [
 *     {
 *         key: string
 *         longitude: number
 *         latitude: number
 *         colors: string[]
 *     },
 *     ...
 * ]
 */
class StopMarkers extends PureComponent {

    /**
     * Renders components
     * @return {[JSX.Element]}
     */
    render() {
        const {data} = this.props;
        console.log("THIS IS DATA");
        console.log(data);
        if (data.length === 0) {
            return (
                <div/>
            );
        }

        return data.map(d => {

            // Create bg for pie-chart like visual
            const colors = d.colors;
            let bgGradient = 'conic-gradient(';
            for (let i = 0; i < colors.length; i++) {
                const el = `#${colors[i]} 0 ${(360 / colors.length) * (i + 1)}deg`;
                bgGradient += `${el}${i === colors.length - 1 ? ')' : ','}`;
            }

            return (
                <Marker
                    key={d.key}
                    longitude={d.longitude}
                    latitude={d.latitude}
                    offsetTop={-1 * SYMBOL_SIZE / 2}
                    offsetLeft={-1 * SYMBOL_SIZE / 2}
                >
                    <div
                        style={{
                            position: 'absolute',
                            width: `${SYMBOL_SIZE}px`,
                            height: `${SYMBOL_SIZE}px`,
                            borderRadius: '50%',
                            background: `${bgGradient}`,
                            borderStyle: 'solid',
                            borderColor: '#000000',
                            borderWidth: '1px'
                        }}
                    />
                </Marker>
            );
        });
    }
}

export default StopMarkers;