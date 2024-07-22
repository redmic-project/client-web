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
		//		Layout de diseño para incrustar contenido

		constructor: function(args) {

			this.config = {
			};

			lang.mixin(this, this.config, args);
		}
	});
});
