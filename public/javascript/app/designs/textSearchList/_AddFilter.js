define([
	'app/designs/list/_AddFilter'
	, 'dojo/_base/declare'
], function (
	_AddFilter
	, declare
) {

	return declare(_AddFilter, {
		//	summary:
		//		Extensión de diseño con módulo browser y search (text) para agregar comunicación con módulo filter

		_setQueryChannelInModules: function() {

			this.inherited(arguments);

			this.textSearchConfig.queryChannel = this.queryChannel;
		},

		_handleFilterParams: function() {
			//	summary:
			//		Si se interactúa con la búsqueda por texto, deshacer cualquier ordenación activa

			this._emitEvt('ADD_TO_QUERY', {
				omitRefresh: true,
				query: {
					sorts: null
				}
			});

			this.inherited(arguments);
		}
	});
});
