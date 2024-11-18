define([
	'app/designs/base/_Layout'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector'
], function(
	_Layout
	, declare
	, lang
	, put
) {

	return declare(_Layout, {
		//	summary:
		//		Layout para vistas que contienen un buscador de texto y un listado.

		constructor: function(args) {

			this.config = {
				layoutAdditionalClasses: 'layoutTextSearchListDesign',
				classByList: '.noBorderList'
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this.topNode = put(this.domNode, "div.topZone");

			this._titleNode = put(this.topNode, "div.titleZone");

			this._setTitle(this.title);

			var optionNode = put(this.topNode, "div.optionZone");

			this.buttonsNode = put(optionNode, "div.buttonsZone");

			this.textSearchNode = put(this.topNode, "div.textSearchZone");

			this.centerNode = put(this.domNode, "div.centerZone");

			this.listNode = put(this.centerNode, "div.listZone" + this.classByList);
		}
	});
});
