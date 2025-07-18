define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Filter'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/design/map/_AddAtlasComponent'
	, 'src/design/map/_AddBrowserComponent'
	, 'src/design/map/_AddMapLayerComponent'
	, 'src/design/map/_MapDesignController'
	, 'src/design/map/_MapDesignWithContentLayout'
	, 'src/redmicConfig'
	, 'templates/SpeciesDistributionPopup'
	, 'templates/CitationList'
], function(
	declare
	, lang
	, _Filter
	, _Module
	, _Show
	, _Store
	, _AddAtlasComponent
	, _AddBrowserComponent
	, _AddMapLayerComponent
	, _MapDesignController
	, _MapDesignWithContentLayout
	, redmicConfig
	, TemplatePopup
	, TemplateList
) {

	return declare([_Module, _Show, _Store, _Filter, _MapDesignController, _MapDesignWithContentLayout,
		_AddAtlasComponent, _AddBrowserComponent, _AddMapLayerComponent], {
		//	summary:
		//		Widget para mostrar en un mapa las ubicaciones de citas asociadas a una actividad.

		constructor: function(args) {

			const defaultConfig = {
				ownChannel: 'activityCitationMap',
				enabledMapLayerExtensions: {
					radius: true
				},
				_dataTarget: redmicConfig.services.citationByActivity,
				mapLayerPopupTemplate: TemplatePopup
			};

			lang.mixin(this, this._merge([this, defaultConfig, args]));
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

		_beforeInitialize: function() {

			this.inherited(arguments);

			const queryChannel = this.queryChannel;

			this.mergeComponentAttribute('browserConfig', {
				queryChannel
			});

			this.mergeComponentAttribute('searchConfig', {
				queryChannel
			});
		},

		_onMeOrAncestorShown: function() {

			const replacedTarget = this._getTargetWithVariableReplaced();

			this._updateComponentTargetValues(replacedTarget);
			this._requestDataFromReplacedTarget(replacedTarget);
		},

		_getTargetWithVariableReplaced: function() {

			const replaceObj = {
				id: this.pathVariableId
			};

			return lang.replace(this._dataTarget, replaceObj);
		},

		_updateComponentTargetValues: function(replacedTarget) {

			const browserInstance = this.getComponentInstance('browser'),
				searchInstance = this.getComponentInstance('search'),
				mapLayerInstance = this.getComponentInstance('mapLayer');

			this._publish(mapLayerInstance.getChannel('CHANGE_TARGET'), {
				target: replacedTarget
			});

			this._publish(browserInstance.getChannel('UPDATE_TARGET'), {
				target: replacedTarget,
				refresh: true
			});

			this._publish(searchInstance.getChannel('UPDATE_TARGET'), {
				target: replacedTarget,
				refresh: true
			});
		},

		_requestDataFromReplacedTarget: function(replacedTarget) {

			this._publish(this.getChannel('UPDATE_TARGET'), {
				target: replacedTarget,
				refresh: true
			});
		}
	});
});
