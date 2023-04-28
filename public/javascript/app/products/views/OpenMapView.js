define([
	"app/designs/mapWithSideContent/Controller"
	, "app/designs/mapWithSideContent/layout/MapAndContent"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/atlas/Atlas"
	, "redmic/modules/base/_ShowInPopup"
	, "redmic/modules/mapQuery/QueryOnMap"
], function(
	Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, Atlas
	, _ShowInPopup
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
				selectionTarget: redmicConfig.services.atlasLayerSelection
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.atlasConfig = this._merge([{
				parentChannel: this.getChannel(),
				terms: this.terms,
				perms: this.perms
			}, this.atlasConfig || {}]);

			this.queryOnMapConfig = this._merge([{
				parentChannel: this.getChannel(),
				title: this.i18n.layersQueryResults,
				width: 5,
				height: "md"
			}, this.queryOnMapConfig || {}]);
		},

		_initialize: function() {

			var getMapChannel = lang.hitch(this.map, this.map.getChannel);
			this.atlasConfig.getMapChannel = getMapChannel;
			this.queryOnMapConfig.getMapChannel = getMapChannel;

			this.atlas = new Atlas(this.atlasConfig);

			var QueryOnMapPopup = declare(QueryOnMap).extend(_ShowInPopup);
			this._queryOnMap = new QueryOnMapPopup(this.queryOnMapConfig);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.atlas.getChannel("SHOW"), {
				node: this.contentNode
			});
		},

		_getNodeToShowLoading: function() {

			return null;
		}
	});
});
