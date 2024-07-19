define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/app/_app'
], function(
	declare
	, lang
	, App
) {

	return declare(App, {
		//	Summary:
		//		Implementación del módulo App, encargada de mostrar las vistas de la parte externa de la aplicación

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
