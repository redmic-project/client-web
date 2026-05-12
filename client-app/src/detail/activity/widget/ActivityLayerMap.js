define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/design/map/_AddAtlasComponent'
	, 'src/design/map/_AddQueryOnMapComponent'
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
	, _AddQueryOnMapComponent
	, _MapDesignWithContentLayout
	, _ManageOgcServices
	, AtlasMixedListTemplate
) {

	return declare([_Module, _Show, _Store, _MapDesignWithContentLayout, _AddAtlasComponent, _AddQueryOnMapComponent,
		_ManageOgcServices], {
		//	summary:
		//		Widget para mostrar en un mapa las capas asociadas a una actividad.

		postMixInProperties: function() {

			const defaultConfig = {
				ownChannel: 'activityLayerMap'
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

			this.mergeComponentAttribute('atlasConfig', {
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
