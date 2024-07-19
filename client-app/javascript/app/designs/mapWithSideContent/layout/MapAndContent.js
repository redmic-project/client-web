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
		//		Distribución que contiene un mapa y un contenido adicional.

		constructor: function(args) {

			this.config = {
				layoutAdditionalClasses: 'mapAndContentLayoutMapWithSideContentDesign'
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._createAndAddContent();
		},

		_createAndAddContent: function() {

			this.mapNode = put(this.domNode, 'div.mediumSolidContainer.mapContainer.borderRadius');
			this.contentNode = put(this.domNode, 'div.mediumSolidContainer.mapSideContainer.borderRadius');
		}
	});
});
