define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/mapQuery/QueryOnMap'
	, 'src/design/map/_AddTabsDisplayerComponent'
], function(
	declare
	, lang
	, QueryOnMap
	, _AddTabsDisplayerComponent
) {

	return declare(_AddTabsDisplayerComponent, {
		// summary:
		//   Lógica de diseño para añadir un componente QueryOnMap, para gestionar pulsaciones sobre el mapa.
		//   Debe asociarse como mixin a un componente al instanciarlo, junto con la parte de controlador y alguna
		//   maquetación de este diseño.

		_setConfigurations: function() {

			this.inherited(arguments);

			const parentChannel = this.getChannel();

			this.mergeComponentAttribute('queryOnMapConfig', {
				parentChannel
			});
		},

		createDesignControllerComponents: function() {

			const inheritedComponents = this.inherited(arguments);

			const mapInstance = inheritedComponents.map,
				mapChannel = mapInstance?.getChannel();

			const tabsDisplayer = inheritedComponents.tabsDisplayer,
				tabsDisplayerChannel = tabsDisplayer?.getChannel();

			const queryOnMap = this._createDesignQueryOnMapComponent(mapChannel, tabsDisplayerChannel);

			return lang.mixin(inheritedComponents, {queryOnMap});
		},

		_createDesignQueryOnMapComponent: function(mapChannel, tabsDisplayerChannel) {

			this.mergeComponentAttribute('queryOnMapConfig', {
				mapChannel, tabsDisplayerChannel
			});

			return new QueryOnMap(this.queryOnMapConfig);
		}
	});
});
