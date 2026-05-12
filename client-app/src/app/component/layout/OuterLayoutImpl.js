define([
	'dojo/_base/declare'
	, 'src/app/component/layout/Layout'
], function(
	declare
	, Layout
) {

	return declare(Layout, {
		//	Summary:
		//		Implementación del componente Layout, encargada de mostrar las vistas de la parte externa de la
		//		aplicación.

		postMixInProperties: function() {

			const defaultConfig = {
				ownChannel: this.outerAppOwnChannel,
				'class': 'outerApp',
				baseClass: ''
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_getContentNode: function() {

			return this.domNode;
		}
	});
});
