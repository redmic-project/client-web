define([
	"app/base/views/extensions/_LocalSelectionView"
	, "app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddTitle"
	, "app/designs/details/_TitleSelection"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "redmic/modules/map/layer/PruneClusterLayerImpl"
	, "redmic/modules/map/layer/_AddFilter"
	, "redmic/modules/map/layer/_ListenBounds"
	, "redmic/modules/map/layer/_ListenZoom"
	, "redmic/modules/map/layer/_RadiusOnClick"
	, "redmic/modules/map/LeafletImpl"
	, "redmic/modules/map/Map"
	, "redmic/modules/map/_PlaceNamesButton"
	, "templates/SpeciesTitle"
	, "templates/SpeciesDistributionPopup"
	, "templates/TrackingSecondaryList"
], function(
	_LocalSelectionView
	, _Main
	, Controller
	, Layout
	, _AddTitle
	, _TitleSelection
	, redmicConfig
	, declare
	, lang
	, Deferred
	, PruneClusterLayerImpl
	, _AddFilter
	, _ListenBounds
	, _ListenZoom
	, _RadiusOnClick
	, LeafletImpl
	, Map
	, _PlaceNamesButton
	, TemplateTitle
	, citationTemplate
	, pointTrackingTemplate
) {

	return declare([Layout, Controller, _Main, _AddTitle, _TitleSelection, _LocalSelectionView], {
		//	summary:
		//		Vista detalle de localización de especies.

		constructor: function(args) {

			this.target = redmicConfig.services.species;

			this.config = {
				_titleRightButtonsList: [],
				idProperty: "uuid",
				propsWidget: {
					omitTitleBar: true,
					resizable: false
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.titleWidgetConfig = this._merge([{
				template: TemplateTitle
			}, this.titleWidgetConfig || {}]);

			this.widgetConfigs = this._merge([{
				map: {
					width: 6,
					height: 6,
					type: declare([LeafletImpl, Map, _PlaceNamesButton]),
					props: {
						title: this.i18n.map,
						omitContainerSizeCheck: true
					}
				}
			}, this.widgetConfigs || {}]);
		},

		_initialize: function() {

			this._pruneClusterLayerDefinition = declare(declare([PruneClusterLayerImpl, _AddFilter, _RadiusOnClick])
				.extend(_ListenBounds)).extend(_ListenZoom);
		},

		_afterShow: function(request) {

			var widgetInstance = this._getWidgetInstance('map');

			if (!widgetInstance) {
				return;
			}

			if (!this.pruneClusterLayer) {
				this.pruneClusterLayer = new this._pruneClusterLayerDefinition({
					parentChannel: this.getChannel(),
					mapChannel: widgetInstance.getChannel(),
					selectorChannel: this.getChannel(),
					categoryStyle: "bubbles",
					getPopupContent: this._getPopupContent,
					filterConfig: {
						initQuery: {
							returnFields: ["geometry", "id", "uuid", "properties.collect.radius"]
						}
					},
					idProperty: this.idProperty,
					getMarkerCategory: function(feature) {
						if (feature._meta.category && feature._meta.category == 'ci') {
							return 0;
						} else {
							return 1;
						}
					}
				});

				this._publish(widgetInstance.getChannel("ADD_LAYER"), this.pruneClusterLayer);
			}
		},

		_clearModules: function() { },

		_refreshModules: function() {

			this._checkPathVariableId();

			this._emitEvt('GET', {
				target: this.target,
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});

			this._refreshChildrenDataModules();
		},

		_refreshChildrenDataModules: function() {

			this.pruneClusterLayer && this._publish(this.pruneClusterLayer.getChannel("CHANGE_TARGET"), {
				target: lang.replace(redmicConfig.services.speciesLocation, {id: this.pathVariableId})
			});
		},

		_getPopupContent: function(data) {

			var templatePopup,
				targetPopup,
				obj = {
					i18n: this.i18n
				};

			if (data.category === 0) {
				templatePopup = citationTemplate;
				targetPopup = redmicConfig.services.citationAll;
			} else {
				templatePopup = pointTrackingTemplate;
				targetPopup = redmicConfig.services.animalTracking;
			}

			var dfd = new Deferred(),
				parseData = function(resWrapper) {

					var feature = resWrapper.res.data;

					if (data.category === 0) {
						obj.feature = feature;

						if (obj.feature.properties.activityId) {
							this._once(this._buildChannel(this.storeChannel, this.actions.ITEM_AVAILABLE),
								lang.hitch(this, parseDataActivity));

							this._emitEvt('GET', {
								target: redmicConfig.services.activity,
								requesterId: this.getOwnChannel(),
								id: obj.feature.properties.activityId
							});
							return;
						}
					} else {
						obj.data = feature;
						obj.shownOption = {animal: true};
					}

					dfd.resolve(templatePopup(obj));
				},
				parseDataActivity = function(resWrapper) {

					var dataActivity = resWrapper.res.data;

					obj.feature.properties.activity = dataActivity;

					dfd.resolve(templatePopup(obj));
				};

			this._once(this._buildChannel(this.storeChannel, this.actions.ITEM_AVAILABLE), lang.hitch(this, parseData));

			this._emitEvt('GET', {
				target: targetPopup,
				requesterId: this.getOwnChannel(),
				id: data[this.idProperty]
			});

			return dfd;
		}
	});
});
