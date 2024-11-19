define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/chart/layer/_PolarLayerCommons"
	, "./Axis"
], function(
	declare
	, lang
	, _PolarLayerCommons
	, Axis
){
	return declare([Axis, _PolarLayerCommons], {
		//	summary:
		//		Implementación de eje angular.

		constructor: function(args) {

			this.config = {
				ownChannel: "angularAxis",
				className: "axis angularAxis",
				marginForLabels: 30,
				opacity: 0.6,
				parameterName: this.i18n.direction,

				_labelPathId: "labelPath",
				_labelRadiusFix: 5
			};

			lang.mixin(this, this.config, args);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('DATA_SIZE_SET', lang.hitch(this, this._onDataSizeSet));
		},

		_createAxis: function(container) {

			var axis = container.append("svg:circle");

			this._updateAngularAxisRadius();

			container.attr("class", this.className);

			return axis;
		},

		_createLabel: function(container) {

			this._labelContainer = container.append("svg:g");
			var defs = this._labelContainer.append("svg:defs");

			this._currentLabelPathId = this._labelPathId + '-' + this.getOwnChannel();

			this._currentLabelPath = defs.append("svg:path")
				.attr("id", this._currentLabelPathId);

			this._repositionAngularLabels(this._getAngularAxisRadius());
		},

		_repositionAngularLabels: function(radius) {

			if (!this._currentLabelPath) {
				return;
			}

			var labelRadius = radius + this._labelRadiusFix,
				pathData = "m0 " + -labelRadius + " a" + labelRadius + " " + labelRadius + " 0 1,1 -0.01 0";

			this._currentLabelPath.attr("d", pathData);
		},

		_createTextLabels: function(dataSize) {

			var labels = this._getLabelsText(dataSize),

				texts = this._labelContainer.selectAll("text")
					.data(labels).enter()
						.append("svg:text"),

				textPaths = texts.append("svg:textPath")
					.attr("xlink:href", '#' + this._currentLabelPathId)
					.attr("startOffset", lang.hitch(this, this._getStartOffset, dataSize))
					.text(function(d) { return d; });
		},

		_getStartOffset: function(size, d, i) {

			return (i * 100) / size + '%';
		},

		_setSize: function(req) {

			this._updateAngularAxisRadius();
		},

		_updateAngularAxisRadius: function() {

			if (this._axis) {
				var oldRadius = this._axis.attr('r'),
					radius = this._getAngularAxisRadius();

				if (oldRadius !== radius) {
					this._axis.attr('r', radius);
					this._repositionAngularLabels(radius);
				}
			}
		},

		_getAngularAxisRadius: function() {

			return (Math.min(this._width, this._height) - this.marginForLabels) / 2;
		},

		_onDataSizeSet: function(changeObj) {

			var oldValue = changeObj.oldValue,
				value = changeObj.value;

			if (oldValue !== value) {
				oldValue && this._clearTextLabels();
				this._createTextLabels(value);
				this._updateAngularAxisRadius();
			}
		},

		_clearTextLabels: function() {

			this._labelContainer.selectAll("text").remove();
		}
	});
});
