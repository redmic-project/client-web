define([
	"app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddTitle"
	, "app/designs/details/_TitleSelection"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/map/OpenLayers"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/browser/bars/Total"
	, "redmic/modules/map/LeafletImpl"
	, "redmic/modules/map/Map"
	, "redmic/modules/map/layer/WmsLayerImpl"
	, "redmic/modules/layout/TabsDisplayer"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "RWidgets/RedmicUtilities"
	, "templates/ServiceOGCTitle"
	, "templates/ServiceOGCInfo"
	, "templates/ServiceOGCImage"
	, "templates/ServiceOGCActivityList"
], function(
	_Main
	, Controller
	, Layout
	, _AddTitle
	, _TitleSelection
	, redmicConfig
	, declare
	, lang
	, OpenLayers
	, _ButtonsInRow
	, _Framework
	, ListImpl
	, Total
	, LeafletImpl
	, Map
	, WmsLayerImpl
	, TabsDisplayer
	, TemplateDisplayer
	, RedmicUtilities
	, TemplateTitle
	, TemplateInfo
	, TemplateImage
	, TemplateActivities
){
	return declare([Layout, Controller, _Main, _AddTitle, _TitleSelection], {
		//	summary:
		//		Vista detalle de Activity.

		constructor: function(args) {

			this.atlasTarget = redmicConfig.services.atlasLayer;
			this.activityTarget = redmicConfig.services.activity;
			this.target = [this.atlasTarget, this.activityTarget];

			this.activityLocalTarget = "activitiesLayer";
			this.infoLayerTarget = 'infoLayerTarget';

			this.config = {
				noScroll: true,
				_titleRightButtonsList: []
			};

			this.titleRightButtonsList = [];

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.titleWidgetConfig = this._merge([{
				template: TemplateTitle
			}, this.titleWidgetConfig || {}]);

			this.widgetConfigs = this._merge([{
				info: {
					width: 3,
					height: 6,
					type: TemplateDisplayer,
					props: {
						title: this.i18n.info,
						template: TemplateInfo,
						"class": "containerDetails",
						classEmptyTemplate: "contentListNoData",
						target: this.infoLayerTarget,
						associatedIds: [this.ownChannel]
					}
				},
				additionalInfo: {
					width: 3,
					height: 6,
					type: TabsDisplayer,
					props: {
						title: this.i18n.additionalInfo,
						childTabs: [{
							title: this.i18n.dataSource,
							type: declare([ListImpl, _Framework, _ButtonsInRow]),
							props: {
								target: this.activityLocalTarget,
								template: TemplateActivities,
								bars: [{
									instance: Total
								}],
								rowConfig: {
									buttonsConfig: {
										listButton: [{
											icon: "fa-info-circle",
											btnId: "details",
											title: this.i18n.info,
											href: this.viewPathsWidgets.activities
										}]
									}
								}
							}
						},/*{
							title: this.i18n.legend,
							type: TemplateDisplayer,
							props: {
								template: TemplateImage,
								"class": "imageContainer",
								target: this.atlasTarget,
								associatedIds: [this.ownChannel]
							}
						},*/
						{
							title: this.i18n.geograficFrame,
							type: declare([LeafletImpl, Map]),
							props: {
								zoom: 5,
								extent: [28.5, -17.0]
							}
						}]
					}
				}
			}, this.widgetConfigs || {}]);
		},

		_publishMapBox: function(action, obj) {

			this._publish(this._widgets.additionalInfo.getChildChannel("childInstances.1", action), obj);
		},

		_clearModules: function() {

			this._publish(this._widgets.info.getChannel("CLEAR"));
			this._publish(this._widgets.additionalInfo.getChildChannel("childInstances.0", "CLEAR"));

			if (this.layerPolygon) {
				this._publishMapBox("REMOVE_LAYER", {
					layer: this.layerPolygon
				});
			}

			if (this.layer) {
				this._publishMapBox("REMOVE_LAYER", {
					layer: this.layer
				});

				this._publish(this.layer.getChannel("DISCONNECT"));

				this.layer.destroy();
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
				mapChannel: this._widgets.additionalInfo.getChildChannel("childInstances.1"),
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
