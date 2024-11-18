define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/chart/layer/Axis/AngularAxisImpl"
	, "./_AxesDrawing"
], function(
	declare
	, lang
	, AngularAxisImpl
	, _AxesDrawing
) {
	return declare(_AxesDrawing, {
		//	summary:
		//		Extensión para dibujar un eje angular en la gráfica.

		constructor: function(args) {

			this.config = {
				_angularAxis: null,
				_angularAxisContainer: null
			};

			lang.mixin(this, this.config, args);
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('LAYER_UPDATED', lang.hitch(this, this._onLayerUpdatedAngularAxisDrawing));
		},

		_drawAxes: function(res) {

			this.inherited(arguments);

			if (!this._angularAxis) {
				this._drawAngularAxis();
			} else {
				this._updateAngularAxis();
			}
		},

		_clearAxes: function() {

			this.inherited(arguments);

			this._clearAngularAxis();
		},

		_clearAngularAxis: function() {

			if (this._angularAxis) {
				this._clearAxis(this._angularAxis);
				this._unsubscribeFromAxis(this._angularAxis);
				this._angularAxis = null;
			}
		},

		_drawAngularAxis: function(min, max) {

			this._angularAxis = new AngularAxisImpl({
				parentChannel: this.getChannel(),
				marginForLabels: this.marginForLabels
			});

			this._subscribeToAxis(this._angularAxis);
			this._updateAxisSize(this._angularAxis);
			this._createAngularAxisContainer();
			this._redrawAngularAxis();
		},

		_updateAngularAxis: function(min, max, force) {

			this._redrawAngularAxis();
		},

		_createAngularAxisContainer: function() {

			var container = this.axesArea.append("svg:g")
				.attr("id", "angularAxis");

			this._angularAxisContainer = container;
		},

		_redrawAngularAxis: function() {

			this._translateAngularAxisContainer();
			this._drawAxis(this._angularAxis, this._angularAxisContainer);
		},

		_translateAngularAxisContainer: function() {

			this._angularAxisContainer.attr("transform", this._getAngularAxisContainerTranslate());
		},

		_getAngularAxisContainerTranslate: function() {

			return "translate(" + this._innerWidth / 2 + "," + this._innerHeight / 2 + ")";
		},

		_resizeAxes: function() {

			this.inherited(arguments);

			this._resizeAngularAxis();
		},

		_resizeAngularAxis: function() {

			if (this._angularAxis) {
				this._updateAxisSize(this._angularAxis);
				this._redrawAngularAxis();
			}
		},

		_showOrHideAngularAxis: function() {

			var anyRemainingShownChart = this._getAnyRemainingShownChart();

			if (!anyRemainingShownChart) {
				this._hideAngularAxis();
			} else {
				this._showAngularAxis();
			}
		},

		_showAngularAxis: function() {

			this._showAxis(this._angularAxis);
		},

		_hideAngularAxis: function() {

			this._hideAxis(this._angularAxis);
		},

		_hideAxisBecauseItIsNotUsed: function(param) {

			this.inherited(arguments);

			this._showOrHideAngularAxis();
		},

		_adjustAxesAfterLayerCleared: function(res) {

			this.inherited(arguments);

			this._showOrHideAngularAxis();
		},

		_showAxisIfNotShown: function(res) {

			this.inherited(arguments);

			this._showAngularAxis();
		},

		_onLayerUpdatedAngularAxisDrawing: function(evt) {

			var dataSize = evt.dataSize;

			this._publish(this._angularAxis.getChannel('SET_PROPS'), {
				dataSize: dataSize
			});
		}
	});
});
