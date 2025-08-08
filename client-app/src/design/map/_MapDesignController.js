define([
	'dojo/_base/declare'
	, 'src/component/map/_LeafletDraw'
	, 'src/component/map/_PlaceNamesButton'
	, 'src/component/map/LeafletImpl'
	, 'src/design/_DesignController'
], function(
	declare
	, _LeafletDraw
	, _PlaceNamesButton
	, LeafletImpl
	, _DesignController
) {

	const mapComponentExtensionDefinitions = {
		toponyms: _PlaceNamesButton,
		draw: _LeafletDraw
	};

	const defaultConfig = {
		events: {
			ADD_LAYER: 'addLayer',
			REMOVE_LAYER: 'removeLayer'
		},
		enabledMapExtensions: {
			toponyms: true,
			draw: false
		}
	};

	return declare(_DesignController, {
		// summary:
		//   Lógica de diseño para mostrar un componente mapa con extensiones opcionales.
		//   Debe asociarse como mixin a un componente al instanciarlo.

		_getDesignDefaultConfig: function() {

			const inheritedDefaultConfig = this.inherited(arguments) || {};

			return this._merge([inheritedDefaultConfig, defaultConfig]);
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this.mergeComponentAttribute('mapConfig', {
				parentChannel: this.getChannel()
			});

			this._MapComponentDefinition = this.prepareComponentDefinition(
				[LeafletImpl], this.enabledMapExtensions, mapComponentExtensionDefinitions);
		},

		createDesignControllerComponents: function() {

			const map = new this._MapComponentDefinition(this.mapConfig);

			return {map};
		},

		_definePublications: function() {

			this.inherited(arguments);

			const mapInstance = this.getComponentInstance('map');

			this.publicationsConfig.push({
				event: 'ADD_LAYER',
				channel: mapInstance.getChannel('ADD_LAYER')
			},{
				event: 'REMOVE_LAYER',
				channel: mapInstance.getChannel('REMOVE_LAYER')
			});
		}
	});
});
