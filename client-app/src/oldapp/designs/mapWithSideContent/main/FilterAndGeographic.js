define([
	"app/designs/base/_Main"
	, "app/designs/mapWithSideContent/Controller"
	, "app/designs/mapWithSideContent/layout/MapAndContentAndTopbar"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_Select"
	, "redmic/modules/browser/_GeoJsonParser"
	, "redmic/modules/form/input/FilteringSelectImpl"
	, "redmic/modules/map/layer/GeoJsonLayerImpl"
	, "redmic/modules/map/layer/_Selectable"
	, "redmic/modules/map/layer/_SelectOnClick"
], function(
	_Main
	, Controller
	, Layout
	, declare
	, lang
	, _Filter
	, ListImpl
	, _ButtonsInRow
	, _Select
	, _GeoJsonParser
	, FilteringSelectImpl
	, GeoJsonLayerImpl
	, _Selectable
	, _SelectOnClick
) {

	return declare([Layout, Controller, _Main, _Filter], {
		//	summary:.
		//
		//	description:
		//

		//	config: Object
		//		Opciones y asignaciones por defecto.
		//	title: String
		//		Título de la vista.

		constructor: function (args) {

			this.config = {
				events: {
					ADD_LAYER: "addLayer",
					REMOVE_LAYER: "removeLayer",
					UPDATE_TARGET: "updateTarget",
					CLEAR: "clear",
					REFRESH: "refresh",
					CHANGE_BROWSER_NO_DATA_MESSAGE: "changeBrowserNoDataMessage"
				},

				propertyNameFiltering: 'name',
				idPropertyFiltering: 'id',

				actions: {
					REFRESH: "refresh",
					UPDATE_TARGET: "updateTarget",
					CLEAR: "clear"
				},
				classTopbar: "notFormZone marginBottomContainer"
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.browserConfig = this._merge([{
				parentChannel: this.getChannel(),
				simpleSelection: true
			}, this.browserConfig || {}]);

			this.browserTarget = this.browserConfig.target;

			this.browserCopyNoDataMessage = this.browserConfig.noDataMessage;

			this.browserConfig.noDataMessage = this.browserConfig.instructionDataMessage;

			this.filteringConfig = this._merge([{
				parentChannel: this.getChannel(),
				idProperty: this.idProperty,
				propertyName: this.propertyNameFiltering
			}, this.filteringConfig || {}]);

			this.geoJsonLayerConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target,
				onEachFeature: lang.hitch(this, this.onEachFeature)
			}, this.geoJsonLayerConfig || {}]);
		},

		_initializeMain: function() {

			this.browser = new declare([ListImpl, _ButtonsInRow, _Select, _GeoJsonParser])(this.browserConfig);

			this.filteringInput = new FilteringSelectImpl(this.filteringConfig);

			this.geoJsonLayerConfig.associatedIds = [this.browser.getOwnChannel()];
			this.geoJsonLayerConfig.mapChannel = this.map.getChannel();

			var geoJsonLayerDefinition = declare([GeoJsonLayerImpl, _Selectable, _SelectOnClick]);
			this.geoJsonLayer = new geoJsonLayerDefinition(this.geoJsonLayerConfig);
		},

		_defineMainSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.browser.getChannel("BUTTON_EVENT"),
				callback: "_subListBtnEvent"
			},{
				channel : this.getChannel("UPDATE_TARGET"),
				callback: "_subUpdateTarget"
			},{
				channel : this.getChannel("CLEAR"),
				callback: "_subClear"
			},{
				channel : this.getChannel("REFRESH"),
				callback: "_subRefresh"
			},{
				channel : this.filteringInput.getChannel("VALUE_CHANGED"),
				callback: "_subChangedInput"
			});
		},

		_defineMainPublications: function () {

			this.publicationsConfig.push({
				event: 'UPDATE_TARGET',
				channel: this.browser.getChannel("UPDATE_TARGET")
			},{
				event: 'CHANGE_BROWSER_NO_DATA_MESSAGE',
				channel: this.browser.getChannel("UPDATE_NO_DATA_TEMPLATE")
			},{
				event: 'UPDATE_TARGET',
				channel: this.geoJsonLayer.getChannel("UPDATE_TARGET")
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.browser.getChannel("SHOW"), {
				node: this.contentNode
			});

			this._publish(this.filteringInput.getChannel("SHOW"), {
				node: this.topbarNode
			});

			this._emitEvt('ADD_LAYER', {layer: this.geoJsonLayer});

			this.browserConfig.noDataMessage = this.browserCopyNoDataMessage;
		},

		_subUpdateTarget: function(req) {

			this._emitEvt("UPDATE_TARGET", req);
		},

		_subRefresh: function(req) {

			this._emitEvt("REFRESH");
		},

		_subClear: function() {

			this._emitEvt("CLEAR");
		},

		_subListBtnEvent: function(evt) {

			var callback = "_" + evt.btnId + "Callback";
			this[callback] && this[callback](evt);
		},

		_subChangedInput: function(evt) {

			this._emitEvt("CLEAR_SELECTION");

			if (evt.name === this.propertyNameFiltering && evt.value) {

				this._emitEvt("CHANGE_BROWSER_NO_DATA_MESSAGE", {
					template: this.browserConfig.noDataMessage
				});

				this._activityid = evt.value;

				var obj = {
					target: lang.replace(this.browserTarget, {activityid: evt.value})
				};

				this._emitEvt("UPDATE_TARGET", obj);

				this._emitEvt('REFRESH');
			} else {
				this._emitEvt("CHANGE_BROWSER_NO_DATA_MESSAGE", {
					template: this.browserConfig.instructionDataMessage
				});
				this._activityid = null;
				this._publish(this.browser.getChannel("CLEAR"));
				this._publish(this.geoJsonLayer.getChannel("CLEAR"));
			}
		},

		onEachFeature: function(feature, layer) {

			layer.bindPopup(this.templatePopup({
				feature: feature,
				i18n: this.i18n
			}));
		}
	});
});
