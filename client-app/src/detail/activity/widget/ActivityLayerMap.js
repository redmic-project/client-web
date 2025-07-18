define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/design/map/_AddAtlasComponent'
	, 'src/design/map/_MapDesignController'
	, 'src/design/map/_MapDesignWithContentLayout'
	, 'src/viewer/marineMonitoring/_ManageOgcServices'
	, 'templates/AtlasMixedList'
], function(
	declare
	, lang
	, _Module
	, _Show
	, _Store
	, _AddAtlasComponent
	, _MapDesignController
	, _MapDesignWithContentLayout
	, _ManageOgcServices
	, AtlasMixedListTemplate
) {

	return declare([_Module, _Show, _Store, _MapDesignController, _MapDesignWithContentLayout, _AddAtlasComponent,
		_ManageOgcServices], {
		//	summary:
		//		Widget para mostrar en un mapa las capas asociadas a una actividad.

		constructor: function(args) {

			const defaultConfig = {
				ownChannel: 'activityLayerMap'
			};

			lang.mixin(this, this._merge([this, defaultConfig, args]));
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('ME_OR_ANCESTOR_SHOWN', lang.hitch(this, this._onMeOrAncestorShown));
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this.mergeComponentAttribute('atlasConfig', {
				addThemesBrowserFirst: true,
				themesBrowserConfig: {
					title: this.i18n.contents,
					browserConfig: {
						template: AtlasMixedListTemplate,
						disableDragHandlerOnCreation: true
					}
				}
			});
		},

		_onMeOrAncestorShown: function() {

			this._requestLayersDataFilteredByActivityIds([this.pathVariableId]);
		}
	});
});
