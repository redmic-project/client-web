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

			this._descendantListPrepareDetailWidget();
		},

		_descendantListPrepareDetailWidget: function() {

			const additionalConfig = this._merge([this._getAdditionalDescendantListConfig(), {
				target: this.descendantsTarget
			}]);

			const descendantList = this._merge([this._getActivitiesOrProjectsConfig(additionalConfig), {
				width: 3,
				height: 4
			}]);

			this.widgetConfigs = this._merge([this.widgetConfigs || {}, {
				info: {},
				descendantList
			}]);
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
