define([
	"app/base/views/extensions/_QueryOnMap"
	, "app/base/views/extensions/_ShowInPopupResultsFromQueryOnMap"
	, "app/designs/mapWithSideContent/Controller"
	, "app/designs/mapWithSideContent/layout/MapAndContent"
	, "app/redmicConfig"
	, "dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/map/Atlas"
], function(
	_QueryOnMap
	, _ShowInPopupResultsFromQueryOnMap
	, Controller
	, Layout
	, redmicConfig
	, ContentPane
	, declare
	, lang
	, Atlas
){
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
				selectionTarget: redmicConfig.services.serviceOGC
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.atlasConfig = this._merge([{
				parentChannel: this.getChannel(),
				terms: this.terms,
				perms: this.perms
			}, this.atlasConfig || {}]);
		},

		_initialize: function() {

			this.atlasConfig.getMapChannel = lang.hitch(this.map, this.map.getChannel);

			this.atlas = new declare([Atlas, _QueryOnMap, _ShowInPopupResultsFromQueryOnMap])(this.atlasConfig);
		},

		postCreate: function() {

			this.inherited(arguments);

			var cp = new ContentPane({
				splitter: true,
				region: "right",
				'class': "col-xs-6 col-sm-6 col-md-5 col-lg-4 mediumTexturedContainer mapSideContainer borderRadius"
			});

			this._publish(this.atlas.getChannel("SHOW"), {
				node: cp.domNode
			});

			this.contentNode.addChild(cp);
		},

		_getNodeToShowLoading: function() {

			return null;
		}
	});
});
