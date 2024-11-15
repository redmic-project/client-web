define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/dom-class'
	, 'src/component/layout/TagList'
], function(
	declare
	, lang
	, domClass
	, TagList
) {

	return declare(null, {
		//	summary:
		//		Gestión de dimensión de elevación de capas para el módulo Atlas.

		constructor: function(args) {

			this.config = {
				_elevationTagsContainerClass: 'tagListBottomContentContainer',
				_elevationTagListByLayerId: {},
				_elevationShownByLayerId: {}
			};

			lang.mixin(this, this.config, args);
		},

		_removeElevationOfRemovedLayer: function(layerId) {

			this._hideLayerElevationTagList(layerId);
		},

		_showLayerElevation: function(browserButtonObj) {

			var container = browserButtonObj.node,
				elevationContainer = container.children[1],
				atlasLayerItem = browserButtonObj.item,
				item = atlasLayerItem.atlasItem,
				layerId = atlasLayerItem.mapLayerId,
				elevationTagListInstance = this._getLayerElevationTagList(layerId, item),
				elevationShown = this._elevationShownByLayerId[layerId] || false;

			if (!elevationShown) {
				this._showLayerElevationTagList(elevationTagListInstance, elevationContainer);
				this._elevationShownByLayerId[layerId] = true;
			} else {
				this._hideLayerElevationTagList(layerId);
				this._elevationShownByLayerId[layerId] = false;
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
		}
	});
});
