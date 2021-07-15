define([
	"app/designs/base/_Main"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/map/OpenLayers"
	, "redmic/modules/map/LeafletImpl"
	, "redmic/modules/map/Map"
	, "redmic/modules/map/layer/WmsLayerImpl"
	, "RWidgets/RedmicUtilities"
	, "templates/ServiceOGCTitle"
	, "templates/ServiceOGCInfo"
	, "templates/ServiceOGCImage"
	, "./_DetailsBase"
], function(
	_Main
	, redmicConfig
	, declare
	, lang
	, OpenLayers
	, LeafletImpl
	, Map
	, WmsLayerImpl
	, RedmicUtilities
	, TemplateTitle
	, TemplateInfo
	, TemplateImage
	, _DetailsBase
) {

	return declare([_DetailsBase], {
		//	summary:
		//		Vista detalle de servicios OGC.

		constructor: function(args) {

			this.atlasTarget = redmicConfig.services.atlasLayer;
			this.activityTarget = redmicConfig.services.activity;
			this.target = this.atlasTarget;
			this.selectionTarget = redmicConfig.services.atlasLayerSelection;

			this.activityLocalTarget = "activitiesLayer";
			this.infoLayerTarget = 'infoLayerTarget';

			this.config = {
				templateTitle: TemplateTitle,
				templateInfo: TemplateInfo
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.inherited(arguments);

			this.target.push(this.activityTarget);

			this.widgetConfigs = this._merge([
				this.widgetConfigs || {},
				{
				info: {
					props: {
						target: this.infoLayerTarget
					}
				},
				activityList: {
					height: 3,
					props: {
						title: this.i18n.dataSource,
						target: this.activityLocalTarget
					}
				},
				spatialExtensionMap: {
					width: 3,
					height: 3,
					type: declare([LeafletImpl, Map]),
					props: {
						title: this.i18n.geograficFrame,
						omitContainerSizeCheck: true,
						maxZoom: 15,
						coordinatesViewer: false,
						navBar: false,
						miniMap: false,
						scaleBar: false,
						measureTools: false
					}
				}/*,
				legend: {
					width: 3,
					height: 6,
					type: TemplateDisplayer,
					props: {
						title: this.i18n.legend,
						template: TemplateImage,
						"class": "imageContainer",
						target: this.atlasTarget,
						associatedIds: [this.ownChannel]
					}
				}*/
			}]);
		},

		_publishMapBox: function(action, obj) {

			this._publish(this._getWidgetInstance('spatialExtensionMap').getChannel(action), obj);
		},

		_clearModules: function() {

			this.inherited(arguments);

			this._publish(this._getWidgetInstance('activityList').getChannel("CLEAR"));

			if (this.layerPolygon) {
				this._publishMapBox("REMOVE_LAYER", {
					layer: this.layerPolygon
				});
			}

			if (this.layer) {
				this._publishMapBox("REMOVE_LAYER", {
					layer: this.layer
				});

				this._publish(this.layer.getChannel("DESTROY"));
			}
		},

		_refreshModules: function() {

			this._checkPathVariableId();

			this._emitEvt('GET', {
				target: this.atlasTarget,
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});
		},

		_itemAvailable: function(response, resObj) {

			var target = resObj.target,
				data = response.data;

			if (target === this.activityTarget) {
				this._handleActivityItemAvailable(data);
			} else {
				this._handleAtlasItemAvailable(data);
			}
		},

		_handleAtlasItemAvailable: function(data) {

			this._emitEvt('INJECT_ITEM', {
				data: data,
				target: this.infoLayerTarget
			});

			this._createMapBoundingLayer(data);
			this._retrieveLayerActivities(data);
			this._createMapLayer(data);
		},

		_createMapBoundingLayer: function(data) {

			if (data && data.geometry && data.geometry.coordinates) {
				this._addPolygon(data.geometry);
			}
		},

		_addPolygon: function(geometry) {

			this.layerPolygon = L.geoJson(geometry, {
				style: {
					color: 'red',
					fillOpacity: 0
				}
			});

			this._publishMapBox("ADD_LAYER", {
				layer: this.layerPolygon,
				layerId: "boundingBox",
				layerLabel: this.i18n.boundingBox,
				optional: true
			});

			this._publishMapBox('FIT_BOUNDS', {
				bounds: this.layerPolygon.getBounds()
			});
		},

		_retrieveLayerActivities: function(data) {

			var activities = data.activities;

			if (!activities || !activities.length) {
				return;
			}

			for (var i = 0; i < activities.length; i++) {
				var activity = activities[i];
				this._publish(this._buildChannel(this.storeChannel, this.actions.GET), {
					target: this.activityTarget,
					id: activity[this.idProperty]
				});
			}
		},

		_createMapLayer: function(data) {

			if (!data.urlSource || !data.name) {
				return;
			}

			this.layer = new WmsLayerImpl({
				parentChannel: this.getChannel(),
				mapChannel: this._getWidgetInstance('spatialExtensionMap').getChannel(),
				layer: OpenLayers.build({
					type: "wms",
					url: data.urlSource,
					props: {
						layers: [data.name],
						format: "image/png",
						transparent: true,
						tiled: true
					}
				})
			});

			this._publishMapBox("ADD_LAYER", {
				layer: this.layer
			});
		},

		_handleActivityItemAvailable: function(activity) {

			activity.rank = RedmicUtilities.getActivityRankByPath(activity.path);

			this._emitEvt('INJECT_ITEM', {
				data: activity,
				target: this.activityLocalTarget
			});
		}
	});
});
