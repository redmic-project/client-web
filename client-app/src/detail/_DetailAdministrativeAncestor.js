define([
	'dojo/_base/declare'
	, 'src/detail/_DetailAdministrative'
], function(
	declare
	, _DetailAdministrative
) {

	return declare(_DetailAdministrative, {
		//	summary:
		//		Base de vistas de detalle para las entidades proyecto y programa.

		_afterSetConfigurations: function() {

			this.inherited(arguments);

			let additionalConfig = this._getAdditionalDescendantListConfig();

			this.widgetConfigs = this._merge([{
				info: {},
				descendantList: this._getActivitiesOrProjectsConfig(additionalConfig)
			}, this.widgetConfigs || {}]);
		},

		_clearModules: function() {

			this.inherited(arguments);

			this._publish(this._getWidgetInstance('descendantList').getChannel('CLEAR'));
		},

		_refreshModules: function() {

			this.inherited(arguments);

			this._requestDescendantData();
		},

		_showWidgets: function() {

			this.inherited(arguments);

			this._showWidget('descendantList');
		},

		_requestDescendantData: function() {

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this.descendantsTarget,
				action: '_search',
				params: {
					path: {
						id: this.pathVariableId
					},
					query: {
						returnFields: this._descendantFields
					}
				}
			});
		}
	});
});
