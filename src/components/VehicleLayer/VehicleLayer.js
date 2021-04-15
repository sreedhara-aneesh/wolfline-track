import React, {useState, useEffect} from 'react';
import {CompositeLayer, IconLayer, TextLayer} from 'deck.gl';

/**
 * DeckGL layer for vehicle visuals.
 */
class VehicleLayer extends CompositeLayer {
    renderLayers() {
        return [
            new IconLayer(this.getSubLayerProps({
                id: 'vehicle-layer-ol',
                data: this.props.data,

                getPosition: this.props.getPosition,
                getIcon: d => ({
                    url: 'https://cdnjs.cloudflare.com/ajax/libs/open-iconic/1.1.1/png/media-record-8x.png',
                    x: 0,
                    y: 0,
                    width: 64,
                    height: 64,
                    mask: true
                }),
                getSize: 35,
                getColor: [0, 0, 0],
                transitions: {
                    getPosition: 3000,
                    getAngle: 3000
                },

                updateTriggers: {
                    getPosition: this.props.updateTriggers.getPosition
                }
            })),
            new IconLayer(this.getSubLayerProps({
                id: 'vehicle-layer-bg',
                data: this.props.data,

                getPosition: this.props.getPosition,
                getIcon: d => ({
                    url: 'https://cdnjs.cloudflare.com/ajax/libs/open-iconic/1.1.1/png/media-record-8x.png',
                    x: 0,
                    y: 0,
                    width: 64,
                    height: 64,
                    mask: true
                }),
                getSize: 30,
                getColor: [255, 255, 255],
                transitions: {
                    getPosition: 3000,
                    getAngle: 3000
                },

                updateTriggers: {
                    getPosition: this.props.updateTriggers.getPosition
                }
            })),
            new IconLayer(this.getSubLayerProps({
                id: 'vehicle-layer-face',
                data: this.props.data,

                getAngle: this.props.getAngle,
                getPosition: this.props.getPosition,
                getIcon: d => ({
                    url: 'https://cdnjs.cloudflare.com/ajax/libs/open-iconic/1.1.1/png/arrow-circle-right-8x.png',
                    x: 0,
                    y: 0,
                    width: 64,
                    height: 64,
                    mask: true
                }),
                getSize: 20,
                getColor: this.props.getColor,
                transitions: {
                    getPosition: 3000,
                    getAngle: 3000
                },

                updateTriggers: {
                    getPosition: this.props.updateTriggers.getPosition
                }
            })),
        ];
    }
}

VehicleLayer.layerName = 'VehicleLayer';
VehicleLayer.defaultProps = {
    getPosition: {type: 'accessor', value: d => d.position},
    getColor: {type: 'accessor', value: d => d.color},
    getAngle: {type: 'accessor', value: d => d.angle}
}

export default VehicleLayer;