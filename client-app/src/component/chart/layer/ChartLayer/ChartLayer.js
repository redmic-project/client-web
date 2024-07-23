define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
	, "RWidgets/Utilities"
	, "src/component/base/_Module"
	, "src/component/chart/layer/_LayerCommons"
	, "./_ChartLayerItfc"
], function(
	declare
	, lang
	, aspect
	, put
	, Utilities
	, _Module
	, _LayerCommons
	, _ChartLayerItfc
){
	return declare([_Module, _ChartLayerItfc, _LayerCommons], {
		//	summary:
		//		Módulo para crear una capa de gráfica.
		//	description:
		//		Proporciona los medios para recoger datos y dibujar una
		//		representación de los mismos. Necesita ser añadida a una
		//		instancia de 'ChartsContainer' para ser visualizada.

		constructor: function(args) {

			this.config = {
				events: {
					DATA_ADDED: "dataAdded",
					READY_TO_DRAW: "readyToDraw",
					EMPTY_DATA_ADDED: "emptyDataAdded"
				},
				actions: {
					ADDED_TO_CONTAINER: "addedToContainer",
					ADD_DATA: "addData",
					DATA_ADDED: "dataAdded",
					TRY_TO_DRAW: "tryToDraw",
					READY_TO_DRAW: "readyToDraw",
					INTERVAL_CHANGED: "intervalChanged",
					EMPTY_DATA_ADDED: "emptyDataAdded"
				},

				_dataWasAdded: false,
				_xMin: Number.POSITIVE_INFINITY,
				_xMax: Number.NEGATIVE_INFINITY,
				_yMin: Number.POSITIVE_INFINITY,
				_yMax: Number.NEGATIVE_INFINITY,
				_horizontalScale: null,
				_verticalScale: null,

				_colorsNeeded: 0,
				_entriesCount: 1,

				pathSeparator: ".",
				pathToValue: "",
				hierarchicalInfo: null
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_clear', lang.hitch(this, this._clearChartLayer));
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getChannel("ADDED_TO_CONTAINER"),
				callback: "_subAddedToContainer"
			},{
				channel: this.getChannel("ADD_DATA"),
				callback: "_subAddData",
				options: {
					predicate: lang.hitch(this, this._chkParameterIsMine)
				}
			},{
				channel: this.getChannel("TRY_TO_DRAW"),
				callback: "_subTryToDraw"
			},{
				channel: this.getChannel("INTERVAL_CHANGED"),
				callback: "_subIntervalChanged"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'DATA_ADDED',
				channel: this.getChannel("DATA_ADDED")
			},{
				event: 'READY_TO_DRAW',
				channel: this.getChannel("READY_TO_DRAW")
			},{
				event: 'EMPTY_DATA_ADDED',
				channel: this.getChannel("EMPTY_DATA_ADDED")
			});
		},

		_draw: function() {

			return this._updateChart();
		},

		_addData: function(data) {

			this._data = data;

			this._applyAddedDataToChart(data);

			if (this._isDataAdded()) {
				return this._updateChart();
			}

			this._dataWasAdded = true;
		},

		_clearChartLayer: function() {

			this._dataWasAdded = false;
		},

		_isDataAdded: function() {

			return !!this._dataWasAdded;
		},

		_subAddedToContainer: function(res) {

			if (this._isDataAdded()) {
				this._emitEvt('DATA_ADDED', this._getLayerInfo());
				this._emptyDataAdded && this._emitEvt("EMPTY_DATA_ADDED", this._getLayerInfo());
			}
		},

		_chkParameterIsMine: function(req) {

			var param = req.parameterName;

			if (!this.parameterName || this.parameterName === param) {
				return true;
			}

			console.error("Data belonging to parameter '%s' arrived to chart '%s', whose parameter is '%s'",
				param, this.getChannel(), this.parameterName);
		},

		_subAddData: function(req) {

			this._emptyDataAdded = false;

			var data = req.data,
				cbk = lang.hitch(this, this._afterDataAdded, req),
				dfd = this._addData(data);

			if (dfd && dfd.then && !dfd.isFulfilled()) {
				dfd.then(cbk, cbk);
			} else {
				cbk();
			}
		},

		_afterDataAdded: function(req) {

			this._setLayerInfo(req);
			this._emitEvt('DATA_ADDED', this._getLayerInfo());
		},

		_subTryToDraw: function() {

			if (this._isReadyToDraw()) {
				this._emitEvt('READY_TO_DRAW', this._getLayerInfo());
			} else if (this._isDataAdded()) {
				this._emitEvt('DATA_ADDED', this._getLayerInfo());
			}
		},

		_subIntervalChanged: function(req) {

			this._onIntervalChanged(req);
		},

		_setLayerInfo: function(req) {

			var param = req.parameterName;

			this.parameterName = param;

			this._setLayerAdditionalInfo(req);

			this._emptyDataAdded && this._emitEvt("EMPTY_DATA_ADDED", this._getLayerInfo());
		},

		_getLayerInfo: function(options) {

			var retObj = {
				hierarchicalInfo: this._getHierarchicalInfo(options),
				colorsNeeded: this._colorsNeeded,
				entriesCount: this._entriesCount,
				color: this.color
			};

			lang.mixin(retObj, this._getIdentification(), this._getLayerAdditionalInfo(options));

			return retObj;
		},

		_getHierarchicalInfo: function(options) {

			return this.hierarchicalInfo;
		},

		_setScale: function(req) {

			var hScale = req.horizontalScale,
				vScale = req.verticalScale;

			if (hScale) {
				this._horizontalScale = hScale;
				this._onHorizontalScaleSet(hScale);
			}

			if (vScale) {
				this._verticalScale = vScale;
				this._onVerticalScaleSet(vScale);
			}
		},

		_getValuePath: function(name) {

			if (this.pathToValue.length) {
				return name + this.pathSeparator + this.pathToValue;
			}

			return name;
		},

		_getComponentValue: function(obj, name) {

			return Utilities.getDeepProp(obj, name);
		},

		_setComponentValue: function(obj, name, value) {

			return Utilities.setDeepProp(obj, name, value);
		},

		_getIdentification: function() {

			return {
				chart: this.getOwnChannel(),
				label: this.label,
				parameterName: this.parameterName
			};
		}
	});
});
