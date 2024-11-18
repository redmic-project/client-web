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
		//		Layout para vistas que contienen un formulario y un listado.

		constructor: function(args) {

			this.config = {
				layoutAdditionalClasses: 'layoutFormListDesign twoColumnsLayout'
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this.leftNode = put(this.domNode, 'div.leftZone');
			this.topLeftNode = put(this.leftNode, 'div.titleContainer');
			this.formNode = put(this.leftNode, 'div.stretchZone');
			this.centerRightNode = put(this.domNode, 'div.rightZone');
		}
	});
});
