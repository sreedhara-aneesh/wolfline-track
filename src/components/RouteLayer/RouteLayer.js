import React, {useState, useEffect} from 'react';
import {CompositeLayer, GeoJsonLayer} from 'deck.gl';
import {PathStyleExtension} from '@deck.gl/extensions';

/**
 * DeckGL layer for route visuals.
 */
class RouteLayer extends CompositeLayer {
    renderLayers() {
        return [
            new GeoJsonLayer({
                id: 'route-layer',
                data: this.props.data,
                getLineColor: this.props.getLineColor,
                getDashArray: this.props.getDashArray,
                getLineWidth: d => 4,
                lineWidthMinPixels: 2,
                extensions: [new PathStyleExtension({
                    dash: true,
                    highPrecisionDash: true
                })],

                updateTriggers: {
                    getLineColor: this.props.updateTriggers.getLineColor,
                    getDashArray: this.props.updateTriggers.getDashArray
                }
            })
        ];
    }
}

RouteLayer.layerName = 'RouteLayer';
RouteLayer.defaultProps = {
    getPosition: {type: 'accessor', value: d => d.position},
    getLineColor: {type: 'accessor', value: d => d.properties.lineColor},
    getDashArray: {type: 'accessor', value: d => d.properties.dashArray}
}

export default RouteLayer;