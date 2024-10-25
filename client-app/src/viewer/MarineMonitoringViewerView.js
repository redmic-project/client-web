define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'app/designs/mapWithSideContent/main/Geographic'
	, 'src/redmicConfig'
	, 'src/viewer/_ManageOgcServices'
], function(
	declare
	, lang
	, Geographic
	, redmicConfig
	, _ManageOgcServices
) {

	return declare([Geographic, _ManageOgcServices], {
		//	summary:
		//		Vista de visor de monitorización marina. Proporciona un mapa principal y una serie de capas temáticas,
		//		junto con el componente Atlas para cruzar datos.

		constructor: function(args) {

			this.config = {
				title: this.i18n.marineMonitoringViewerView,
				ownChannel: 'marineMonitoringViewer',
				target: redmicConfig.services.atlasLayer,
				notTextSearch: true
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.atlasConfig = this._merge([{
				parentChannel: this.getChannel(),
				terms: this.terms
			}, this.atlasConfig || {}]);

			this.queryOnMapConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.queryOnMapConfig || {}]);
		},

		_initialize: function() {

		},

		postCreate: function() {

			this.inherited(arguments);
		},

		_onControllerMeOrAncestorShown: function(res) {

			this.inherited(arguments);

			this._emitEvt('CLEAR');
			this._emitEvt('REFRESH');
		},

		_onControllerMeOrAncestorHidden: function(res) {

			this.inherited(arguments);

			this._emitEvt('CLEAR');
		}
	});
});
