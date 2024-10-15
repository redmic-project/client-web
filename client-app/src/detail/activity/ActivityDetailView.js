define([
	'src/redmicConfig'
	, 'app/designs/details/main/_ActivityBase'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_ExternalConfig'
	, 'src/detail/_GenerateReport'
	, 'src/detail/activity/_ActivityLayoutWidget'
	, 'app/designs/details/_AddWidgetSelector'
	, 'templates/ActivityInfo'
], function(
	redmicConfig
	, _ActivityBase
	, declare
	, lang
	, _ExternalConfig
	, _GenerateReport
	, _ActivityLayoutWidget
	, _AddWidgetSelector
	, TemplateInfo
) {

	return declare([_ActivityBase, _AddWidgetSelector, _ActivityLayoutWidget, _ExternalConfig, _GenerateReport], {
		//	summary:
		//		Vista de detalle de actividades.

		constructor: function(args) {

			this.config = {
				activityTarget: redmicConfig.services.activity,
				reportService: 'activity',
				ancestorsTarget: redmicConfig.services.activityAncestors,
				infoTarget: 'infoWidgetTarget',
				externalConfigPropName: 'detailLayouts.activity'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.target = [this.activityTarget];

			this.viewPathsWidgets = {
				organisations: redmicConfig.viewPaths.organisationCatalogDetails,
				platforms: redmicConfig.viewPaths.platformCatalogDetails,
				documents: redmicConfig.viewPaths.bibliographyDetails
			};

			this.pathParent = redmicConfig.viewPaths.activityCatalog;

			this.widgetConfigs = this._merge([{
				info: this._getInfoConfig({
					template: TemplateInfo
				}),
				spatialExtension: this._getSpatialExtensionConfig(),
				organisationList: this._getOrganisationsConfig(),
				platformList: this._getPlatformsConfig(),
				contactList: this._getContactsConfig(),
				documentList: this._getDocumentsConfig()
			}, this.widgetConfigs || {}]);
		},

		_setMainOwnCallbacksForEvents: function() {

			this._onEvt('GOT_EXTERNAL_CONFIG', lang.hitch(this._onGotExternalConfig));
			this._onEvt('ME_OR_ANCESTOR_HIDDEN', lang.hitch(this, this._onActivityDetailsHidden));
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

			var path = res.data.path;

			this._activityData = res.data;

			this._ancestorsTarget = lang.replace(this.ancestorsTarget, { path: path });
			this._addTargetToArray(this._ancestorsTarget);

			this._emitEvt('INJECT_DATA', {
				data: this._activityData,
				target: this.infoTarget
			});

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this._ancestorsTarget,
				action: '_search',
				query: {
					returnFields: ['id', 'path', 'name']
				}
			});

			this._prepareSpatialExtension();

			this._emitEvt('GET_EXTERNAL_CONFIG', {
				propertyName: this.externalConfigPropName
			});

			this._prepareCustomWidgets();

			this.inherited(arguments);
		},

		_dataAvailable: function(res) {

			this._removeTargetFromArray(this._ancestorsTarget);

			var data = res.data,
				ancestors = data.data;

			this._activityData.ancestors = ancestors;

			this._emitEvt('INJECT_DATA', {
				data: this._activityData,
				target: this.infoTarget
			});

			this._updateInteractive();
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

			this.target = [this.activityTarget];

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
