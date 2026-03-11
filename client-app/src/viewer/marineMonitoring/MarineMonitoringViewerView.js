define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'moment'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/design/map/_AddAtlasComponent'
	, 'src/design/map/_AddQueryOnMapComponent'
	, 'src/design/map/_MapDesignWithTopbarAndContentLayout'
	, 'src/redmicConfig'
	, 'src/viewer/marineMonitoring/_ManageOgcServices'
	, 'templates/AtlasMixedList'
], function(
	declare
	, lang
	, Deferred
	, moment
	, _Module
	, _Show
	, _Store
	, _AddAtlasComponent
	, _AddQueryOnMapComponent
	, _MapDesignWithTopbarAndContentLayout
	, redmicConfig
	, _ManageOgcServices
	, AtlasMixedListTemplate
) {

	return declare([_Module, _Show, _Store, _MapDesignWithTopbarAndContentLayout, _ManageOgcServices,
		_AddAtlasComponent, _AddQueryOnMapComponent], {
		// summary:
		//   Vista de visor de monitorización marina. Proporciona un mapa principal y una serie de capas temáticas,
		//   junto con el componente Atlas para cruzar datos, incluyendo soporte de consulta con dimensión temporal.

		postMixInProperties: function() {

			this.inherited(arguments);

			const defaultConfig = {
				title: this.i18n.marineMonitoringViewerView,
				ownChannel: 'marineMonitoringViewer',
				selectionTarget: redmicConfig.services.atlasLayerSelection,
				externalConfigPropName: 'marineMonitoringViewerActivities',
				_topbarNodeAdditionalClass: 'timeDimensionTopbarContainer'
			};

			this._mergeOwnAttributes(defaultConfig);
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('GOT_EXTERNAL_CONFIG', lang.hitch(this._onGotExternalConfig));
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this._externalContainerDfd = new Deferred();

			this.topbarNodeClasses += `.${this._topbarNodeAdditionalClass}`;

			this.mergeComponentAttribute('mapConfig', {
				timeDimensionMinTime: moment().utc().startOf('day').subtract(30, 'days'),
				getTimeDimensionExternalContainer: () => this._externalContainerDfd
			});

			this.mergeComponentAttribute('atlasConfig', {
				themesBrowserConfig: {
					title: this.i18n.contents,
					browserConfig: {
						template: AtlasMixedListTemplate,
						disableDragHandlerOnCreation: true
					}
				}
			});
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

			const activities = evt[this.externalConfigPropName];

			this._requestLayersDataFilteredByActivityIds(activities);
		}
	});
});
