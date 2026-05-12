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
	, 'templates/InfrastructurePopup'
	, 'templates/InfrastructureList'
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
	, TemplatePopup
	, TemplateList
) {

	return declare([_Module, _Show, _Store, _MapDesignWithContentLayout, _AddAtlasComponent, _AddQueryOnMapComponent,
		_AddBrowserComponent, _AddMapLayerComponent], {
		//	summary:
		//		Widget para mostrar en un mapa las ubicaciones de infraestructuras asociadas a una actividad.

		postMixInProperties: function() {

			const defaultConfig = {
				ownChannel: 'activityInfrastructureMap',
				target: redmicConfig.services.infrastructureByActivity,
				mapLayerPopupTemplate: TemplatePopup
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
							condition: "url",
							icon: "fa-link",
							btnId: "infrastructureUrl",
							returnItem: true,
							title: "url"
						}]
					}
				}
			}, {
				arrayMergingStrategy: 'concatenate'
			});
		},

		_infrastructureUrlCallback: function(res) {

			globalThis.open(res.item?.url, '_blank');
		},

		_onMeOrAncestorShown: function() {

			this._requestData();
		},

		_requestData: function() {

			const path = {
				id: this.pathVariableId
			};

			const method = 'POST',
				target = this.target,
				params = {path};

			this._emitEvt('REQUEST', {method, target, params});
		}
	});
});
