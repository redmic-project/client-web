define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/query'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/design/map/_AddAtlasComponent'
	, 'src/design/map/_AddBrowserComponent'
	, 'src/design/map/_AddMapLayerComponent'
	, 'src/design/map/_MapDesignWithContentLayout'
	, 'src/redmicConfig'
	, 'templates/ObservationStationPopup'
	, 'templates/ObservationStationList'
], function(
	declare
	, lang
	, query
	, _Module
	, _Show
	, _Store
	, _AddAtlasComponent
	, _AddBrowserComponent
	, _AddMapLayerComponent
	, _MapDesignWithContentLayout
	, redmicConfig
	, TemplatePopup
	, TemplateList
) {

	return declare([_Module, _Show, _Store, _MapDesignWithContentLayout, _AddAtlasComponent, _AddBrowserComponent,
		_AddMapLayerComponent], {
		//	summary:
		//		Widget para mostrar un mapa de puntos donde se registran observaciones.

		postMixInProperties: function() {

			const defaultConfig = {
				ownChannel: 'activityFixedObservationSeriesMap',
				mapLayerPopupTemplate: TemplatePopup,
				target: redmicConfig.services.acousticDetectionReceptors,
				stationDataTarget: 'stationData',
				_showObservationsButtonClass: 'showObservations'
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('ME_OR_ANCESTOR_SHOWN', lang.hitch(this, this._onMeOrAncestorShown));
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this.mergeComponentAttribute('browserConfig', {
				template: TemplateList,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-database',
							btnId: 'showObservations',
							returnItem: true,
							href: '#fixedObservationSeriesList',
							title: this.i18n.observations
						}]
					}
				}
			}, {
				arrayMergingStrategy: 'overwrite'
			});
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			const mapLayerInstance = this.getComponentInstance('mapLayer');

			this.subscriptionsConfig.push({
				channel : mapLayerInstance.getChannel('POPUP_LOADED'),
				callback: '_subMapLayerStationPopupLoaded'
			});
		},

		_subMapLayerStationPopupLoaded: function(res) {

			var popupNode = res?._contentNode,
				popupData = res?._source?.feature?.properties;

			if (!popupNode || !popupData) {
				return;
			}

			var showChartsNode = query('.' + this._showObservationsButtonClass, popupNode)[0];

			if (!showChartsNode) {
				return;
			}

			showChartsNode.onclick = lang.hitch(this, this._loadObservationSeriesData, popupData);
		},

		_showObservationsCallback: function(evt) {

			this._loadObservationSeriesData(evt.item);
		},

		_loadObservationSeriesData: function(item) {

			this._emitEvt('INJECT_ITEM', {
				target: this.stationDataTarget,
				data: item
			});
		},

		_onMeOrAncestorShown: function() {

			this._requestData();
		},

		_requestData: function() {

			const path = {
				id: this.pathVariableId
			};

			const method = 'GET',
				target = this.target,
				params = {path};

			this._emitEvt('REQUEST', {method, target, params});
		}
	});
});
