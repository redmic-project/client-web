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

	return declare([_Module, _Show, _Store, _SelectionManager, _MapDesignWithTopbarAndContentLayout,
		_AddTrackingComponents, _AddAtlasComponent, _AddQueryOnMapComponent], {
		// summary:
		//   Vista general de actividades con datos de seguimiento, para mostrarlos sobre un mapa con controles de
		//   reproducción.

		postMixInProperties: function() {

			this.inherited(arguments);

			const defaultConfig = {
				browserDefinition: 'hierarchical',
				enabledBrowserExtensions: {
					hierarchicalLazyLoad: true,
					hierarchicalSelectionManager: true,
					multiTemplate: true
				},

				activityTarget: redmicConfig.services.pointTrackingActivities,
				target: redmicConfig.services.elementsTrackingActivity,
				layersTarget: redmicConfig.services.pointTrackingCluster,
				infoTarget: redmicConfig.services.trackingActivity,

				_activityIdProperty: 'id',
				_trackingIdProperty: 'uuid',
				_trackingPathProperty: 'trackingPath'
			};

			this._mergeOwnAttributes(defaultConfig);
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this.mergeComponentAttribute('browserConfig', {
				target: this.activityTarget,
				targetChildren: this.target,
				selectionTarget: this.target,
				idProperty: this._activityIdProperty,
				pathProperty: this._trackingPathProperty,
				conditionParentProperty: 'activityType',
				parentIdProperty: this._activityIdProperty,
				childrenIdProperty: this._trackingIdProperty,
				rowConfig: {
					selectionIdProperty: this._trackingPathProperty
				}
			});
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('ME_OR_ANCESTOR_SHOWN', lang.hitch(this, this._onMeOrAncestorShown));
		},

		_onMeOrAncestorShown: function() {

			this.inherited(arguments);

			this._clearTrackingComponents?.();
			this._requestActivityData();
		},

		_requestActivityData: function() {

			const method = 'POST',
				target = this.activityTarget,
				params = {sharedParams: true};

			this._emitEvt('REQUEST', {method, target, params});
		},

		_getActivityIdFromSelectionResponse: function(res) {

			return res?.itemId?.split('.')?.[1];
		},

		_getTrackingItemIdFromSelectionResponse: function(res) {

			return res?.item?.[this._trackingIdProperty];
		}
	});
});
