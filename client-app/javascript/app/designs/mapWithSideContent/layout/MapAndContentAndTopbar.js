define([
	'app/designs/base/_Layout'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
], function(
	_Layout
	, declare
	, lang
	, put
) {

	return declare(_Layout, {
		//	summary:
		//		Layout para diseño de vistas que contienen un mapa, contenido a la derecha y barra superior.

		constructor: function(args) {

			this.config = {
				layoutAdditionalClasses: 'mapAndContentAndTopbarLayoutMapWithSideContentDesign'
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._createAndAddContent();
		},

		_createAndAddContent: function() {

			this.topbarNode = put(this.domNode, 'div.mediumSolidContainer.rounded');
			this.centerNode = put(this.domNode, 'div.mapCenterContainer');
			this.mapNode = put(this.centerNode, 'div.mediumSolidContainer.mapContainer.borderRadius');
			this.contentNode = put(this.centerNode, 'div.mediumSolidContainer.mapSideContainer.borderRadius');
		}
	});
});
