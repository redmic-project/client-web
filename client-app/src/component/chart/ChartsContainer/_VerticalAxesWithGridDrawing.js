define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/chart/ChartsContainer/_VerticalAxesDrawing"
	, "src/component/chart/layer/Axis/HorizontalGridAxisImpl"
], function(
	declare
	, lang
	, _VerticalAxesDrawing
	, HorizontalGridAxisImpl
){
	return declare(_VerticalAxesDrawing, {
		//	summary:
		//		Extensión para dibujar ejes verticales con rejilla incorporada en la gráfica.

		constructor: function(args) {

			this.config = {
				_horizontalGridAxes: {},
				_horizontalGridAxisContainers: {}
			};

			lang.mixin(this, this.config, args);
		},

		_redrawVerticalAxis: function(param) {

			this.inherited(arguments);

			this._horizontalGridAxes[param] && this._redrawHorizontalGridAxis(param);
		},

		_drawVerticalAxis: function(min, max, param) {

			this.inherited(arguments);

			this._drawHorizontalGridAxis(param);
		},

		_updateVerticalAxis: function(min, max, param, force) {

			this.inherited(arguments);

			this._setAxisScale(this._horizontalGridAxes[param], this._verticalAxesScales[param]);
		},

		_drawHorizontalGridAxis: function(param) {

			this._horizontalGridAxes[param] = new HorizontalGridAxisImpl({
				parentChannel: this.getChannel(),
				parameterName: param
			});

			this._subscribeToAxis(this._horizontalGridAxes[param]);
			this._updateAxisSize(this._horizontalGridAxes[param]);
			this._createHorizontalGridAxisContainer(param);
			this._redrawHorizontalGridAxis(param);
		},

		_createHorizontalGridAxisContainer: function(param) {

			var container = this.gridAxesArea.append("svg:g")
				.attr("id", "horizontalGridAxis_" + param);

			this._horizontalGridAxisContainers[param] = container;
		},

		_redrawHorizontalGridAxis: function(param) {

			var verticalAxis = this._horizontalGridAxes[param],
				container = this._horizontalGridAxisContainers[param];

			this._setAxisScale(verticalAxis, this._verticalAxesScales[param]);
			this._drawAxis(verticalAxis, container);
		},

		_clearVerticalAxis: function(param) {

			this.inherited(arguments);

			var axisInstance = this._horizontalGridAxes[param];
			if (axisInstance) {
				this._clearAxis(axisInstance);
				this._unsubscribeFromAxis(axisInstance);
				delete this._horizontalGridAxes[param];
			}
		},

		_resizeVerticalAxis: function(param) {

			this.inherited(arguments);

			var axisInstance = this._horizontalGridAxes[param];
			if (axisInstance) {
				this._updateAxisSize(axisInstance);
				this._redrawHorizontalGridAxis(param);
			}
		},

		_showVerticalAxis: function(param) {

			this.inherited(arguments);

			var axisInstance = this._horizontalGridAxes[param];
			if (axisInstance && !this._hiddenGridAxes[axisInstance.getOwnChannel()]) {
				this._showAxis(axisInstance);
			}
		},

		_hideVerticalAxis: function(param) {

			this.inherited(arguments);

			var axisInstance = this._horizontalGridAxes[param];
			this._hideAxis(axisInstance);
		},

		_setVerticalAxisLimits: function(min, max, param) {

			this.inherited(arguments);

			if (this._horizontalGridAxes[param]) {
				this._drawAxis(this._horizontalGridAxes[param]);
			}
		},

		_showHorizontalGridAxis: function(req) {

			var param = req.param,
				axisInstance = this._horizontalGridAxes[param];

			delete this._hiddenGridAxes[axisInstance.getOwnChannel()];
			this._showAxis(axisInstance);
		},

		_hideHorizontalGridAxis: function(req) {

			var param = req.param,
				axisInstance = this._horizontalGridAxes[param];

			this._hiddenGridAxes[axisInstance.getOwnChannel()] = true;
			this._hideAxis(axisInstance);
		}

	});
});
