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
	, 'app/designs/details/main/_DetailsBase'
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
	, _DetailsBase
	, SpeciesLocation
) {

	return declare([_DetailsBase, _GenerateReport], {
		//	summary:
		//		Vista detalle de especies.

		constructor: function(args) {

			this.config = {
				templateTitle: TemplateTitle,
				templateInfo: TemplateInfo,
				target: redmicConfig.services.species,
				reportService: 'species',
				ancestorsTarget: redmicConfig.services.taxonAncestors,
				documentTarget: 'documents',
				activityTarget: 'activities',
				infoTarget: 'infoTarget',
				titleWidgetTarget: 'titleWidgetTarget',
				pathParent: redmicConfig.viewPaths.speciesCatalog
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.viewPathsWidgets = {
				documents: redmicConfig.viewPaths.bibliographyDetails,
				activities: redmicConfig.viewPaths.activityDetails
			};
		},

		_setMainConfigurations: function() {

			this.inherited(arguments);

			this.titleWidgetConfig = this._merge([{
				target: this.titleWidgetTarget
			}, this.titleWidgetConfig || {}]);

			var documentListConfig = this._merge([
				this._getDocumentsConfig(),
				{
					props: {
						noDataMessage: TemplateCustom({
							message: this.i18n.noAssociatedDocuments,
							iconClass: 'fr fr-no-data'
						})
					}
				}
			]);

			this.widgetConfigs = this._merge([
				this.widgetConfigs || {},
				{
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
				}
			]);
		},

		_clearModules: function() {

			this.inherited(arguments);

			this._publish(this._getWidgetInstance('activityList').getChannel('CLEAR'));
			this._publish(this._getWidgetInstance('documentList').getChannel('CLEAR'));
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

			this._publish(this._getWidgetInstance('map').getChannel('SET_PROPS'), {
				pathVariableId: this.pathVariableId
			});

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

		_itemAvailable: function(res, resWrapper) {

			if (resWrapper.target === this.target[1]) {
				this._dataToDocument(res);
				return;
			}

			if (resWrapper.target === this.target[2]) {
				this._dataToActivities(res);
				return;
			}

			this.target[3] = lang.replace(this.ancestorsTarget, { path: res.data.path });

			this._speciesData = lang.clone(res.data);

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

			if (valueItem) {
				return lang.replace(this.viewPathsWidgets.documents, { id: valueItem });
			}
		}
	});
});
