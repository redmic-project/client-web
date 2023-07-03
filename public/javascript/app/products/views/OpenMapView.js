define([
	"app/designs/mapWithSideContent/Controller"
	, "app/designs/mapWithSideContent/layout/MapAndContent"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, 'put-selector/put'
	, "redmic/modules/atlas/Atlas"
	, "redmic/modules/base/_ShowInPopup"
	, 'redmic/modules/layout/TabsDisplayer'
	, "redmic/modules/mapQuery/QueryOnMap"
], function(
	Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, put
	, Atlas
	, _ShowInPopup
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
				terms: this.terms,
				perms: this.perms
			}, this.atlasConfig || {}]);

			this.queryOnMapConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.queryOnMapConfig || {}]);
		},

		_initialize: function() {

			var getMapChannel = lang.hitch(this.map, this.map.getChannel);
			this.atlasConfig.getMapChannel = getMapChannel;
			this.queryOnMapConfig.getMapChannel = getMapChannel;

			this._tabsDisplayer = new TabsDisplayer({
				parentChannel: this.getChannel()
			});
			this.atlasConfig.addTabChannel = this._tabsDisplayer.getChannel('ADD_TAB');

			this.atlas = new Atlas(this.atlasConfig);

			var QueryOnMapPopup = declare(QueryOnMap).extend(_ShowInPopup);
			this._queryOnMap = new QueryOnMapPopup(this.queryOnMapConfig);
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
