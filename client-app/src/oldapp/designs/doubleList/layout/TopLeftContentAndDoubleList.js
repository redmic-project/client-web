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
		//		Layout para vistas que contienen .

		constructor: function(args) {

			this.config = {
				layoutAdditionalClasses: 'layoutDoubleListDesign twoColumnsLayout'
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._leftZone();
			this._rightZone();
		},

		_leftZone: function() {

			var leftNode = put(this.domNode, 'div.leftZone');

			this.topLeftNode = put(leftNode, 'div.notFormZone');
			this.leftNode = put(leftNode, 'div.stretchZone');
		},

		_rightZone: function() {

			var rightNode = put(this.domNode, 'div.rightZone');

			this.rightNode = put(rightNode, 'div.stretchZone');
		}
	});
});
