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
		//		Layout para vistas que contienen .

		constructor: function(args) {

			this.config = {
				layoutAdditionalClasses: 'layoutContentAndListDesign twoColumnsLayout'
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			var centerNode = put(this.domNode, 'div.leftZone');

			this.topNode = put(centerNode, 'div.notFormZone');
			this.centerNode = put(centerNode, 'div.stretchZone');
		}
	});
});
