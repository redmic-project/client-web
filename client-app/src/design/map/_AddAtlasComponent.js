define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/atlas/Atlas'
	, 'src/design/map/_AddTabsDisplayerComponent'
], function(
	declare
	, lang
	, Atlas
	, _AddTabsDisplayerComponent
) {

	return declare(_AddTabsDisplayerComponent, {
		// summary:
		//   Lógica de diseño para añadir un componente Atlas, junto con otros para mostrarlo y para gestionar
		//   pulsaciones sobre el mapa.
		//   Debe asociarse como mixin a un componente al instanciarlo, junto con la parte de controlador y alguna
		//   maquetación de este diseño.

		_setConfigurations: function() {

			this.inherited(arguments);

			const parentChannel = this.getChannel();

			this.mergeComponentAttribute('atlasConfig', {
				parentChannel
			});
		},

		createDesignControllerComponents: function() {

			const inheritedComponents = this.inherited(arguments);

			const mapInstance = inheritedComponents.map,
				mapChannel = mapInstance?.getChannel();

			const tabsDisplayer = inheritedComponents.tabsDisplayer,
				addTabChannel = tabsDisplayer?.getChannel('ADD_TAB');

			const atlas = this._createDesignAtlasComponent(mapChannel, addTabChannel);

			return lang.mixin(inheritedComponents, {atlas});
		},

		_createDesignAtlasComponent: function(mapChannel, addTabChannel) {

			this.mergeComponentAttribute('atlasConfig', {
				mapChannel, addTabChannel
			});

			return new Atlas(this.atlasConfig);
		}
	});
});
