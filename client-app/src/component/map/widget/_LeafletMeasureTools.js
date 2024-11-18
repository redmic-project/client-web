define([
	'dojo/_base/declare'
	, 'dojo/_base/kernel'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'leaflet'
	, 'put-selector'
], function(
	declare
	, kernel
	, lang
	, aspect
	, L
	, put
) {

	return declare(null, {
		//	summary:
		//		Incluye y configura widget leaflet-measure para Leaflet.

		constructor: function(args) {

			this.config = {
				measureTools: true
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_addMapWidgets', lang.hitch(this, this._addMeasureToolsMapWidgets));
		},

		_addMeasureToolsMapWidgets: function() {

			if (!this.measureTools) {
				return;
			}

			this._addMeasureTools();
		},

		_addMeasureTools: function() {

			var measureToolsPath = 'leaflet-measure/leaflet-measure.' + kernel.locale;

			require([measureToolsPath], lang.hitch(this, this._onMeasureToolsLoaded));

			this.map.on('measurestart', lang.hitch(this, this._onLeafletMeasureStart));
			this.map.on('measurefinish', lang.hitch(this, this._onLeafletMeasureFinish));
		},

		_onMeasureToolsLoaded: function() {

			this._applyAutoJumpIssuePatch();

			var measureTools = new L.Control.Measure({
				position: 'topright',
				primaryLengthUnit: 'meters',
				secondaryLengthUnit: 'kilometers',
				primaryAreaUnit: 'sqmeters',
				secondaryAreaUnit: 'hectares'
			}).addTo(this.map);

			this._reorderMeasureToolsMapButton(measureTools._container);
		},

		_applyAutoJumpIssuePatch: function() {

			// TODO workaround >= v1.8 https://github.com/ljagis/leaflet-measure/issues/171#issuecomment-1137483548
			L.Control.Measure.include({
				// set icon on the capture marker
				_setCaptureMarkerIcon: function () {
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

			var controlsNode = buttonContainerNode.parentNode,
				childControlNodes = Array.from(controlsNode.children),
				desiredPreviousControlNode = childControlNodes.find(function(childNode) {

					return childNode.firstChild.title === 'Layers';
				}) || controlsNode.children[0];

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
