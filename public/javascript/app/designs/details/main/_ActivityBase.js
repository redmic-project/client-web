define([
	"app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddTitle"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/browser/bars/Pagination"
	, "redmic/modules/browser/bars/Total"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "templates/ContactSet"
	, "templates/DocumentList"
	, "templates/OrganisationSet"
	, "templates/PlatformSet"
], function(
	_Main
	, Controller
	, Layout
	, _AddTitle
	, redmicConfig
	, declare
	, lang
	, _Filter
	, _ButtonsInRow
	, _Framework
	, ListImpl
	, Pagination
	, Total
	, TemplateDisplayer
	, TemplateContacts
	, TemplateDocuments
	, TemplateOrganisation
	, TemplatePlatform
){
	return declare([Layout, Controller, _Main, _AddTitle], {
		//	summary:
		//		Base de vistas detalle de la rama de actividades.

		constructor: function(args) {

			this.config = {
				_titleRightButtonsList: [{
					icon: "fa-print",
					btnId: "report",
					title: this.i18n.printToPdf
				}],

				documentTarget: "documents",
				contactTarget: "contacts",
				organisationTarget: "organisations",
				platformTarget: "platforms"
			};

			lang.mixin(this, this.config, args);
		},

		_organisationsConfig: function() {

			return {
				width: 3,
				height: 2,
				type: declare([ListImpl, _Framework, _ButtonsInRow]),
				props: {
					title: this.i18n.organisations,
					target: this.organisationTarget,
					template: TemplateOrganisation,
					bars: [{
						instance: Total
					}],
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: "fa-info-circle",
								btnId: "details",
								title: this.i18n.info,
								href: this.viewPathsWidgets.organisations,
								pathToItem: "organisation"
							}]
						}
					}
				}
			};
		},

		_platformsConfig: function() {

			return {
				width: 3,
				height: 2,
				type: declare([ListImpl, _Framework, _ButtonsInRow]),
				props: {
					title: this.i18n.platforms,
					target: this.platformTarget,
					template: TemplatePlatform,
					bars: [{
						instance: Total
					}],
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: "fa-info-circle",
								btnId: "details",
								title: this.i18n.info,
								href: this.viewPathsWidgets.platforms,
								pathToItem: "platform"
							}]
						}
					}
				}
			};
		},

		_contactsConfig: function() {

			return {
				width: 3,
				height: 2,
				type: declare([ListImpl, _Framework]),
				props: {
					title: this.i18n.contacts,
					target: this.contactTarget,
					template: TemplateContacts,
					bars: [{
						instance: Total
					}]
				}
			};
		},

		_documentsConfig: function() {

			return {
				width: 3,
				height: 2,
				type: declare([ListImpl, _Framework, _ButtonsInRow]),
				props: {
					title: this.i18n.documents,
					target: this.documentTarget,
					template: TemplateDocuments,
					bars: [{
						instance: Total
					}],
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: "fa-file-pdf-o",
								btnId: "downloadPdf",
								title: this.i18n.download,
								condition: "url",
								href: redmicConfig.viewPaths.bibliographyDetails
							},{
								icon: "fa-info-circle",
								btnId: "details",
								title: this.i18n.info,
								href: this.viewPathsWidgets.documents
							}]
						}
					}
				}
			};
		},

		_setAdditionalConfig: function(title, template, href) {

			return {
				width: 3,
				height: 2,
				type: declare([ListImpl, _Framework, _ButtonsInRow, _Filter]),
				props: {
					title: title,
					bars: [{
						instance: Total
					},{
						instance: Pagination
					}],
					template: template,
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: "fa-info-circle",
								btnId: "details",
								title: this.i18n.info,
								href: href
							}]
						}
					}
				}
			};
		},

		_infoConfig: function(obj) {

			return {
				width: obj.width || 3,
				height: obj.height || 6,
				type: TemplateDisplayer,
				props: {
					title: this.i18n.info,
					template: obj.template,
					"class": "containerDetails",
					classEmptyTemplate: "contentListNoData",
					target: this.infoTarget || this.target,
					associatedIds: [this.ownChannel],
					shownOption: this.shownOptionInfo
				}
			};
		},

		_clearModules: function() {

			this._publish(this._getWidgetInstance('info').getChannel('CLEAR'));
			this._publish(this._getWidgetInstance('organisationList').getChannel('CLEAR'));
			this._publish(this._getWidgetInstance('contactList').getChannel('CLEAR'));
			this._publish(this._getWidgetInstance('platformList').getChannel('CLEAR'));
			this._publish(this._getWidgetInstance('documentList').getChannel('CLEAR'));
		},

		_refreshModules: function() {

			this._checkPathVariableId();

			this._emitEvt('GET', {
				target: this.target,
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});

			this._targetListRank && this._refreshChildrenDataModules();
		},

		_refreshChildrenDataModules: function() {

			var target = lang.replace(this._targetListRank, {
					id: this.pathVariableId
				}),
				widgetInstance = this._getWidgetInstance('additionalInfo');

			this._publish(widgetInstance.getChannel("UPDATE_TARGET"), {
				target: target
			});

			this._publish(widgetInstance.getChildChannel("filter", "REFRESH"));
		},

		_itemAvailable: function(res) {

			var documents = res.data.documents;
			if (documents && documents.length) {
				for (var i = 0; i < documents.length; i++) {
					this._emitEvt('INJECT_ITEM', {
						data: documents[i].document,
						target: this.documentTarget
					});
				}
			}

			var contacts = res.data.contacts;
			if (contacts && contacts.length) {
				this._emitEvt('INJECT_DATA', {
					data: contacts,
					target: this.contactTarget
				});
			}

			var platforms = res.data.platforms;
			if (platforms && platforms.length) {
				this._emitEvt('INJECT_DATA', {
					data: platforms,
					target: this.platformTarget
				});
			}

			var organisations = res.data.organisations;
			if (organisations && organisations.length) {
				this._emitEvt('INJECT_DATA', {
					data: organisations,
					target: this.organisationTarget
				});
			}
		}
	});
});
