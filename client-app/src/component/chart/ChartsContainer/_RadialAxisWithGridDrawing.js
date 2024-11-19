define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/chart/ChartsContainer/_RadialAxisDrawing"
	, "src/component/chart/layer/Axis/AngularGridAxisImpl"
], function(
	declare
	, lang
	, _RadialAxisDrawing
	, AngularGridAxisImpl
){
	return declare(_RadialAxisDrawing, {
		//	summary:
		//		Extensión para dibujar un eje radial con rejilla incorporada en la gráfica.

		constructor: function(args) {

			this.config = {
				_angularGridAxis: null,
				_angularGridAxisContainer: null
			};

			lang.mixin(this, this.config, args);
		},

		_drawRadialAxis: function(min, max) {

			this.inherited(arguments);

			this._drawAngularGridAxis();
		},

		_redrawRadialAxis: function() {

			this.inherited(arguments);

			this._angularGridAxis && this._redrawAngularGridAxis();
		},

		_updateRadialAxis: function(min, max, force) {

			this.inherited(arguments);

			this._setAxisScale(this._angularGridAxis, this._radialAxisScale);
		},

		_drawAngularGridAxis: function() {

			this._angularGridAxis = new AngularGridAxisImpl({
				parentChannel: this.getChannel()
			});

			this._subscribeToAxis(this._angularGridAxis);
			this._updateAxisSize(this._angularGridAxis);
			this._createAngularGridAxisContainer();
			this._redrawAngularGridAxis();
		},

		_createAngularGridAxisContainer: function() {

			var container = this.gridAxesArea.append("svg:g")
				.attr("id", "angularGridAxis");

			this._angularGridAxisContainer = container;
		},

		_redrawAngularGridAxis: function() {

			var axisInstance = this._angularGridAxis,
				container = this._angularGridAxisContainer;

			this._translateAngularGridAxisContainer();
			this._setAxisScale(axisInstance, this._radialAxisScale);
			this._drawAxis(axisInstance, container);
		},

		_translateAngularGridAxisContainer: function() {

			this._angularGridAxisContainer.attr("transform", this._getRadialAxisContainerTranslate());
		},

		_clearRadialAxis: function() {

			this.inherited(arguments);

			var axisInstance = this._angularGridAxis;
			if (axisInstance) {
				this._clearAxis(axisInstance);
				this._unsubscribeFromAxis(axisInstance);
				delete this._angularGridAxis;
			}
		},

		_resizeRadialAxis: function() {

			this.inherited(arguments);

			var axisInstance = this._angularGridAxis;
			if (axisInstance) {
				this._updateAxisSize(axisInstance);
				this._redrawAngularGridAxis();
			}
		},

		_showRadialAxis: function() {

			this.inherited(arguments);

			var axisInstance = this._angularGridAxis;
			if (axisInstance && !this._hiddenGridAxes[axisInstance.getOwnChannel()]) {
				this._showAxis(axisInstance);
			}
		},

		_hideRadialAxis: function() {

			this.inherited(arguments);

			var axisInstance = this._angularGridAxis;
			this._hideAxis(axisInstance);
		},

		_setRadialAxisLimits: function(min, max) {

			this.inherited(arguments);

			if (this._angularGridAxis) {
				this._drawAxis(this._angularGridAxis);
			}
		},

		_showHorizontalGridAxis: function(req) {

			var axisInstance = this._angularGridAxis;

			delete this._hiddenGridAxes[axisInstance.getOwnChannel()];
			this._showAxis(axisInstance);
		},

		_hideHorizontalGridAxis: function(req) {

			var axisInstance = this._angularGridAxis;

			this._hiddenGridAxes[axisInstance.getOwnChannel()] = true;
			this._hideAxis(axisInstance);
		}

	});
});
