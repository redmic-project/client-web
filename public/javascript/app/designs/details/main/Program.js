define([
	"app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddTitle"
	, "app/designs/details/_TitleSelection"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/browser/bars/Pagination"
	, "redmic/modules/browser/bars/Total"
	, "redmic/modules/layout/TabsDisplayer"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "templates/ActivityTitle"
	, "templates/ContactSet"
	, "templates/DocumentList"
	, "templates/OrganisationSet"
	, "templates/PlatformSet"
	, "templates/ProjectInfo"
	, "templates/ProjectList"
], function(
	_Main
	, Controller
	, Layout
	, _AddTitle
	, _TitleSelection
	, redmicConfig
	, declare
	, lang
	, _Filter
	, _Framework
	, ListImpl
	, Pagination
	, Total
	, TabsDisplayer
	, TemplateDisplayer
	, TemplateTitle
	, TemplateContacts
	, TemplateDocuments
	, TemplateOrganisation
	, TemplatePlatform
	, TemplateInfo
	, TemplateProjects
){
	return declare([Layout, Controller, _Main, _AddTitle, _TitleSelection], {
		//	summary:
		//		Vista detalle de Program.

		constructor: function(args) {

			this.target = redmicConfig.services.program;
			this.reportService = "program";
			this.documentTarget = "documents";
			this.contactTarget = "contacts";
			this.organisationTarget = "organisations";
			this.platformTarget = "platforms";

			this.titleRightButtonsList = [];

			this.config = {
				noScroll: true
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.titleWidgetConfig = this._merge([{
				template: TemplateTitle,
				target: this.target
			}, this.titleWidgetConfig || {}]);

			this.widgetConfigs = this._merge([{
				info: {
					width: 3,
					height: 6,
					type: TemplateDisplayer,
					props: {
						title: this.i18n.info,
						template: TemplateInfo,
						"class": "containerDetails",
						classEmptyTemplate: "contentListNoData",
						target: this.target,
						associatedIds: [this.ownChannel]
					}
				},
				additionalInfo: {
					width: 3,
					height: 6,
					type: TabsDisplayer,
					props: {
						title: this.i18n.additionalInfo,
						childTabs: [{
							title: this.i18n.organisations,
							type: declare([ListImpl, _Framework]),
							props: {
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
						},{
							title: this.i18n.platforms,
							type: declare([ListImpl, _Framework]),
							props: {
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
						},{
							title: this.i18n.contacts,
							type: declare([ListImpl, _Framework]),
							props: {
								target: this.contactTarget,
								template: TemplateContacts,
								bars: [{
									instance: Total
								}]
							}
						},{
							title: this.i18n.documents,
							type: declare([ListImpl, _Framework]),
							props: {
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
											href: redmicConfig.viewPaths.bibliographyPDF
										},{
											icon: "fa-info-circle",
											btnId: "details",
											title: this.i18n.info,
											href: this.viewPathsWidgets.documents
										}]
									}
								}
							}
						},{
							title: this.i18n.projects,
							type: declare([ListImpl, _Framework, _Filter]),
							props: {
								bars: [{
									instance: Total
								},{
									instance: Pagination
								}],
								template: TemplateProjects,
								rowConfig: {
									buttonsConfig: {
										listButton: [{
											icon: "fa-info-circle",
											btnId: "details",
											title: this.i18n.info,
											href: this.viewPathsWidgets.projects
										}]
									}
								}
							}
						}]
					}
				}
			}, this.widgetConfigs || {}]);
		},

		_afterShow: function(request) {

			this.startup();
		},

		_clearModules: function() {

			this._publish(this._widgets.info.getChannel("CLEAR"));
			this._publish(this._widgets.additionalInfo.getChildChannel("childInstances.0", "CLEAR"));
			this._publish(this._widgets.additionalInfo.getChildChannel("childInstances.1", "CLEAR"));
			this._publish(this._widgets.additionalInfo.getChildChannel("childInstances.2", "CLEAR"));
			this._publish(this._widgets.additionalInfo.getChildChannel("childInstances.3", "CLEAR"));
			this._publish(this._widgets.additionalInfo.getChildChannel("childInstances.4", "CLEAR"));
		},

		_refreshModules: function() {

			this._checkPathVariableId();

			this._emitEvt('GET', {
				target: this.target,
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});

			this._refreshChildrenDataModules();
		},

		_refreshChildrenDataModules: function() {

			var programChildrenTarget = lang.replace(redmicConfig.services.projectProgram, {
				id: this.pathVariableId
			});

			this._publish(this._widgets.additionalInfo.getChildChannel("childInstances.4", "UPDATE_TARGET"), {
				target: programChildrenTarget,
				refresh: true
			});
		},

		_itemAvailable: function(response) {

			if (response.data.documents && response.data.documents.length) {
				for (var i = 0; i < response.data.documents.length; i++)
					this._emitEvt('INJECT_ITEM', {
						data: response.data.documents[i].document,
						target: this.documentTarget
					});
			}

			if (response.data.contacts && response.data.contacts.length) {
				this._emitEvt('INJECT_DATA', {
					data: response.data.contacts,
					target: this.contactTarget
				});
			}

			if (response.data.platforms && response.data.platforms.length) {
				this._emitEvt('INJECT_DATA', {
					data: response.data.platforms,
					target: this.platformTarget
				});
			}

			if (response.data.organisations && response.data.organisations.length) {
				this._emitEvt('INJECT_DATA', {
					data: response.data.organisations,
					target: this.organisationTarget
				});
			}
		}
	});
});