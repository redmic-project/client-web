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

		_itemAvailable: function(res) {

			this.inherited(arguments);

			var data = res?.data;

			if (!data) {
				return;
			}

			let documents = data.documents;
			documents && this._dataToDocuments(documents);

			let contacts = data.contacts;
			contacts && this._dataToContacts(contacts);

			let platforms = data.platforms;
			platforms && this._dataToPlatforms(platforms);

			let organisations = data.organisations;
			organisations && this._dataToOrganisations(organisations);
		},

		_dataToDocuments: function(dataItems) {

			dataItems.forEach(function(dataItem) {

				this._injectEntityData(dataItem.document, this.documentTarget);
			}, this);
		},

		_dataToContacts: function(dataItems) {

			this._injectEntityData(dataItems, this.contactTarget);
		},

		_dataToPlatforms: function(dataItems) {

			this._injectEntityData(dataItems, this.platformTarget);
		},

		_dataToOrganisations: function(dataItems) {

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
