define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/base/_SelectionManager'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/design/map/_AddAtlasComponent'
	, 'src/design/map/_AddQueryOnMapComponent'
	, 'src/design/map/_AddAcousticDetectionComponents'
	, 'src/design/map/_MapDesignWithTopbarAndContentLayout'
	, 'src/redmicConfig'
], function(
	declare
	, lang
	, _Module
	, _SelectionManager
	, _Show
	, _Store
	, _AddAtlasComponent
	, _AddQueryOnMapComponent
	, _AddAcousticDetectionComponents
	, _MapDesignWithTopbarAndContentLayout
	, redmicConfig
) {

	// TODO usar textSearch sin sugerencias, tocando diseño para hacerlo más modular!!!
	return declare([_Module, _Show, _Store, _SelectionManager, _MapDesignWithTopbarAndContentLayout,
		_AddAcousticDetectionComponents, _AddAtlasComponent, _AddQueryOnMapComponent], {
		// summary:
		//   Widget para mostrar un mapa con datos de detecciones y controles de reproducción.

		postMixInProperties: function() {

			this.inherited(arguments);

			const defaultConfig = {
				ownChannel: 'activityAcousticDetectionMap',
				target: redmicConfig.services.acousticTrackingAnimals,
				requestMethod: 'GET',
				idProperty: 'id',
				elementPropName: 'animal',
				layersTarget: redmicConfig.services.acousticTrackingAnimalTrack,
				//timeMode: true
			};

			this._mergeOwnAttributes(defaultConfig);
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this.mergeComponentAttribute('searchConfig', {
				requestMethod: this.requestMethod
			});
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('ME_OR_ANCESTOR_SHOWN', lang.hitch(this, this._onMeOrAncestorShown));
		},

		_onMeOrAncestorShown: function() {

			this.inherited(arguments);

			this._requestData();
		},

		_requestData: function() {

			const path = {
				id: this.pathVariableId
			};

			const method = this.requestMethod,
				target = this.target,
				params = {path, sharedParams: true};

			this._emitEvt('REQUEST', {method, target, params});
		}
	});
});
