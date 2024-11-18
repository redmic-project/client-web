define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/app/component/layout/Layout'
], function(
	declare
	, lang
	, Layout
) {

	return declare(Layout, {
		//	Summary:
		//		Implementación del componente Layout, encargada de mostrar las vistas de la parte externa de la
		//		aplicación.

		constructor: function(args) {

			this.config = {
				ownChannel: this.outerAppOwnChannel,
				'class': 'outerApp',
				baseClass: ''
			};

			lang.mixin(this, this.config, args);
		},

		_getNode: function() {

			return this.domNode;
		}
	});
});
