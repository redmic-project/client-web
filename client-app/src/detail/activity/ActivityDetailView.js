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
				reportService: 'activity',
				ancestorsTarget: redmicConfig.services.activityAncestors,
				externalConfigPropName: 'detailLayouts.activity',
				pathParent: redmicConfig.viewPaths.activityCatalog,
				templateInfo: ActivityInfoTemplate,
				_infoTarget: 'infoWidgetTarget'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.inherited(arguments);

			this.widgetConfigs = this._merge([{
				info: {},
				spatialExtension: this._getSpatialExtensionConfig()
			}, this.widgetConfigs || {}]);
		},

		_setMainOwnCallbacksForEvents: function() {

			this._onEvt('GOT_EXTERNAL_CONFIG', lang.hitch(this._onGotExternalConfig));
			this._onEvt('ME_OR_ANCESTOR_HIDDEN', lang.hitch(this, this._onActivityDetailsHidden));
		},

		_refreshModules: function() {

			this.inherited(arguments);

			this._publish(this._getWidgetInstance('info').getChannel('UPDATE_TARGET'), {
				target: this._infoTarget
			});
		},

		_onGotExternalConfig: function(evt) {

			var configValue = evt[this.externalConfigPropName];

			this._publish(this.getChannel('SET_PROPS'), {
				detailLayouts: configValue
			});
		},

		_addTargetToArray: function(target) {

			if (this.target && this.target instanceof Array && !this.target.includes(target)) {
				this.target.push(target);
			}
		},

		_removeTargetFromArray: function(target) {

			if (this.target && this.target instanceof Array && this.target.includes(target)) {
				this.target.splice(this.target.indexOf(target), 1);
			}
		},

		_itemAvailable: function(res) {

			this.inherited(arguments);

			this._activityData = res.data;
			this._requestAncestorsData(res);

			this._prepareSpatialExtension();

			this._emitEvt('GET_EXTERNAL_CONFIG', {
				propertyName: this.externalConfigPropName
			});

			this._prepareCustomWidgets();
		},

		_requestAncestorsData: function(res) {

			this._ancestorsTarget = lang.replace(this.ancestorsTarget, {
				path: res?.data?.path
			});

			this._addTargetToArray(this._ancestorsTarget);

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this._ancestorsTarget,
				action: '_search',
				query: {
					returnFields: ['id', 'path', 'name']
				}
			});
		},

		_prepareSpatialExtension: function() {

			var wkt = this._activityData.spatialExtension;
			if (!wkt) {
				return;
			}

			var mapInstance = this._getWidgetInstance('spatialExtension');
			this._once(mapInstance.getChannel('BBOX_CHANGED'), lang.hitch(this, this._showSpatialExtension, wkt));

			this._showWidget('spatialExtension');
		},

		_dataAvailable: function(res) {

			this._removeTargetFromArray(this._ancestorsTarget);

			var data = res.data,
				ancestors = data.data;

			this._activityData.ancestors = ancestors;

			this._dataToInfo();
		},

		_dataToInfo: function() {

			this._emitEvt('INJECT_DATA', {
				data: this._activityData,
				target: this._infoTarget
			});
		},

		_showSpatialExtension: function(wkt) {

			var mapInstance = this._getWidgetInstance('spatialExtension');

			this._once(mapInstance.getChannel('WKT_ADDED'), lang.hitch(this, function(res) {

				this._lastWktLayer = res.layer;
			}));

			this._publish(mapInstance.getChannel('ADD_WKT'), {
				wkt: wkt,
				id: 'spatialExtension'
			});
		},

		_onActivityDetailsHidden: function() {

			this.target = [redmicConfig.services.activity];

			if (this._lastWktLayer) {
				var mapInstance = this._getWidgetInstance('spatialExtension');

				this._publish(mapInstance.getChannel('REMOVE_LAYER'), {
					layer: this._lastWktLayer
				});
			}

			this._hideWidget('spatialExtension');

			this._removeCustomWidgets();
		}
	});
});
