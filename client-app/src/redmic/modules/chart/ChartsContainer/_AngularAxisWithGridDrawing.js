define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/chart/ChartsContainer/_AngularAxisDrawing"
	, "redmic/modules/chart/layer/Axis/RadialGridAxisImpl"
], function(
	declare
	, lang
	, _AngularAxisDrawing
	, RadialGridAxisImpl
) {
	return declare(_AngularAxisDrawing, {
		//	summary:
		//		Extensión para dibujar un eje angular con rejilla incorporada en la gráfica.

		constructor: function(args) {

			this.config = {
				_radialGridAxis: null,
				_radialGridAxisContainer: null
			};

			lang.mixin(this, this.config, args);
		},

		_drawAngularAxis: function(min, max) {

			this.inherited(arguments);

			this._drawRadialGridAxis();
		},

		_redrawAngularAxis: function() {

			this.inherited(arguments);

			this._radialGridAxis && this._redrawRadialGridAxis();
		},

		_drawRadialGridAxis: function() {

			this._radialGridAxis = new RadialGridAxisImpl({
				parentChannel: this.getChannel()
			});

			this._subscribeToAxis(this._radialGridAxis);
			this._updateAxisSize(this._radialGridAxis);
			this._createRadialGridAxisContainer();
			this._redrawRadialGridAxis();
		},

		_createRadialGridAxisContainer: function() {

			var container = this.gridAxesArea.append("svg:g")
				.attr("id", "radialGridAxis");

			this._radialGridAxisContainer = container;
		},

		_redrawRadialGridAxis: function() {

			this._translateRadialGridAxisContainer();
			this._drawAxis(this._radialGridAxis, this._radialGridAxisContainer);
		},

		_translateRadialGridAxisContainer: function() {

			this._radialGridAxisContainer.attr("transform", this._getAngularAxisContainerTranslate());
		},

		_clearAngularAxis: function() {

			this.inherited(arguments);

			if (this._radialGridAxis) {
				this._clearAxis(this._radialGridAxis);
				this._unsubscribeFromAxis(this._radialGridAxis);
				this._radialGridAxis = null;
			}
		},

		_resizeAngularAxis: function() {

			this.inherited(arguments);

			if (this._radialGridAxis) {
				this._updateAxisSize(this._radialGridAxis);
				this._redrawRadialGridAxis();
			}
		},

		_showAngularAxis: function() {

			this.inherited(arguments);

			var axisInstance = this._radialGridAxis;
			if (axisInstance && !this._hiddenGridAxes[axisInstance.getOwnChannel()]) {
				this._showAxis(axisInstance);
			}
		},

		_hideAngularAxis: function() {

			this.inherited(arguments);

			this._hideAxis(this._radialGridAxis);
		},

		_showVerticalGridAxis: function(req) {

			var axisInstance = this._radialGridAxis;
			delete this._hiddenGridAxes[axisInstance.getOwnChannel()];
			this._showAxis(axisInstance);
		},

		_hideVerticalGridAxis: function(req) {

			var axisInstance = this._radialGridAxis;
			this._hiddenGridAxes[axisInstance.getOwnChannel()] = true;
			this._hideAxis(axisInstance);
		},

		_onLayerUpdatedAngularAxisDrawing: function(evt) {

			this.inherited(arguments);

			var dataSize = evt.dataSize;

			this._publish(this._radialGridAxis.getChannel('SET_PROPS'), {
				dataSize: dataSize
			});
		}

	});
});
