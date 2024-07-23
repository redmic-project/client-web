define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/chart/ChartsContainer/_TemporalAxisDrawing"
	, "src/component/chart/layer/Axis/VerticalGridAxisImpl"
], function(
	declare
	, lang
	, _TemporalAxisDrawing
	, VerticalGridAxisImpl
){
	return declare(_TemporalAxisDrawing, {
		//	summary:
		//		Extensión para dibujar un eje horizontal con rejilla incorporada en la gráfica.

		constructor: function(args) {

			this.config = {
				_verticalGridAxis: null,
				_verticalGridAxisContainer: null
			};

			lang.mixin(this, this.config, args);
		},

		_redrawTemporalAxis: function() {

			this.inherited(arguments);

			this._verticalGridAxis && this._redrawVerticalGridAxis();
		},

		_drawTemporalAxis: function(min, max) {

			this.inherited(arguments);

			this._drawVerticalGridAxis();
		},

		_updateTemporalAxis: function(min, max, force) {

			this.inherited(arguments);

			this._setAxisScale(this._verticalGridAxis, this._temporalAxisScale);
		},

		_drawVerticalGridAxis: function() {

			this._verticalGridAxis = new VerticalGridAxisImpl({
				parentChannel: this.getChannel(),
				rotateLabels: this.rotateLabels
			});

			this._subscribeToAxis(this._verticalGridAxis);
			this._updateAxisSize(this._verticalGridAxis);
			this._createVerticalGridAxisContainer();
			this._redrawVerticalGridAxis();
		},

		_createVerticalGridAxisContainer: function() {

			var container = this.gridAxesArea.append("svg:g")
				.attr("id", "verticalGridAxis");

			this._verticalGridAxisContainer = container;
		},

		_redrawVerticalGridAxis: function() {

			this._setAxisScale(this._verticalGridAxis, this._temporalAxisScale);
			this._translateVerticalGridAxisContainer();
			this._drawAxis(this._verticalGridAxis, this._verticalGridAxisContainer);
		},

		_translateVerticalGridAxisContainer: function() {

			var translate = "translate(0," + this._innerHeight + ")";

			this._verticalGridAxisContainer.attr("transform", translate);
		},

		_clearTemporalAxis: function() {

			this.inherited(arguments);

			if (this._verticalGridAxis) {
				this._clearAxis(this._verticalGridAxis);
				this._unsubscribeFromAxis(this._verticalGridAxis);
				this._verticalGridAxis = null;
			}
		},

		_resizeTemporalAxis: function() {

			this.inherited(arguments);

			if (this._verticalGridAxis) {
				this._updateAxisSize(this._verticalGridAxis);
				this._redrawVerticalGridAxis();
			}
		},

		_showTemporalAxis: function() {

			this.inherited(arguments);

			var axisInstance = this._verticalGridAxis;
			if (axisInstance && !this._hiddenGridAxes[axisInstance.getOwnChannel()]) {
				this._showAxis(axisInstance);
			}
		},

		_hideTemporalAxis: function() {

			this.inherited(arguments);

			this._hideAxis(this._verticalGridAxis);
		},

		_setHorizontalAxisLimits: function(min, max) {

			this.inherited(arguments);

			if (this._verticalGridAxis) {
				this._drawAxis(this._verticalGridAxis);
			}
		},

		_showVerticalGridAxis: function(req) {

			var axisInstance = this._verticalGridAxis;
			delete this._hiddenGridAxes[axisInstance.getOwnChannel()];
			this._showAxis(axisInstance);
		},

		_hideVerticalGridAxis: function(req) {

			var axisInstance = this._verticalGridAxis;
			this._hiddenGridAxes[axisInstance.getOwnChannel()] = true;
			this._hideAxis(axisInstance);
		}

	});
});
