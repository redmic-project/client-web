define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/design/map/_AddAtlasComponent'
	, 'src/design/map/_AddBrowserComponent'
	, 'src/design/map/_AddMapLayerComponent'
	, 'src/design/map/_MapDesignWithContentLayout'
	, 'src/redmicConfig'
	, 'templates/AreaPopup'
	, 'templates/AreaList'
], function(
	declare
	, lang
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
		//		Widget para mostrar en un mapa las geometrías asociadas a una actividad.

		postMixInProperties: function() {

			this.inherited(arguments);

			const defaultConfig = {
				ownChannel: 'activityAreaMap',
				target: redmicConfig.services.areasByActivity,
				mapLayerDefinition: 'geojson',
				mapLayerPopupTemplate: TemplatePopup
			};

			this._mergeOwnAttributes(defaultConfig);
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('ME_OR_ANCESTOR_SHOWN', lang.hitch(this, this._onMeOrAncestorShown));
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this.mergeComponentAttribute('browserConfig', {
				template: TemplateList
			});
		},

		_onMeOrAncestorShown: function() {

			this._requestData();
		},

		_requestData: function() {

			const path = {
				activityid: this.pathVariableId
			};

			const sharedParams = true;

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this.target,
				params: {path, sharedParams}
			});
		}
	});
});
