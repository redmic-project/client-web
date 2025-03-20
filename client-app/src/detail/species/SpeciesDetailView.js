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
	, 'app/designs/details/main/SpeciesLocation'
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
	, SpeciesLocation
) {

	return declare([_DetailRelatedToActivity, _GenerateReport], {
		//	summary:
		//		Vista detalle de especies.

		constructor: function(args) {

			this.config = {
				templateTitle: TemplateTitle,
				templateInfo: TemplateInfo,
				target: redmicConfig.services.species,
				activitiesTargetBase: redmicConfig.services.activitiesBySpecies,
				reportService: 'species',
				ancestorsTarget: redmicConfig.services.taxonAncestors,
				infoTarget: 'infoTarget',
				titleWidgetTarget: 'titleWidgetTarget',
				pathParent: redmicConfig.viewPaths.speciesCatalog
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.inherited(arguments);

			this.titleWidgetConfig = this._merge([{
				target: this.titleWidgetTarget
			}, this.titleWidgetConfig || {}]);

			var documentListConfig = this._merge([this._getDocumentsConfig(), {
				props: {
					noDataMessage: TemplateCustom({
						message: this.i18n.noAssociatedDocuments,
						iconClass: 'fr fr-no-data'
					})
				}
			}]);

			this.widgetConfigs = this._merge([this.widgetConfigs || {}, {
				info: {
					height: 5,
					props: {
						target: this.infoTarget
					}
				},
				activityList: {
					height: 3
				},
				documentList: documentListConfig,
				map: {
					width: 6,
					height: 4,
					type: SpeciesLocation,
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

			this.target[2] = lang.replace(redmicConfig.services.documentsBySpecies, {
				id: this.pathVariableId
			});

			this._emitEvt('GET', {
				target: this.target[2],
				id: ''
			});
		},

		_itemAvailable: function(res, resWrapper) {

			this.inherited(arguments);

			if (resWrapper.target === this.target[1]) {
				return;
			}

			if (resWrapper.target === this.target[2]) {
				this._dataToDocument(res.data);
				return;
			}

			this._dataToInfoAndTitle(res.data);
		},

		_dataToDocument: function(data) {

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this.documentTarget
			});
		},

		_dataToInfoAndTitle: function(data) {

			this.target[3] = lang.replace(this.ancestorsTarget, { path: data.path });

			this._speciesData = lang.clone(data);

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this.target[3],
				action: '_search',
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

		_hrefDocument: function(idProperty) {

			var valueItem = this._speciesData[idProperty];

			if (valueItem) {
				return lang.replace(redmicConfig.viewPaths.bibliographyDetails, { id: valueItem });
			}
		},

		_dataAvailable: function(res) {

			var data = res.data,
				ancestors = data.data;

			this._speciesData.ancestors = ancestors;

			this._emitEvt('INJECT_DATA', {
				data: this._speciesData,
				target: this.titleWidgetTarget
			});
		}
	});
});
