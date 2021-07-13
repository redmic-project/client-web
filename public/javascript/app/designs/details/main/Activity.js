define([
	"app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/map/_ImportWkt"
	, "redmic/modules/map/LeafletImpl"
	, "redmic/modules/map/Map"
	, "templates/ActivityInfo"
	, "./_ActivityBase"
], function(
	redmicConfig
	, declare
	, lang
	, _ImportWkt
	, LeafletImpl
	, Map
	, TemplateInfo
	, _ActivityBase
) {

	return declare([_ActivityBase], {
		//	summary:
		//		Vista detalle de Activity.

		constructor: function(args) {

			this.target = redmicConfig.services.activity;
			this.reportService = "activity";
			this.ancestorsTarget = redmicConfig.services.activityAncestors;

			this.infoTarget = "infoWidgetTarget";
		},

		_setMainConfigurations: function() {

			this.widgetConfigs = this._merge([{
				info: this._infoConfig({
					height: 5,
					template: TemplateInfo
				}),
				spatialExtensionMap: {
					width: 3,
					height: 2,
					hidden: true,
					type: declare([LeafletImpl, _ImportWkt, Map]),
					props: {
						title: this.i18n.spatialExtension,
						omitContainerSizeCheck: true,
						maxZoom: 15,
						coordinatesViewer: false,
						navBar: false,
						miniMap: false,
						scaleBar: false,
						measureTools: false
					}
				},
				organisationList: this._organisationsConfig(),
				platformList: this._platformsConfig(),
				contactList: this._contactsConfig(),
				documentList: this._documentsConfig()
			}, this.widgetConfigs || {}]);
		},

		_setMainOwnCallbacksForEvents: function() {

			this._onEvt('ME_OR_ANCESTOR_HIDDEN', lang.hitch(this, this._onActivityDetailsHidden));
		},

		_refreshModules: function() {

			this.inherited(arguments);
		},

		_itemAvailable: function(res) {

			var path = res.data.path,
				ancestorsTarget = lang.replace(this.ancestorsTarget, { path: path });

			this._activityData = res.data;
			this._originalTarget = this.target;
			this.target = ancestorsTarget;

			this._emitEvt('INJECT_DATA', {
				data: this._activityData,
				target: this.infoTarget
			});

			this._emitEvt('REQUEST', {
				method: "POST",
				target: ancestorsTarget,
				action: '_search',
				query: {
					returnFields: ['id', 'path', 'name']
				}
			});

			this._prepareSpatialExtension();

			this.inherited(arguments);
		},

		_dataAvailable: function(res) {

			this.target = this._originalTarget;

			var data = res.data,
				ancestors = data.data;

			this._activityData.ancestors = ancestors;

			this._emitEvt('INJECT_DATA', {
				data: this._activityData,
				target: this.infoTarget
			});
		},

		_prepareSpatialExtension: function() {

			var wkt = this._activityData.spatialExtension;
			if (!wkt) {
				return;
			}

			var mapInstance = this._getWidgetInstance('spatialExtensionMap');
			this._once(mapInstance.getChannel('BBOX_CHANGED'), lang.hitch(this, this._showSpatialExtension, wkt));

			this._showWidget('spatialExtensionMap');
		},

		_showSpatialExtension: function(wkt) {

			var mapInstance = this._getWidgetInstance('spatialExtensionMap');

			this._once(mapInstance.getChannel('WKT_ADDED'), lang.hitch(this, function(res) {

				this._lastWktLayer = res.layer;
			}));

			this._publish(mapInstance.getChannel('ADD_WKT'), {
				wkt: wkt
			});
		},

		_onActivityDetailsHidden: function() {

			if (this._lastWktLayer) {
				var mapInstance = this._getWidgetInstance('spatialExtensionMap');

				this._publish(mapInstance.getChannel('REMOVE_LAYER'), {
					layer: this._lastWktLayer
				});
			}

			this._hideWidget('spatialExtensionMap');
		}
	});
});
