define([
	"app/designs/mapWithSideContent/Controller"
	, "app/designs/mapWithSideContent/layout/MapAndContent"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, 'put-selector'
	, "src/component/atlas/Atlas"
	, 'src/component/layout/TabsDisplayer'
	, "src/component/mapQuery/QueryOnMap"
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
		//		Proporciona un contenedor para los mapas de Leaflet.
		//	description:
		//		Permite trabajar con los mapas y sus capas.

		//	config: Object
		//		Opciones y asignaciones por defecto.
		//	title: String
		//		Título de la vista.

		constructor: function(args) {

			this.config = {
				title: this.i18n.map,
				region: "center",
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
		},

		_getNodeToShowLoading: function() {

			return null;
		}
	});
});
