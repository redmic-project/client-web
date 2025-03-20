define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/detail/_DetailAdministrative'
], function(
	declare
	, lang
	, _DetailAdministrative
) {

	return declare(_DetailAdministrative, {
		//	summary:
		//		Base de vistas de detalle para las entidades proyecto y programa.

		constructor: function(args) {

			this.config = {
				_descendantTargetLocal: 'administrativeDescendants'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

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

			this._prepareDescendantTarget();
			this._refreshDescendantData();
		},

		_showWidgets: function() {

			this.inherited(arguments);

			this._showWidget('descendantList');
		},

		_prepareDescendantTarget: function() {

			this.target[1] = lang.replace(this._descendantTargetBase, {
				id: this.pathVariableId
			});
		},

		_refreshDescendantData: function() {

			let widgetInstance = this._getWidgetInstance('descendantList');

			this._publish(widgetInstance.getChannel('UPDATE_TARGET'), {
				target: this.target[1]
			});

			this._requestDescendantData();
		},

		_requestDescendantData: function() {

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this.target[1],
				action: '_search',
				query: {
					returnFields: this._descendantFields
				}
			});
		},

		_dataAvailable: function(res, resWrapper) {

			if (resWrapper.target !== this.target[1] || !res?.data) {
				return;
			}

			this._dataToDescendantList(res.data);
		},

		_dataToDescendantList: function(data) {

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this._descendantTargetLocal
			});
		}
	});
});
