define([
	'app/designs/mapWithSideContent/Controller'
	, 'app/designs/mapWithSideContent/layout/MapAndContent'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector'
	, 'src/component/atlas/Atlas'
	, 'src/component/layout/TabsDisplayer'
	, 'src/component/mapQuery/QueryOnMap'
], function(
	Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, put
	, Atlas
	, TabsDisplayer
	, QueryOnMap
) {

	return declare([Layout, Controller], {
		//	summary:
		//		Vista de visor atlas. Proporciona un mapa principal y un contenido secundario (componente Atlas) para
		//		trabajar sobre el mapa.
		//	description:
		//		Permite cargar diferentes capas temáticas al mapa, manipularlas y trabajar con los datos que proveen.

		//	config: Object
		//		Opciones y asignaciones por defecto.
		//	title: String
		//		Título de la vista.

		constructor: function(args) {

			this.config = {
				title: this.i18n.atlasViewerView,
				ownChannel: 'atlasViewer',
				selectionTarget: redmicConfig.services.atlasLayerSelection,
				_atlasContainerClass: 'atlasContainer',
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.atlasConfig = this._merge([{
				parentChannel: this.getChannel(),
				terms: this.terms
			}, this.atlasConfig || {}]);

			this.queryOnMapConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.queryOnMapConfig || {}]);
		},

		_initialize: function() {

			this._tabsDisplayer = new TabsDisplayer({
				parentChannel: this.getChannel()
			});

			this._createAtlas();
		},

		_createAtlas: function() {

			var getMapChannel = lang.hitch(this.map, this.map.getChannel);

			this.atlasConfig.getMapChannel = getMapChannel;
			this.atlasConfig.addTabChannel = this._tabsDisplayer.getChannel('ADD_TAB');

			this.atlas = new Atlas(this.atlasConfig);

			this.queryOnMapConfig.getMapChannel = getMapChannel;
			this.queryOnMapConfig.tabsDisplayerChannel = this._tabsDisplayer.getChannel();

			this._queryOnMap = new QueryOnMap(this.queryOnMapConfig);
		},

		postCreate: function() {

			this.inherited(arguments);

			put(this.contentNode, '.' + this._atlasContainerClass);

			this._publish(this._tabsDisplayer.getChannel('SHOW'), {
				node: this.contentNode
			});
		}
	});
});
