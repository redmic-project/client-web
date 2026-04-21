define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/base/_SelectionManager'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/design/map/_AddAtlasComponent'
	, 'src/design/map/_AddQueryOnMapComponent'
	, 'src/design/map/_AddTrackingComponents'
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
	, _AddTrackingComponents
	, _MapDesignWithTopbarAndContentLayout
	, redmicConfig
) {

	// TODO usar textSearch sin sugerencias, tocando diseño para hacerlo más modular!!!
	return declare([_Module, _Show, _Store, _SelectionManager, _MapDesignWithTopbarAndContentLayout,
		_AddTrackingComponents, _AddAtlasComponent, _AddQueryOnMapComponent], {
		// summary:
		//   Widget para mostrar un mapa con datos de seguimiento y controles de reproducción.

		postMixInProperties: function() {

			this.inherited(arguments);

			const defaultConfig = {
				ownChannel: 'activityTrackingMap',
				target: redmicConfig.services.elementsTrackingActivity,
				method: 'POST',
				getRequestQueryParams: text => (text ? {text: {text}} : {text: null}),
				layersTarget: redmicConfig.services.pointTrackingCluster,
				infoTarget: redmicConfig.services.trackingActivity,
				timeMode: true
			};

			this._mergeOwnAttributes(defaultConfig);

			// TODO temporal, hasta que se unifiquen servicios
			if (this.usePrivateTarget) {
				this.target = redmicConfig.services.acousticTrackingAnimals;
				this.method = 'GET';
				this.getRequestQueryParams = null;

				this.layersTarget = redmicConfig.services.acousticTrackingAnimalTrack;
				this.infoTarget = redmicConfig.services.acousticTrackingPointInfo;
			}
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this.mergeComponentAttribute('searchConfig', {
				requestMethod: this.method,
				getRequestQueryParams: this.getRequestQueryParams
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

			const method = this.method,
				target = this.target,
				params = {path, sharedParams: true};

			this._emitEvt('REQUEST', {method, target, params});
		}
	});
});
