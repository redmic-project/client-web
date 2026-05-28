define([
	'dojo/_base/declare'
	, 'dojo/_base/kernel'
	, 'leaflet'
	, 'put-selector'
], function(
	declare
	, kernel
	, L
	, put
) {

	return declare(null, {
		// summary:
		//   Incluye y configura widget leaflet-measure para Leaflet.

		postMixInProperties: function() {

			const defaultConfig = {
				measureTools: true,
				measureToolsConfig: {
					position: 'topright',
					primaryLengthUnit: 'meters',
					secondaryLengthUnit: 'kilometers',
					primaryAreaUnit: 'sqmeters',
					secondaryAreaUnit: 'hectares'
				}
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_addMapWidgets: function() {

			this.inherited(arguments);

			if (!this.measureTools) {
				return;
			}

			this._addMeasureTools();
		},

		_addMeasureTools: function() {

			const measureToolsPath = `leaflet-measure/leaflet-measure.${kernel.locale}`;

			require([measureToolsPath], () => this._onMeasureToolsLoaded());

			this.map.on('measurestart', evt => this._onLeafletMeasureStart(evt));
			this.map.on('measurefinish', evt => this._onLeafletMeasureFinish(evt));
		},

		_onMeasureToolsLoaded: function() {

			this._applyAutoJumpIssuePatch();

			const measureTools = new L.Control.Measure(this.measureToolsConfig).addTo(this.map);

			this._reorderMeasureToolsMapButton(measureTools._container);
		},

		_applyAutoJumpIssuePatch: function() {

			// TODO workaround >= v1.8 https://github.com/ljagis/leaflet-measure/issues/171#issuecomment-1137483548
			L.Control.Measure.include({
				// set icon on the capture marker
				_setCaptureMarkerIcon: function() {
					// disable autopan
					this._captureMarker.options.autoPanOnFocus = false;

					// default function
					this._captureMarker.setIcon(
						L.divIcon({
							iconSize: this._map.getSize().multiplyBy(2)
						})
					);
				},
			});
		},

		_reorderMeasureToolsMapButton: function(buttonContainerNode) {

			const controlsNode = buttonContainerNode.parentNode,
				childControlNodes = Array.from(controlsNode.children);

			const desiredPreviousControlNode = childControlNodes.find(
				childNode => childNode.firstChild.title === 'Layers'
			) || controlsNode.children[0];

			if (desiredPreviousControlNode) {
				put(desiredPreviousControlNode, '+', buttonContainerNode);
			}
		},

		_onLeafletMeasureStart: function(evt) {

		},

		_onLeafletMeasureFinish: function(evt) {

		}
	});
});
