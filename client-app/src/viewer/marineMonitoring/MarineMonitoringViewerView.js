define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'moment'
	, 'src/component/base/_ExternalConfig'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/design/map/_AddAtlasComponent'
	, 'src/design/map/_MapDesignController'
	, 'src/design/map/_MapDesignWithTopbarAndContentLayout'
	, 'src/redmicConfig'
	, 'src/viewer/marineMonitoring/_ManageOgcServices'
	, 'templates/AtlasMixedList'
], function(
	declare
	, lang
	, Deferred
	, moment
	, _ExternalConfig
	, _Module
	, _Show
	, _Store
	, _AddAtlasComponent
	, _MapDesignController
	, _MapDesignWithTopbarAndContentLayout
	, redmicConfig
	, _ManageOgcServices
	, AtlasMixedListTemplate
) {

	return declare([_Module, _Show, _MapDesignController, _MapDesignWithTopbarAndContentLayout, _AddAtlasComponent,
		_Store, _ManageOgcServices, _ExternalConfig
	], {
		// summary:
		//   Vista de visor de monitorización marina. Proporciona un mapa principal y una serie de capas temáticas,
		//   junto con el componente Atlas para cruzar datos, incluyendo soporte de consulta con dimensión temporal.

		constructor: function(args) {

			const defaultConfig = {
				title: this.i18n.marineMonitoringViewerView,
				ownChannel: 'marineMonitoringViewer',
				selectionTarget: redmicConfig.services.atlasLayerSelection,
				_activityLayersTarget: 'activityLayersTarget',
				externalConfigPropName: 'marineMonitoringViewerActivities',
				_topbarNodeAdditionalClass: 'timeDimensionTopbarContainer'
			};

			lang.mixin(this, this._merge([this, defaultConfig, args]));
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('GOT_EXTERNAL_CONFIG', lang.hitch(this._onGotExternalConfig));
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this._externalContainerDfd = new Deferred();

			this.topbarNodeClasses += `.${this._topbarNodeAdditionalClass}`;

			this.mapConfig = this._merge([{
				timeDimensionMinTime: moment().utc().startOf('day').subtract(30, 'days'),
				getTimeDimensionExternalContainer: () => this._externalContainerDfd
			}, this.mapConfig || {}]);

			this.atlasConfig = this._merge([{
				localTarget: this._activityLayersTarget,
				addThemesBrowserFirst: true,
				themesBrowserConfig: {
					title: this.i18n.contents,
					browserConfig: {
						template: AtlasMixedListTemplate,
						disableDragHandlerOnCreation: true
					}
				}
			}, this.atlasConfig || {}]);
		},

		postCreate: function() {

			this.inherited(arguments);

			const topbarNode = this.getLayoutNode('topbar');

			this._externalContainerDfd.resolve(topbarNode);

			this._emitEvt('GET_EXTERNAL_CONFIG', {
				propertyName: this.externalConfigPropName
			});
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
