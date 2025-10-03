define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_ExternalConfig'
	, 'src/detail/_DetailAdministrative'
	, 'src/detail/_GenerateReport'
	, 'src/detail/activity/_ActivityLayoutWidget'
	, 'templates/ActivityInfo'
], function(
	redmicConfig
	, declare
	, lang
	, _ExternalConfig
	, _DetailAdministrative
	, _GenerateReport
	, _ActivityLayoutWidget
	, ActivityInfoTemplate
) {

	return declare([_DetailAdministrative, _ActivityLayoutWidget, _ExternalConfig, _GenerateReport], {
		//	summary:
		//		Vista de detalle de actividades.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.activity,
				ancestorsTarget: redmicConfig.services.activityAncestors,
				infoTarget: 'infoWidgetTarget',
				templateInfo: ActivityInfoTemplate,
				reportService: 'activity',
				externalConfigPropName: 'detailLayouts.activity',
				pathParent: redmicConfig.viewPaths.activityCatalog
			};

			lang.mixin(this, this.config, args);
		},

		_afterSetConfigurations: function() {

			this.inherited(arguments);

			this._spatialExtensionPrepareDetailWidget();
		},

		_spatialExtensionPrepareDetailWidget: function() {

			const spatialExtension = this._merge([this._getSpatialExtensionConfig(), {
				width: 3,
				height: 2,
				hidden: true
			}]);

			this.widgetConfigs = this._merge([this.widgetConfigs || {}, {spatialExtension}]);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('GOT_EXTERNAL_CONFIG', lang.hitch(this._onGotExternalConfig));
			this._onEvt('ME_OR_ANCESTOR_HIDDEN', lang.hitch(this, this._onActivityDetailsHidden));
		},

		_itemAvailable: function(res) {

			this.inherited(arguments);

			this._activityData = res.data;
			this._requestAncestorsData(res);

			this._prepareSpatialExtension();

			this._emitEvt('GET_EXTERNAL_CONFIG', {
				propertyName: this.externalConfigPropName
			});
		},

		_requestAncestorsData: function(res) {

			const params = {
				path: {
					path: res?.data?.path
				},
				query: {
					returnFields: ['id', 'path', 'name']
				}
			};

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this.ancestorsTarget,
				action: '_search',
				params
			});
		},

		_prepareSpatialExtension: function() {

			const wkt = this._activityData.spatialExtension;
			if (!wkt) {
				return;
			}

			const widgetKey = 'spatialExtension',
				mapInstance = this._getWidgetInstance(widgetKey);

			this._once(mapInstance.getChannel('BBOX_CHANGED'), () => this._showSpatialExtension(wkt));

			this._showWidget(widgetKey);
		},

		_onGotExternalConfig: function(evt) {

			const configValue = evt[this.externalConfigPropName];

			this._publish(this.getChannel('SET_PROPS'), {
				detailLayouts: configValue
			});
		},

		_dataAvailable: function(res) {

			const ancestorsData = res.data.data;

			this._activityData.ancestors = ancestorsData;

			this._dataToInfo();
		},

		_dataToInfo: function() {

			this._emitEvt('INJECT_DATA', {
				data: this._activityData,
				target: this.infoTarget
			});
		},

		_showSpatialExtension: function(wkt) {

			const widgetKey = 'spatialExtension',
				mapInstance = this._getWidgetInstance(widgetKey);

			this._once(mapInstance.getChannel('WKT_ADDED'), (res) => this._lastWktLayer = res.layer);

			this._publish(mapInstance.getChannel('ADD_WKT'), {
				wkt,
				id: widgetKey
			});
		},

		_onActivityDetailsHidden: function() {

			this._removeSpatialExtension();
			this._removeLayoutWidgets();
		},

		_removeSpatialExtension: function() {

			const widgetKey = 'spatialExtension';

			if (this._lastWktLayer) {
				const mapInstance = this._getWidgetInstance(widgetKey);

				this._publish(mapInstance.getChannel('REMOVE_LAYER'), {
					layer: this._lastWktLayer
				});
			}

			this._hideWidget(widgetKey);
		}
	});
});
