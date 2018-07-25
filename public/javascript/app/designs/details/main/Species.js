define([
	"app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddTitle"
	, "app/designs/details/_TitleSelection"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/browser/bars/Total"
	, "redmic/modules/layout/TabsDisplayer"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "templates/ActivityList"
	, "templates/DocumentList"
	, "templates/LoadingCustom"
	, "templates/LoadingEmpty"
	, "templates/SpeciesInfo"
	, "templates/SpeciesTitle"
], function(
	_Main
	, Controller
	, Layout
	, _AddTitle
	, _TitleSelection
	, redmicConfig
	, declare
	, lang
	, Deferred
	, _ButtonsInRow
	, _Framework
	, ListImpl
	, Total
	, TabsDisplayer
	, TemplateDisplayer
	, TemplateActivities
	, TemplateDocuments
	, TemplateCustom
	, TemplateEmpty
	, TemplateInfo
	, TemplateTitle
){
	return declare([Layout, Controller, _Main, _AddTitle, _TitleSelection], {
		//	summary:
		//		Vista detalle de Species.

		constructor: function(args) {

			this.target = [redmicConfig.services.species];
			this.reportService = "species";
			this.ancestorsTarget = redmicConfig.services.taxonAncestors;
			this.documentTarget = "documents";
			this.activityTarget = "activities";
			this.infoTarget = "infoTarget";
			this.titleWidgetTarget = "titleWidgetTarget";

			this.titleRightButtonsList = [];

			this.config = {
				noScroll: true
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.titleWidgetConfig = this._merge([{
				template: TemplateTitle,
				target: this.titleWidgetTarget
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
						target: this.infoTarget,
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
							title: this.i18n.activities,
							type: declare([ListImpl, _Framework, _ButtonsInRow]),
							props: {
								target: this.activityTarget,
								template: TemplateActivities,
								bars: [{
									instance: Total
								}],
								rowConfig: {
									buttonsConfig: {
										listButton: [{
											icon: "fa-info-circle",
											btnId: "details",
											title: this.i18n.info,
											href: this.viewPathsWidgets.activities
										}]
									}
								}
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
								},
								noDataMessage: TemplateCustom({
									message: this.i18n.noAssociatedDocuments,
									iconClass: "fr fr-no-data"
								})
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
		},

		_refreshModules: function() {

			this._checkPathVariableId();

			this._refreshChildrenDataModules();

			this._emitEvt('GET', {
				target: this.target[0],
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});
		},

		_refreshChildrenDataModules: function() {

			this.target[1] = lang.replace(redmicConfig.services.documentsBySpecies, {
				id: this.pathVariableId
			});

			this._emitEvt('GET', {
				target: this.target[1],
				id: ''
			});

			this.target[2] = lang.replace(redmicConfig.services.activitiesBySpecies, {
				id: this.pathVariableId
			});

			this._emitEvt('GET', {
				target: this.target[2],
				id: ''
			});
		},

		_itemAvailable: function(res) {

			if (res.target === this.target[1]) {
				this._dataToDocument(res);
				return;
			}

			if (res.target === this.target[2]) {
				this._dataToActivities(res);
				return;
			}

			this.target[3] = lang.replace(this.ancestorsTarget, { path: res.data.path });

			this._speciesData = lang.clone(res.data);

			this._emitEvt('REQUEST', {
				method: "POST",
				target: this.target[3],
				query: {
					returnFields: ['scientificName', 'rank']
				}
			});

			this._speciesData.canaryCatalogue = this._hrefDocument('canaryCatalogue');
			this._speciesData.spainCatalogue = this._hrefDocument('spainCatalogue');
			this._speciesData.euDirective = this._hrefDocument('euDirective');

			this._emitEvt('INJECT_DATA', {
				data: this._speciesData,
				target: this.infoTarget
			});
		},

		_dataToDocument: function(response) {

			var data = response.data;

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this.documentTarget
			});
		},

		_dataToActivities: function(response) {

			var data = response.data;

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this.activityTarget
			});
		},

		_dataAvailable: function(res) {

			var data = res.data,
				ancestors = data.data;

			this._speciesData.ancestors = ancestors;

			this._emitEvt('INJECT_DATA', {
				data: this._speciesData,
				target: this.titleWidgetTarget
			});
		},

		_hrefDocument: function(idProperty) {

			var valueItem = this._speciesData[idProperty];

			if (valueItem)
				return lang.replace(this.viewPathsWidgets.documents, { id: valueItem });
		}
	});
});