define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'put-selector'
	, 'app/designs/mapWithSideContent/Controller'
	, 'app/designs/mapWithSideContent/layout/MapAndContentAndTopbar'
	, 'src/component/base/_ExternalConfig'
	, 'src/component/base/_Store'
	, 'src/component/atlas/Atlas'
	, 'src/component/layout/TabsDisplayer'
	, 'src/component/mapQuery/QueryOnMap'
	, 'src/redmicConfig'
	, 'src/viewer/marineMonitoring/_ManageOgcServices'
	, 'templates/AtlasMixedList'
], function(
	declare
	, lang
	, Deferred
	, put
	, Controller
	, Layout
	, _ExternalConfig
	, _Store
	, Atlas
	, TabsDisplayer
	, QueryOnMap
	, redmicConfig
	, _ManageOgcServices
	, AtlasMixedListTemplate
) {

	return declare([Layout, Controller, _Store, _ManageOgcServices, _ExternalConfig], {
		//	summary:
		//		Vista de visor de monitorización marina. Proporciona un mapa principal y una serie de capas temáticas,
		//		junto con el componente Atlas para cruzar datos.

		constructor: function(args) {

			this.config = {
				title: this.i18n.marineMonitoringViewerView,
				ownChannel: 'marineMonitoringViewer',
				selectionTarget: redmicConfig.services.atlasLayerSelection,
				_activityLayersTarget: 'activityLayersTarget',
				externalConfigPropName: 'marineMonitoringViewerActivities',
				_topbarNodeClassName: 'timeDimensionTopbarContainer'
			};

			lang.mixin(this, this.config, args);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('GOT_EXTERNAL_CONFIG', lang.hitch(this._onGotExternalConfig));
		},

		_setConfigurations: function() {

			this.mapConfig = this._merge([{
				getTimeDimensionExternalContainer: lang.hitch(this, this._getExternalContainer)
			}, this.mapConfig || {}]);

			this.atlasConfig = this._merge([{
				parentChannel: this.getChannel(),
				localTarget: this._activityLayersTarget,
				addThemesBrowserFirst: true,
				themesBrowserConfig: {
					title: this.i18n.contents,
					browserConfig: {
						template: AtlasMixedListTemplate
					}
				}
			}, this.atlasConfig || {}]);

			this.queryOnMapConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.queryOnMapConfig || {}]);
		},

		_initialize: function() {

			this._tabsDisplayer = new TabsDisplayer({
				parentChannel: this.getChannel()
			});

			this.addTabChannel = this._tabsDisplayer.getChannel('ADD_TAB');
			this.getMapChannel = lang.hitch(this.map, this.map.getChannel);

			this._initializeAtlas();
			this._initializeQueryOnMap();
		},

		_initializeAtlas: function() {

			this.atlasConfig = this._merge([{
				getMapChannel: this.getMapChannel,
				addTabChannel: this.addTabChannel
			}, this.atlasConfig || {}]);

			this._atlas = new Atlas(this.atlasConfig);
		},

		_initializeQueryOnMap: function() {

			this.queryOnMapConfig = this._merge([{
				getMapChannel: this.getMapChannel,
				tabsDisplayerChannel: this._tabsDisplayer.getChannel()
			}, this.queryOnMapConfig || {}]);

			this._queryOnMap = new QueryOnMap(this.queryOnMapConfig);
		},

		postCreate: function() {

			this.inherited(arguments);

			put(this.topbarNode, '.' + this._topbarNodeClassName);
			this._externalContainerDfd = new Deferred();
			this._externalContainerDfd.resolve(this.topbarNode);

			this._emitEvt('GET_EXTERNAL_CONFIG', {
				propertyName: this.externalConfigPropName
			});

			this._publish(this._tabsDisplayer.getChannel('SHOW'), {
				node: this.contentNode
			});
		},

		_getExternalContainer: function() {

			return this._externalContainerDfd;
		},

		_onGotExternalConfig: function(evt) {

			var configValue = evt[this.externalConfigPropName];

			this._emitEvt('REQUEST', {
				target: this.target,
				action: '_search',
				method: 'POST',
				query: {
					terms: {
						activities: configValue
					}
				},
				requesterId: this.getChannel()
			});
		},

		_dataAvailable: function(res, resWrapper) {

			var reqTerms = resWrapper.req.query.terms;
			if (!reqTerms || !reqTerms.activities) {
				return;
			}

			this._onActivityLayersData(res);
		}
	});
});
