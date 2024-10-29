define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/atlas/_AtlasLayersManagement'
	, 'src/redmicConfig'
	, 'templates/ServiceOGCAtlasList'
], function(
	declare
	, lang
	, _AtlasLayersManagement
	, redmicConfig
	, ActivityLayersList
) {

	return declare(_AtlasLayersManagement, {
		//	summary:
		//		Extensión para el manejo de los datos de servicios OGC vinculados a actividades, permitiendo generar
		//		capas para el mapa y su control.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.atlasLayer,
				templateTargetChange: 'activityLayers',
				_activityLayers: {}
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.browserConfig = this._merge([{
				template: ActivityLayersList,
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
			}, this.browserConfig || {}], {
				arrayMergingStrategy: 'concatenate'
			});

			this.inherited(arguments);
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel : this.browser.getChannel('BUTTON_EVENT'),
				callback: "_subActivityLayersListButtonEvent"
			});
		},

		_refreshModules: function() {

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
				this._addMapLayer(obj.id, obj);
			} else {
				this._removeMapLayer(obj.id);
			}
		},

		_updateToggleShowLayerButton: function(layerId, action) {

			this._publish(this.browser.getChannel(action), {
				idProperty: layerId,
				btnId: 'toggleShowLayer'
			});
		},

		_addMapLayer: function(layerId, layerItem) {

			this._updateToggleShowLayerButton(layerId, 'CHANGE_ROW_BUTTON_TO_MAIN_CLASS');

			var layerInstance = this._activityLayers[layerId];

			this._publish(this.map.getChannel('ADD_LAYER'), {
				layer: layerInstance,
				atlasItem: layerItem
			});
		},

		_removeMapLayer: function(layerId) {

			this._updateToggleShowLayerButton(layerId, 'CHANGE_ROW_BUTTON_TO_ALT_CLASS');

			var layerInstance = this._activityLayers[layerId];

			this._publish(this.map.getChannel('REMOVE_LAYER'), {
				layer: layerInstance
			});
		},

		_onActivityLayersData: function(res) {

			var layersData = this._getDataToAddToBrowser(res);

			this._emitEvt('INJECT_DATA', {
				data: layersData,
				target: this._activityLayersTarget
			});

			this._activityLayers = {};

			layersData.forEach(lang.hitch(this, this._processActivityLayerItem));
		},

		_getDataToAddToBrowser: function(res) {

			return res.data.data;
		},

		_processActivityLayerItem: function(element, index) {

			this._createLayer(element);

			if (index === 0) {
				this._addMapLayer(element.id, element);
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
