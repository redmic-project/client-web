define([
	'app/designs/list/Controller'
	, 'app/designs/list/layout/Layout'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'node-uuid/uuid'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/base/_Store'
	, 'redmic/modules/model/ModelImpl'
	, 'templates/GenericViewerLayerList'
], function(
	ListController
	, ListLayout
	, redmicConfig
	, declare
	, lang
	, uuid
	, _Module
	, _Show
	, _Store
	, ModelImpl
	, listTemplate
){
	return declare([_Module, _Show, _Store], {
		//	summary:
		//		Gestor de capas de mapa.

		constructor: function (args) {

			this.config = {
				ownChannel: 'layersManager',
				'class': 'fHeight',
				_listTarget: 'layersManager',
				_modelInstances: {},
				_layerInstances: {},
				_layersByActivity: {},

				events: {
					ADD_LAYER: "addLayer",
					REMOVE_LAYER: "removeLayer"
				},

				actions: {
					CHANGE_TO_SECONDARY: "changeToSecondary"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.layersBrowserConfig = this._merge([{
				parentChannel: this.getChannel(),
				'class': 'fHeight',
				title: this.i18n.layers,
				target: this._listTarget,
				browserConfig: {
					idProperty: "uuid",
					template: listTemplate,
					rowConfig: {
						buttonsConfig: {
							listButton: []
						}
					},
					optionsRowConfig: {
						items: [{
							icon: "fa-toggle-off",
							altIcon: "fa-toggle-on",
							label: "toggleLayer",
							callback: "toggleLayer",
							state: false
						}/*,{
							icon: "fa-toggle-off",
							altIcon: "fa-toggle-on",
							label: "timeLayer",
							callback: "timeLayer",
							state: false
						}*/,{
							icon: "fa-gears",
							label: "configLayer",
							callback: "configLayer"
						}/*,{
							icon: "fa-bullseye",
							label: "centerMap",
							callback: "centerMap"
						},{
							icon: "fa-copy",
							label: "duplicateLayer",
							callback: "duplicateLayer"
						}*/,{
							icon: "fa-trash-o",
							label: "removeLayer",
							callback: "removeLayer"
						}]
					}
				}
			}, this.layersBrowserConfig || {}]);

			this.layerModelConfig = this._merge([{
				parentChannel: this.getChannel(),
				schema: {
					"$schema": "http://json-schema.org/draft-04/schema#",
					"title": "Metadata Query DTO",
					"type": "object",
					"properties": {
						"layerType": {
							"type": ["string", "null"]
						},
						"parentId": {
							"type": ["integer", "null"]
						},
						"status": {
							"type": ["object", "null"],
							"additionalProperties": true
						},
						"filter": {
							"type": ["object", "null"],
							"additionalProperties": true
						},
						"style": {
							"type": ["object", "null"],
							"additionalProperties": true
						}
					}
				}
			}, this.layerModelConfig || {}]);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.layersBrowser.getChildChannel('browser', 'BUTTON_EVENT'),
				callback: "_subLayersBrowserButtonEvent"
			});
		},

		_definePublications: function () {

			this.publicationsConfig.push({
				event: 'ADD_LAYER',
				channel: this.getMapChannel('ADD_LAYER')
			},{
				event: 'REMOVE_LAYER',
				channel: this.getMapChannel('REMOVE_LAYER')
			});
		},

		_initialize: function() {

			if (!this.getMapChannel) {
				console.error('Map channel is not available');
			}

			this.layersBrowser = new declare([ListLayout, ListController])(this.layersBrowserConfig);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.layersBrowser.getChannel('SHOW'), {
				node: this.domNode
			});
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_onActivitiesPropSet: function(changeObj) {

			var prevActivityIds = Object.keys(this._layersByActivity),
				i;

			for (i = 0; i < this.activities.length; i++) {
				this._evaluateActivity({
					activity: this.activities[i],
					prevActivityIds: prevActivityIds
				});
			}

			for (i = 0; i < prevActivityIds.length; i++) {
				this._removeActivityElements(prevActivityIds[i]);
			}
		},

		_evaluateActivity: function(args) {

			var activity = args.activity,
				prevActivityIds = args.prevActivityIds,
				activityId = activity.id,
				activityCategory = activity.activityCategory,
				configSet = this.viewerConfigByActivityCategory[activityCategory],
				prevIndex = prevActivityIds.indexOf(activityId.toString());

			if (prevIndex !== -1) {
				prevActivityIds.splice(prevIndex, 1);
			}

			if (!configSet) {
				console.error('Activity category "%s" is not defined', activityCategory);
				return;
			}

			if (this._layersByActivity[activityId]) {
				return;
			}

			this._createActivityElements({
				configSet: configSet,
				activity: activity
			});
		},

		_createActivityElements: function(config) {

			var configSet = config.configSet,
				userConfig = configSet.map['default'],
				activity = config.activity,
				activityId = activity.id,

				modelInstance = this._createModelInstance({
					userConfig: userConfig,
					activityId: activityId
				});

			this._once(modelInstance.getChannel('GOT_MODEL_UUID'), lang.hitch(this, this._onGotModelUuid, {
				modelInstance: modelInstance,
				configSet: configSet,
				userConfig: userConfig,
				activityId: activityId,
				activity: activity
			}));

			this._publish(modelInstance.getChannel('GET_MODEL_UUID'));
		},

		_createModelInstance: function(args) {

			var userConfig = args.userConfig,
				activityId = args.activityId,

				value = this._merge([userConfig, { parentId: activityId }]),
				modelInstance = new ModelImpl(this.layerModelConfig);

			this._publish(modelInstance.getChannel('DESERIALIZE'), {
				data: value,
				toInitValues: true
			});

			return modelInstance;
		},

		_onGotModelUuid: function(args, res) {

			var layerUuid = res.uuid,
				modelInstance = args.modelInstance,
				configSet = args.configSet,
				userConfig = args.userConfig,
				activityId = args.activityId,
				activity = args.activity;

			this._modelInstances[layerUuid] = modelInstance;

			this._addLayerItemToList(layerUuid, activity);

			this._once(modelInstance.getChannel('SERIALIZED'), lang.hitch(this, this._onModelSerialized, {
				layerUuid: layerUuid,
				configSet: configSet,
				activityId: activityId
			}));

			this._publish(modelInstance.getChannel('SERIALIZE'));
		},

		_onModelSerialized: function(args, res) {

			var userConfig = res.data,
				layerUuid = args.layerUuid,
				configSet = args.configSet;

			this._layerInstances[layerUuid] = this._createLayerInstance(userConfig, configSet);

			this._createLayerIndex({
				layerUuid: layerUuid,
				activityId: userConfig.parentId
			});
		},

		_createLayerInstance: function(userConfig, configSet) {

			var activityId = userConfig.parentId,
				mapConfig = configSet.map,
				layerType = this._getLayerType(mapConfig, userConfig);

			if (!mapConfig) {
				console.error('Map configuration is not available');
				return;
			}

			var layerConfig = mapConfig.layer[layerType];
			if (!layerConfig) {
				console.error('Layer "%s" configuration is not available', layerType);
				return;
			}

			var definition = this._getLayerDefinition(mapConfig, layerType),
				props = this._getLayerProps(layerConfig, activityId),
				layerInstance = new definition(props);

			return layerInstance;
		},

		_getLayerType: function(mapConfig, userConfig) {

			var layerType = userConfig.layerType;

			if (!layerType) {
				var mapLayerConfig = mapConfig.layer;
				layerType = Object.keys(mapLayerConfig)[0];
			}

			return layerType;
		},

		_getLayerConfig: function(configSet, userConfig) {

			var mapConfig = configSet.map,
				mapLayerConfig = mapConfig.layer;

			if (!mapLayerConfig) {
				console.error('Layer configuration is not available');
				return;
			}

			var layerType = userConfig.layerType || Object.keys(mapLayerConfig)[0];

			return mapLayerConfig[layerType];
		},

		_getLayerDefinition: function(mapConfig, layerType) {

			var mapLayerConfig = mapConfig.layer,
				layerTypeName = layerType || Object.keys(mapLayerConfig)[0],
				definitions = mapConfig.layerDefinition;

			return definitions[layerTypeName];
		},

		_getLayerProps: function(layerConfig, activityId) {

			var configProps = layerConfig.props,
				configTarget = layerConfig.target,

				target = lang.replace(configTarget, { id: activityId }),
				props = {
					parentChannel: this.getChannel(),
					mapChannel: this.getMapChannel(),
					target: target
				};

			lang.mixin(props, configProps);

			return props;
		},

		_addLayerItemToList: function(layerUuid, activity) {

			this._emitEvt('INJECT_ITEM', {
				data: {
					uuid: layerUuid,
					activity: activity,
					label: activity.name
				},
				target: this._listTarget
			});
		},

		_createLayerIndex: function(args) {

			var activityId = args.activityId,
				layerUuid = args.layerUuid;

			if (!this._layersByActivity[activityId]) {
				this._layersByActivity[activityId] = {};
			}

			this._layersByActivity[activityId][layerUuid] = true;
		},

		_subLayersBrowserButtonEvent: function(obj) {

			var btnId = obj.btnId,
				callback = '_' + btnId + 'Callback';

			this[callback] && this[callback](obj);
		},

		_configLayerCallback: function(obj) {

			var layerUuid = obj.uuid,
				modelInstance = this._modelInstances[layerUuid];

			this._once(modelInstance.getChannel("SERIALIZED"), lang.hitch(this, this._onModelSerializedByConfigLayer, obj));

			this._publish(modelInstance.getChannel("SERIALIZE"));
		},

		_onModelSerializedByConfigLayer: function(obj, res) {

			var item = obj.item,
				title = item.label,
				layerUuid = obj.uuid,
				activityCategory = item.activity.activityCategory,
				data = res.data;

			this._publish(this.getParentChannel("CHANGE_TO_SECONDARY"), {
				primaryData: {
					filterChannel: this._layerInstances[layerUuid].filter.getChannel(),
					modelLayerChannel: this._modelInstances[layerUuid].getChannel(),
					configActivity: this.viewerConfigByActivityCategory[activityCategory],
					dataModel: {
						layerType: data.layerType,
						style: data.style
					}
				},
				title: title,
				source: 'layers'
			});
		},

		_toggleLayerCallback: function(obj) {

			var item = obj.item,
				state = obj.state;

			if (!state) {
				this._deactivateLayer(item);
			} else {
				this._activateLayer(item);
			}
		},

		_deactivateLayer: function(/*Object*/ item) {

			if (!item || !item.uuid)
				return;

			var layerUuid = item.uuid,
				layer = this._layerInstances[layerUuid];

			if (layer) {
				this._emitEvt('REMOVE_LAYER', {
					layer: layer,
					keepInstance: true
				});
			}
		},

		_activateLayer: function(/*Object*/ item) {

			if (!item || !item.uuid)
				return;

			var layerUuid = item.uuid,
				layer = this._layerInstances[layerUuid];

			if (layer) {
				this._emitEvt('ADD_LAYER', {
					layer: layer
				});

				this._publish(layer.getChannel('REFRESH'));
			}
		},

		_removeActivityElements: function(activityId) {

			var elements = this._layersByActivity[activityId];

			for (var key in elements) {
				this._removeElement(key, activityId);
			}

			delete this._layersByActivity[activityId];
		},

		_removeElement: function(layerUuid, activityId) {

			this._removeLayer(layerUuid, activityId);

			this._removeLayerItemToList(layerUuid);

			delete this._layerInstances[layerUuid];

			delete this._layersByActivity[activityId][layerUuid];
		},

		_removeLayerCallback: function(obj) {

			var layerUuid = obj.uuid,
				activityId = obj.item.activity.id;

			this._removeElement(layerUuid, activityId);
		},

		_removeLayer: function(layerUuid, activityId) {

			var layer = this._layerInstances[layerUuid];

			this._emitEvt('REMOVE_LAYER', {
				layer: layer
			});

			this._once(layer.getChannel('DISCONNECTED'), lang.hitch(this, function(layer, res) {

				layer.destroy();
			}, layer));

			this._publish(layer.getChannel('DISCONNECT'));
		},

		_removeLayerItemToList: function(layerUuid) {

			this._publish(this.layersBrowser.getChildChannel('browser', 'REMOVE_ITEM'), {
				idProperty: layerUuid
			});
		}
	});
});
