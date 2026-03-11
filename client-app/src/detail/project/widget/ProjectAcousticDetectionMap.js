define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/design/map/_AddAtlasComponent'
	, 'src/design/map/_AddBrowserComponent'
	, 'src/design/map/_AddMapLayerComponent'
	, 'src/design/map/_AddQueryOnMapComponent'
	, 'src/design/map/_MapDesignWithContentLayout'
	, 'src/redmicConfig'
	, 'templates/AcousticDetectionPopup'
	, 'templates/AcousticDetectionList'
], function(
	declare
	, lang
	, _Module
	, _Show
	, _Store
	, _AddAtlasComponent
	, _AddBrowserComponent
	, _AddMapLayerComponent
	, _AddQueryOnMapComponent
	, _MapDesignWithContentLayout
	, redmicConfig
	, AcousticDetectionPopupTemplate
	, AcousticDetectionListTemplate
) {

	return declare([_Module, _Show, _Store, _MapDesignWithContentLayout, _AddAtlasComponent, _AddQueryOnMapComponent,
		_AddBrowserComponent, _AddMapLayerComponent], {
		// summary:
		//   Widget para mostrar en un mapa la distribución generalizada de detecciones acústicas de un proyecto, en
		//   base a los datos registrados en sus actividades.

		postMixInProperties: function() {

			const defaultConfig = {
				ownChannel: 'acousticDetectionMap',
				target: redmicConfig.services.acousticDistribution,
				mapLayerPopupTemplate: AcousticDetectionPopupTemplate,
				activityIds: [],
				idProperty: 'id'
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
				template: AcousticDetectionListTemplate,
				idProperty: this.idProperty
			});

			this.mergeComponentAttribute('mapLayerConfig', {
				idProperty: this.idProperty
			});

			this.mergeComponentAttribute('mapCenteringConfig', {
				idProperty: this.idProperty
			});
		},

		_onMeOrAncestorShown: function() {

			this._requestData();
		},

		_requestData: function() {

			const query = {
				'activity-ids': this.activityIds
			};

			this._emitEvt('REQUEST', {
				method: 'GET',
				target: this.target,
				params: {query}
			});
		}
	});
});
