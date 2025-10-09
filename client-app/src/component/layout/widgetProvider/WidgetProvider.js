define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_ExternalConfig'
	, 'src/component/base/_Module'
	, 'src/component/layout/widgetProvider/_LayoutWidgetDefinition'
	, 'src/component/layout/widgetProvider/_PrepareLayoutWidget'
], function(
	declare
	, lang
	, _ExternalConfig
	, _Module
	, _LayoutWidgetDefinition
	, _PrepareLayoutWidget
) {

	return declare([_Module, _LayoutWidgetDefinition, _PrepareLayoutWidget, _ExternalConfig], {
		// summary:
		//   Componente que centraliza las definiciones de widgets, para ser provistos bajo demanda.

		postMixInProperties: function() {

			const defaultConfig = {
				ownChannel: 'widgetProvider',
				events: {
					GOT_WIDGET_CONFIG: 'gotWidgetConfig'
				},
				actions: {
					GET_WIDGETS_CONFIG: 'getWidgetsConfig',
					GOT_WIDGET_CONFIG: 'gotWidgetConfig'
				}
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('GOT_EXTERNAL_CONFIG', lang.hitch(this._onGotExternalConfig));
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel('GET_WIDGETS_CONFIG'),
				callback: '_subGetWidgetsConfig'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'GOT_WIDGET_CONFIG',
				channel: this.getChannel('GOT_WIDGET_CONFIG')
			});
		},

		_subGetWidgetsConfig: function(req) {

			const propertyName = req.externalConfigPropName;

			this._currentPropertyName = propertyName;

			this._currentEntityData = req;

			this._emitEvt('GET_EXTERNAL_CONFIG', {propertyName});
		},


		_onGotExternalConfig: function(evt) {

			const configValue = evt[this._currentEntityData.externalConfigPropName];
			delete this._currentEntityData.externalConfigPropName;

			this._processDetailLayouts(this._currentEntityData, configValue);
		},

		_publishLayoutWidget(key, config) {

			this._emitEvt('GOT_WIDGET_CONFIG', {
				widgetConfig: {key, config}
			});
		}
	});
});
