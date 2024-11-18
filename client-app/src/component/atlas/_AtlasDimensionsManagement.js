define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'dojo/dom-class'
	, 'src/component/layout/TagList'
], function(
	declare
	, lang
	, aspect
	, domClass
	, TagList
) {

	return declare(null, {
		//	summary:
		//		Gestión de dimensiones de capas (como tiempo y elevación) para el módulo Atlas.

		constructor: function(args) {

			this.config = {
				_elevationTagsContainerClass: 'tagListBottomContentContainer',
				_elevationTagListByLayerId: {},
				_elevationShownByLayerId: {}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_deactivateLayer', lang.hitch(this, this._atlasDimensionsDeactivateLayer));
			aspect.before(this, '_cleanRowSecondaryContainer', lang.hitch(this,
				this._atlasDimensionsCleanRowSecondaryContainer));
		},

		_getAtlasLayerDimensions: function(atlasItem) {

			var dimensions = {};

			var time = atlasItem.timeDefinition || atlasItem.timeDimension,
				elevation = atlasItem.elevationDimension;

			if (time) {
				dimensions.time = time;
			}

			if (elevation) {
				dimensions.elevation = elevation;
			}

			return dimensions;
		},

		_removeElevationOfRemovedLayer: function(layerId) {

			this._hideLayerElevationTagList(layerId);
		},

		_showLayerElevation: function(browserButtonObj) {

			var atlasLayerItem = browserButtonObj.item,
				layerId = atlasLayerItem.mapLayerId;

			if (!this._activeLayers[layerId]) {
				this._emitEvt('COMMUNICATION', {
					description: this.i18n.addLayerFirst
				});

				return;
			}

			var container = browserButtonObj.node,
				elevationContainer = container.children[1],
				item = atlasLayerItem.atlasItem,
				elevationTagListInstance = this._getLayerElevationTagList(layerId, item),
				elevationShown = this._elevationShownByLayerId[layerId] || false;

			if (!elevationShown) {
				this._cleanRowSecondaryContainer(layerId, elevationContainer);
				this._showLayerElevationTagList(elevationTagListInstance, elevationContainer);
				this._elevationShownByLayerId[layerId] = true;
			} else {
				this._hideLayerElevationTagList(layerId);
			}
		},

		_getLayerElevationTagList: function(layerId, item) {

			if (this._elevationTagListByLayerId[layerId]) {
				return this._elevationTagListByLayerId[layerId];
			}

			var elevationDefinition = item.elevationDimension;

			var instance = new TagList({
				parentChannel: this.getChannel(),
				tagsString: elevationDefinition.value,
				simpleSelection: true,
				getSelectedTags: function(_tagValue, tagIndex) {

					return tagIndex === 0;
				},
				getTagLabel: lang.partial(function(unit, tagValue) {

					return tagValue + ' ' + unit;
				}, elevationDefinition.unitSymbol)
			});

			this._subscribe(instance.getChannel('TAG_CLICKED'), lang.hitch(this, this._onElevationTagClicked, layerId));

			this._elevationTagListByLayerId[layerId] = instance;

			return instance;
		},

		_showLayerElevationTagList: function(elevationInstance, elevationContainer) {

			domClass.add(elevationContainer, this._elevationTagsContainerClass);

			this._once(elevationInstance.getChannel('HIDDEN'), lang.hitch(this, function(container) {

				domClass.remove(container, this._elevationTagsContainerClass);
			}, elevationContainer));

			this._publish(elevationInstance.getChannel('SHOW'), {
				node: elevationContainer
			});
		},

		_hideLayerElevationTagList: function(layerId) {

			var elevationTagListInstance = this._elevationTagListByLayerId[layerId];

			if (!elevationTagListInstance) {
				return;
			}

			this._publish(elevationTagListInstance.getChannel('HIDE'));
			this._elevationShownByLayerId[layerId] = false;
		},

		_onElevationTagClicked: function(layerId, res) {

			var layerInstance = this._layerInstances[layerId];

			if (!layerInstance) {
				return;
			}

			this._publish(layerInstance.getChannel('SET_LAYER_DIMENSION'), {
				elevation: {
					value: res.value,
					label: res.label
				}
			});
		},

		_atlasDimensionsDeactivateLayer: function(atlasLayerItem) {

			if (!atlasLayerItem) {
				return;
			}

			var mapLayerId = atlasLayerItem.mapLayerId;

			if (!this._elevationShownByLayerId[mapLayerId]) {
				return;
			}

			this._hideLayerElevationTagList(mapLayerId);
		},

		_atlasDimensionsCleanRowSecondaryContainer: function(mapLayerId) {

			if (this._elevationShownByLayerId[mapLayerId]) {
				this._hideLayerElevationTagList(mapLayerId);
			}
		}
	});
});
