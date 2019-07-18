define([
	'app/designs/base/_Layout'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
], function(
	_Layout
	, declare
	, lang
) {

	return declare(_Layout, {
		//	summary:
		//		Layout para vistas de edición.

		constructor: function(args) {

			this.config = {
				layoutAdditionalClasses: 'layoutEditionDesign'
			};

			lang.mixin(this, this.config, args);
		}
	});
});
