define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/detail/_Detail'
], function(
	declare
	, lang
	, _Detail
) {

	return declare(_Detail, {
		//	summary:
		//		Base de vistas de detalle para las entidades actividad y superiores.

		constructor: function(args) {

			this.config = {
				documentTarget: 'documents',
				contactTarget: 'contacts',
				organisationTarget: 'organisations',
				platformTarget: 'platforms'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.inherited(arguments);

			this.widgetConfigs = this._merge([this.widgetConfigs || {}, {
				organisationList: this._getOrganisationsConfig(),
				platformList: this._getPlatformsConfig(),
				contactList: this._getContactsConfig(),
				documentList: this._getDocumentsConfig()
			}]);
		},

		_clearModules: function() {

			this.inherited(arguments);

			this._publish(this._getWidgetInstance('contactList').getChannel('CLEAR'));
			this._publish(this._getWidgetInstance('documentList').getChannel('CLEAR'));
			this._publish(this._getWidgetInstance('platformList').getChannel('CLEAR'));
			this._publish(this._getWidgetInstance('organisationList').getChannel('CLEAR'));
		},

		_showWidgets: function() {

			this.inherited(arguments);

			this._showWidget('contactList');
			this._showWidget('documentList');
			this._showWidget('platformList');
			this._showWidget('organisationList');
		},

		_itemAvailable: function(res) {

			this.inherited(arguments);

			var data = res?.data;

			if (!data) {
				return;
			}

			this._dataToDocuments(data.documents);
			this._dataToContacts(data.contacts);
			this._dataToPlatforms(data.platforms);
			this._dataToOrganisations(data.organisations);
		},

		_dataToDocuments: function(dataItems) {

			if (!dataItems?.length) {
				this._hideWidget('documentList');
				return;
			}

			this._injectEntityData(dataItems.map((dataItem) => dataItem.document), this.documentTarget);
		},

		_dataToContacts: function(dataItems) {

			if (!dataItems?.length) {
				this._hideWidget('contactList');
				return;
			}

			this._injectEntityData(dataItems, this.contactTarget);
		},

		_dataToPlatforms: function(dataItems) {

			if (!dataItems?.length) {
				this._hideWidget('platformList');
				return;
			}

			this._injectEntityData(dataItems, this.platformTarget);
		},

		_dataToOrganisations: function(dataItems) {

			if (!dataItems?.length) {
				this._hideWidget('organisationList');
				return;
			}

			this._injectEntityData(dataItems, this.organisationTarget);
		},

		_injectEntityData: function(entityData, entityTarget) {

			this._emitEvt('INJECT_DATA', {
				data: entityData,
				target: entityTarget
			});
		}
	});
});
