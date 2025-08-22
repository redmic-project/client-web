define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/browser/_ButtonsInRow'
	, 'src/component/browser/_Framework'
	, 'src/detail/_GenerateReport'
	, 'templates/LoadingCustom'
	, 'templates/SpeciesInfo'
	, 'templates/SpeciesTitle'
	, 'src/detail/_DetailRelatedToActivity'
	, 'src/detail/species/widget/SpeciesLocationMap'
], function(
	redmicConfig
	, declare
	, lang
	, _ButtonsInRow
	, _Framework
	, _GenerateReport
	, TemplateCustom
	, TemplateInfo
	, TemplateTitle
	, _DetailRelatedToActivity
	, SpeciesLocationMap
) {

	return declare([_DetailRelatedToActivity, _GenerateReport], {
		//	summary:
		//		Vista detalle de especies.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.species,
				ancestorsTarget: redmicConfig.services.taxonAncestors,
				infoTarget: 'infoTarget',
				titleWidgetTarget: 'titleWidgetTarget',
				activitiesTargetBase: redmicConfig.services.activitiesBySpecies,
				documentTarget: redmicConfig.services.documentsBySpecies,
				templateTitle: TemplateTitle,
				templateInfo: TemplateInfo,
				reportService: 'species',
				pathParent: redmicConfig.viewPaths.speciesCatalog
			};

			lang.mixin(this, this.config, args);
		},

		_afterSetConfigurations: function() {

			this.inherited(arguments);

			this.titleWidgetConfig = this._merge([this.titleWidgetConfig || {}, {
				target: this.titleWidgetTarget
			}]);

			var documentListConfig = this._merge([this._getDocumentsConfig(), {
				props: {
					target: this.documentTarget,
					noDataMessage: TemplateCustom({
						message: this.i18n.noAssociatedDocuments,
						iconClass: 'fr fr-no-data'
					})
				}
			}]);

			this.widgetConfigs = this._merge([this.widgetConfigs || {}, {
				info: {
					height: 5
				},
				activityList: {
					height: 3
				},
				documentList: documentListConfig,
				map: {
					width: 3,
					height: 3,
					type: SpeciesLocationMap,
					props: {
						title: 'location',
						pathVariableId: this.pathVariableId
					}
				}
			}]);
		},

		_clearModules: function() {

			this.inherited(arguments);

			this._publish(this._getWidgetInstance('documentList').getChannel('CLEAR'));
		},

		_refreshModules: function() {

			this.inherited(arguments);

			this._refreshChildrenDataModules();
		},

		_refreshChildrenDataModules: function() {

			this._publish(this._getWidgetInstance('map').getChannel('SET_PROPS'), {
				pathVariableId: this.pathVariableId
			});

			this._emitEvt('REQUEST', {
				method: 'GET',
				target: this.documentTarget,
				params: {
					path: {
						id: this.pathVariableId
					}
				}
			});
		},

		_itemAvailable: function(res, resWrapper) {

			this.inherited(arguments);

			const data = res.data;

			this._requestDataForTitle(data?.path);
			this._dataToInfo(data);
		},

		_requestDataForTitle: function(path) {

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this.ancestorsTarget,
				action: '_search',
				params: {
					path: {
						path
					},
					query: {
						returnFields: ['scientificName', 'rank']
					}
				}
			});
		},

		_dataToInfo: function(resData) {

			const canaryCatalogue = this._hrefDocument(resData.canaryCatalogue),
				spainCatalogue = this._hrefDocument(resData.spainCatalogue),
				euDirective = this._hrefDocument(resData.euDirective);

			const data = this._merge([resData, {canaryCatalogue, spainCatalogue, euDirective}]);

			this._speciesData = lang.clone(data);

			this._emitEvt('INJECT_DATA', {
				data,
				target: this.infoTarget
			});
		},

		_hrefDocument: function(id) {

			return id && lang.replace(redmicConfig.viewPaths.bibliographyDetails, {id});
		},

		_dataAvailable: function(res) {

			this.inherited(arguments);

			const ancestors = res.data?.data,
				data = this._merge([this._speciesData, {ancestors}]);

			this._emitEvt('INJECT_DATA', {
				data,
				target: this.titleWidgetTarget
			});
		}
	});
});
