define([
	'app/redmicConfig'
	, 'app/designs/details/main/_ActivityBase'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_ExternalConfig'
	, 'src/view/detail/activity/_ActivityLayoutWidget'
	, 'templates/ActivityInfo'
], function(
	redmicConfig
	, _ActivityBase
	, declare
	, lang
	, _ExternalConfig
	, _ActivityLayoutWidget
	, TemplateInfo
) {

	return declare([_ActivityBase, _ActivityLayoutWidget, _ExternalConfig], {
		//	summary:
		//		Layout para detalle de actividad con metadatos.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.activity,
				reportService: 'activity',
				ancestorsTarget: redmicConfig.services.activityAncestors,
				infoTarget: 'infoWidgetTarget',
				externalConfigPropName: 'detailLayouts.activity'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.widgetConfigs = this._merge([{
				info: this._getInfoConfig({
					height: 4,
					template: TemplateInfo
				}),
				spatialExtensionMap: this._getSpatialExtensionMapConfig(),
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
				method: 'POST',
				target: ancestorsTarget,
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
				wkt: wkt,
				id: 'spatialExtension'
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

			this._removeCustomWidgets();
		}
	});
});