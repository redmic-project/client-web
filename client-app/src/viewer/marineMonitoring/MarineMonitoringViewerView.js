define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'app/designs/mapWithSideContent/main/Geographic'
	, 'src/component/base/_ExternalConfig'
	, 'src/redmicConfig'
	, 'src/viewer/marineMonitoring/_ManageOgcServices'
], function(
	declare
	, lang
	, Geographic
	, _ExternalConfig
	, redmicConfig
	, _ManageOgcServices
) {

	return declare([Geographic, _ManageOgcServices, _ExternalConfig], {
		//	summary:
		//		Vista de visor de monitorización marina. Proporciona un mapa principal y una serie de capas temáticas,
		//		junto con el componente Atlas para cruzar datos.

		constructor: function(args) {

			this.config = {
				title: this.i18n.marineMonitoringViewerView,
				ownChannel: 'marineMonitoringViewer',
				target: redmicConfig.services.atlasLayer,
				_activityLayersTarget: 'activityLayersTarget',
				notTextSearch: true,
				externalConfigPropName: 'marineMonitoringViewerActivities'
			};

			lang.mixin(this, this.config, args);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('GOT_EXTERNAL_CONFIG', lang.hitch(this._onGotExternalConfig));
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				title: this.i18n.marineMonitoringLayers,
				target: this._activityLayersTarget
			}, this.browserConfig || {}], {
				arrayMergingStrategy: 'concatenate'
			});

			this.atlasConfig = this._merge([{
				parentChannel: this.getChannel(),
				terms: this.terms
			}, this.atlasConfig || {}]);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('GET_EXTERNAL_CONFIG', {
				propertyName: this.externalConfigPropName
			});
		},

		_onGotExternalConfig: function(evt) {

			var configValue = evt[this.externalConfigPropName];

			this._emitEvt('REQUEST', {
				target: this.target,
				action: '_search',
				method: 'POST',
				query: {
					terms: {
						activities: configValue
					}
				},
				requesterId: this.getChannel()
			});
		},

		_dataAvailable: function(res, resWrapper) {

			var reqTerms = resWrapper.req.query.terms;
			if (!reqTerms || !reqTerms.activities) {
				return;
			}

			this._onActivityLayersData(res);
		}
	});
});
