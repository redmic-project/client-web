define([
	'app/designs/base/_Layout'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'put-selector/put'
], function (
	_Layout
	, declare
	, lang
	, aspect
	, put
){
	return declare(_Layout, {
		//	summary:
		//		Layout para vistas de detalle.

		constructor: function(args) {

			this.config = {
				layoutAdditionalClasses: 'infoView'
			};

			lang.mixin(this, this.config, args);

			this.centerNode = put('div.infoContainer');
		},

		postCreate: function() {

			this.inherited(arguments);

			this.addChild(this.centerNode);
		}
	});
});
