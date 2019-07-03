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
				layoutAdditionalClasses: 'mapAndContentLayoutMapDesign'
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._createAndAddContent();
		},

		_createAndAddContent: function() {

			this.mapNode = put('div.mediumSolidContainer.borderRadius');

			this.contentNode = put('div.mediumTexturedContainer.mapSideContainer.borderRadius');
			//'class': "col-xs-6 col-sm-6 col-md-5 col-lg-4 mediumTexturedContainer mapSideContainer borderRadius"

			this.addChild(this.mapNode);
			this.addChild(this.contentNode);
		}
	});
});
