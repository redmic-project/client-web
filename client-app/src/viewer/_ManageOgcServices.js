define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/atlas/_AtlasLayersManagement'
	, 'src/redmicConfig'
	, 'templates/ActivityLayerList'
], function(
	declare
	, lang
	, _AtlasLayersManagement
	, redmicConfig
	, ActivityLayerList
) {

	return declare(_AtlasLayersManagement, {
		//	summary:
		//

		constructor: function(args) {

			this.config = {
				layerTarget: redmicConfig.services.atlasLayer,
				templateTargetChange: 'activityLayers',
				_activityLayers: {}
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.inherited(arguments);

			this.browserConfig = this._merge([{
				template: ActivityLayerList,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-toggle-on',
							altIcon: 'fa-toggle-off',
							btnId: 'toggleShowLayer',
							title: 'layer',
							state: false,
							returnItem: true
						}]
					}
				}
			}, this.browserConfig || {}]);
		},

		_refreshModules: function() {

			this._checkPathVariableId();

			this._emitEvt('GET', {
				target: this.target,
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});

			this.targetChange = lang.replace(this.templateTargetChange, {id: this.pathVariableId});

			if (!this._listeningListButtons) {
				this._subscribe(this.browser.getChannel('BUTTON_EVENT'), lang.hitch(this,
					this._subActivityLayersListButtonEvent));

				this._listeningListButtons = true;
			}

			this.target = this.targetChange;
			this._emitEvt('REFRESH');
		},

		_subActivityLayersListButtonEvent: function(res) {

			var btnId = res.btnId;

			if (btnId === 'toggleShowLayer') {
				this._onToggleShowLayer(res);
			}
		},

		_onToggleShowLayer: function(obj) {

			if (obj.state) {
				this._addMapLayer(obj.id);
			} else {
				this._removeMapLayer(obj.id);
			}
		},

		_updateToggleShowLayerButton: function(layerId, action) {

			this._publish(this.browser.getChannel('browser', action), {
				idProperty: layerId,
				btnId: 'toggleShowLayer'
			});
		},

		_addMapLayer: function(layerId) {

			this._updateToggleShowLayerButton(layerId, 'CHANGE_ROW_BUTTON_TO_MAIN_CLASS');

			var layerInstance = this._activityLayers[layerId];

			this._publish(this.map.getChannel('ADD_LAYER'), {
				layer: layerInstance
			});
		},

		_removeMapLayer: function(layerId) {

			this._updateToggleShowLayerButton(layerId, 'CHANGE_ROW_BUTTON_TO_ALT_CLASS');

			var layerInstance = this._activityLayers[layerId];

			this._publish(this.map.getChannel('REMOVE_LAYER'), {
				layer: layerInstance
			});
		},

		_itemAvailable: function() {

			var storeChannel = this._buildChannel(this.storeChannel, this.actions.AVAILABLE);
			this._once(storeChannel, lang.hitch(this, this._onLayerActivitiesData), {
				predicate: lang.hitch(this, this._chkIsDataFromLayerActivities)
			});

			this._emitEvt('REQUEST', {
				target: this.layerTarget,
				action: '_search',
				method: 'POST',
				query: {
					terms: {
						activities: [this.pathVariableId]
					}
				},
				requesterId: this.getChannel()
			});
		},

		_chkIsDataFromLayerActivities: function(resWrapper) {

			var target = resWrapper.target,
				query = resWrapper.req.query || {},
				terms = query.terms || {},
				activities = terms.activities;

			return target === this.layerTarget && activities && activities.indexOf(this.pathVariableId) !== -1;
		},

		_onLayerActivitiesData: function(resWrapper) {

			var data = resWrapper.res.data,
				layers = data.data || [];

			this._emitEvt('INJECT_DATA', {
				target: this.templateTargetChange,
				data: layers
			});

			this._activityLayers = {};

			for (var i = 0; i < layers.length; i++) {
				var layer = layers[i];
				this._createLayer(layer);

				if (i === 0) {
					this._addMapLayer(layer.id);
				}
			}
		},

		_createLayer: function(layer) {

			var layerDefinition = this._getAtlasLayerDefinition(),
				layerConfiguration = this._getAtlasLayerConfiguration(layer);

			layerConfiguration = this._merge([layerConfiguration, {
				mapChannel: this.map.getChannel(),
				selectorChannel: this.getChannel()
			}]);

			var mapLayerInstance = new layerDefinition(layerConfiguration),
				mapLayerId = this._getAtlasLayerId(layer);

			this._activityLayers[mapLayerId] = mapLayerInstance;
		}
	});
});
