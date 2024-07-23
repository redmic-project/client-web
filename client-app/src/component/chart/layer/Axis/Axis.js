define([
	'd3/d3.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "src/component/base/_Module"
	, "src/component/chart/layer/_LayerCommons"
	, "./_AxisItfc"
], function(
	d3
	, declare
	, lang
	, Deferred
	, _Module
	, _LayerCommons
	, _AxisItfc
){
	return declare([_Module, _AxisItfc, _LayerCommons], {
		//	summary:
		//		Módulo para generar un eje que gradue a 'ChartsContainer'.

		constructor: function(args) {

			this.config = {
				_scale: null,
				_axis: null,
				innerTickSize: 7,
				tickPadding: 5,
				transitionDuration: 500,
				transitionEase: d3.easeCubic,
				omitMargin: false,
				opacity: 1,
				parameterName: this.i18n.magnitude,

				events: {
					REFRESHED: "refreshed",
					ORIENT_SET: "orientSet",
					DATA_SIZE_SET: "dataSizeSet"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setScale: function(req) {

			var scale = req.scale;

			if (scale) {
				this._scale = this._getScale(scale) || scale;
			}
		},

		_draw: function() {

			if (!this._axis) {
				this._axis = this._createAxis(this._container);
				this._createLabel(this._container);
			} else {
				this._updateAxis(this._axis);
			}

			if (this._scale && this._axis.scale) {
				this._axis.scale(this._scale);
				return this._refresh();
			}
		},

		_refresh: function() {

			var dfd = new Deferred();

			this._container/*.transition()
				.duration(this.transitionDuration)
				.ease(this.transitionEase)*/
				.call(this._axis);
				//.on("end", lang.hitch(this, function(dfd) {
					this._emitEvt("REFRESHED");
					dfd.resolve();
				//}, dfd));

			return dfd;
		},

		_clear: function() {

			this._axis = null;
			this._scale = null;
		},

		_getIdentification: function() {

			return {
				axis: this.getOwnChannel(),
				parameterName: this.parameterName
			};
		},

		_getScale: function(scale) {

			var domain = scale.domain(),
				domainWithMargin = this._getDomainWithMargin(domain);

			domainWithMargin && scale.domain(domainWithMargin);

			return scale;
		},

		_getLayerInfo: function(options) {

			var retObj = {},
				scaleDomain = this._scale ? this._scale.domain() : null,
				min = scaleDomain ? scaleDomain[0] : null,
				max = scaleDomain ? scaleDomain[1] : null;

			lang.mixin(retObj, this._getIdentification(), {
				min: min,
				max: max
			});

			return retObj;
		},

		_show: function(req) {

			return this._changeElementOpacity(this._container, this.opacity, new Deferred());
		},

		_hide: function(req) {

			return this._changeElementOpacity(this._container, 0, new Deferred());
		}
	});
});
