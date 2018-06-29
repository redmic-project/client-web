define([
	"app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddTitle"
	, "app/designs/details/_TitleSelection"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/browser/bars/Total"
	, "redmic/modules/layout/TabsDisplayer"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "templates/ActivityTitle"
	, "templates/ContactSet"
	, "templates/DocumentList"
	, "templates/OrganisationSet"
	, "templates/PlatformSet"
	, "templates/ActivityInfo"
	, "templates/ActivityInfoHelp"
], function(
	_Main
	, Controller
	, Layout
	, _AddTitle
	, _TitleSelection
	, redmicConfig
	, declare
	, lang
	, _ButtonsInRow
	, _Framework
	, ListImpl
	, Total
	, TabsDisplayer
	, TemplateDisplayer
	, TemplateTitle
	, TemplateContacts
	, TemplateDocuments
	, TemplateOrganisation
	, TemplatePlatform
	, TemplateInfo
	, TemplateInfoHelp
){
	return declare([Layout, Controller, _Main, _AddTitle, _TitleSelection], {
		//	summary:
		//		Vista detalle de Activity.

		constructor: function(args) {

			this.target = redmicConfig.services.activity;
			this.reportService = "activity";
			this.ancestorsTarget = redmicConfig.services.activityAncestors;
			this.documentTarget = "documents";
			this.contactTarget = "contacts";
			this.organisationTarget = "organisations";
			this.platformTarget = "platforms";
			this.infoWidgetTarget = "infoWidgetTarget";

			this.config = {
				noScroll: true
			};

			this.titleRightButtonsList = [];

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.titleWidgetConfig = this._merge([{
				template: TemplateTitle,
				target: this.target
			}, this.titleWidgetConfig || {}]);

			this.widgetConfigs = this._merge([{
				helpText: {
					width: 6,
					height: 1,
					type: TemplateDisplayer,
					props: {
						title: this.i18n.dataDownload,
						template: TemplateInfoHelp,
						"class": "templateInfo",
						target: "helpTextActivity"
					}
				},
				info: {
					width: 3,
					height: 5,
					type: TemplateDisplayer,
					props: {
						title: this.i18n.info,
						template: TemplateInfo,
						"class": "containerDetails",
						classEmptyTemplate: "contentListNoData",
						target: this.infoWidgetTarget,
						associatedIds: [this.ownChannel],
						shownOption: this.shownOptionInfo
					}
				},
				additionalInfo: {
					width: 3,
					height: 5,
					type: TabsDisplayer,
					props: {
						title: this.i18n.additionalInfo,
						childTabs: [{
							title: this.i18n.organisations,
							type: declare([ListImpl, _Framework, _ButtonsInRow]),
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
							type: declare([ListImpl, _Framework, _ButtonsInRow]),
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
							type: declare([ListImpl, _Framework, _ButtonsInRow]),
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
						}]
					}
				}
			}, this.widgetConfigs || {}]);
		},

		_clearModules: function() {

			this._publish(this._widgets.info.getChannel("CLEAR"));
			this._publish(this._widgets.additionalInfo.getChildChannel("childInstances.0", "CLEAR"));
			this._publish(this._widgets.additionalInfo.getChildChannel("childInstances.1", "CLEAR"));
			this._publish(this._widgets.additionalInfo.getChildChannel("childInstances.2", "CLEAR"));
			this._publish(this._widgets.additionalInfo.getChildChannel("childInstances.3", "CLEAR"));
		},

		_refreshModules: function() {

			this._checkPathVariableId();

			var object = {};

			object.info = this.i18n.helpTextActivityDetails;

			this._emitEvt('INJECT_ITEM', {
				data: object,
				target: "helpTextActivity"
			});

			this._emitEvt('GET', {
				target: this.target,
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});
		},

		_itemAvailable: function(res) {

			var path = res.data.path,
				ancestorsTarget = lang.replace(this.ancestorsTarget, { path: path });

			this._activityData = res.data;
			this._originalTarget = this.target;
			this.target = ancestorsTarget;

			this._emitEvt('INJECT_DATA', {
				data: this._activityData,
				target: this.infoWidgetTarget
			});

			this._emitEvt('REQUEST', {
				method: "POST",
				target: ancestorsTarget,
				query: {
					returnFields: ['id', 'path', 'name']
				}
			});

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
		},

		_dataAvailable: function(res) {

			this.target = this._originalTarget;

			var data = res.data,
				ancestors = data.data;

			this._activityData.ancestors = ancestors;

			this._emitEvt('INJECT_DATA', {
				data: this._activityData,
				target: this.infoWidgetTarget
			});
		}
	});
});
