define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/atlas/Atlas'
	, 'src/component/layout/TabsDisplayer'
	, 'src/component/mapQuery/QueryOnMap'
], function (
	declare
	, lang
	, Atlas
	, TabsDisplayer
	, QueryOnMap
) {

	return declare(null, {
		// summary:
		//   Lógica de diseño para añadir un componente Atlas, junto con otros para mostrarlo y para gestionar
		//   pulsaciones sobre el mapa.
		//   Debe asociarse como mixin a un componente al instanciarlo, junto con la parte de controlador y alguna
		//   maquetación de este diseño.

		_setConfigurations: function() {

			this.inherited(arguments);

			const parentChannel = this.getChannel();

			this.mergeComponentAttribute('tabsDisplayerConfig', {
				parentChannel
			});

			this.mergeComponentAttribute('atlasConfig', {
				parentChannel
			});

			this.mergeComponentAttribute('queryOnMapConfig', {
				parentChannel
			});
		},

		createDesignControllerComponents: function() {

			let inheritedComponents = this.inherited(arguments);

			const mapInstance = inheritedComponents.map,
				getMapChannel = lang.hitch(mapInstance, mapInstance.getChannel);

			let tabsDisplayer = inheritedComponents.tabsDisplayer;

			if (!tabsDisplayer) {
				tabsDisplayer = this._createDesignTabDisplayerComponent();
				lang.mixin(inheritedComponents, {tabsDisplayer});
			}

			const tabsDisplayerChannel = tabsDisplayer.getChannel(),
				addTabChannel = tabsDisplayer.getChannel('ADD_TAB');

			const atlas = this._createDesignAtlasComponent(getMapChannel, addTabChannel);

			const queryOnMap = this._createDesignQueryOnMapComponent(getMapChannel, tabsDisplayerChannel);

			return lang.mixin(inheritedComponents, {atlas, queryOnMap});
		},

		_createDesignTabDisplayerComponent: function() {

			return new TabsDisplayer(this.tabsDisplayerConfig);
		},

		_createDesignAtlasComponent: function(getMapChannel, addTabChannel) {

			this.mergeComponentAttribute('atlasConfig', {
				getMapChannel, addTabChannel
			});

			return new Atlas(this.atlasConfig);
		},

		_createDesignQueryOnMapComponent: function(getMapChannel, tabsDisplayerChannel) {

			this.mergeComponentAttribute('queryOnMapConfig', {
				getMapChannel, tabsDisplayerChannel
			});

			return new QueryOnMap(this.queryOnMapConfig);
		},

		populateDesignLayoutNodes: function() {

			this.inherited(arguments);

			const tabsDisplayerInstance = this.getComponentInstance('tabsDisplayer'),
				additionalContentNode = this.getLayoutNode('additionalContent');

			this._publish(tabsDisplayerInstance.getChannel('SHOW'), {
				node: additionalContentNode
			});
		}
	});
});
