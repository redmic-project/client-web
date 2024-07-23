define([
	"app/base/views/extensions/_AddTextSearchInput"
	, "app/base/views/extensions/_LocalSelectionView"
	, "app/designs/list/layout/ListWithTopContent"
	, "app/designs/list/Controller"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Store"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/browser/_Select"
	, "templates/ServiceOGCAtlasList"
], function(
	_AddTextSearchInput
	, _LocalSelectionView
	, ListWithTopContent
	, Controller
	, redmicConfig
	, declare
	, lang
	, _Store
	, ListImpl
	, _Select
	, AtlasList
) {

	return declare([ListWithTopContent, Controller, _Store, _LocalSelectionView, _AddTextSearchInput], {
		//	summary:
		//		Step para relacionar datos entre si.

		constructor: function (args) {

			this.config = {
				label: this.i18n.selectLayer,
				title: this.i18n.layers,

				target: redmicConfig.services.atlasLayerDiscovery,
				browserTarget: 'wmsLayer',
				browserBase: [ListImpl, _Select],

				idProperty: "name",
				ownChannel: "selectLayerStep"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				target: this.browserTarget,
				template: AtlasList,
				simpleSelection: true
			}, this.browserConfig || {}]);

			this.formConfig = this._merge([{
			}, this.formConfig || {}]);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.browser.getChannel('SELECTED_ROW'),
				callback: '_subBrowserRowSelected'
			},{
				channel: this.browser.getChannel('DESELECTED_ROW'),
				callback: '_subBrowserRowDeselected'
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._showTextSearch(this.parentTopNode);

			if (this._additionalData) {
				this._newAdditionalData(this._additionalData);
			}
		},

		_instanceDataToResult: function(data) {

			if (!data || !data.name) {
				return;
			}
			this._setLayerName(data.name);
		},

		_subBrowserRowSelected: function(res) {

			var layerName = res.idProperty;
			this._setLayerName(layerName);
		},

		_subBrowserRowDeselected: function(res) {

			this._setLayerName(null);
		},

		_setLayerName: function(layerName) {

			this._results = layerName;
			this._isCompleted = !!layerName;

			this._emitEvt('SET_PROPERTY_VALUE', {
				name: layerName
			});
		},

		_onNewSearchResults: function(data) {

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this.browserTarget
			});
		},

		_clearStep: function() {

			this._publish(this.browser.getChannel("CLEAR"));
		}
	});
});
