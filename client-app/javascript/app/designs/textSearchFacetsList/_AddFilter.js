define([
	'app/designs/textSearchList/_AddFilter'
	, 'dojo/_base/declare'
], function (
	_AddFilter
	, declare
) {

	return declare(_AddFilter, {
		//	summary:
		//		Extensión de diseño con módulo browser y search (text y facets) para agregar comunicación con módulo
		//		filter

		_setQueryChannelInModules: function() {

			this.inherited(arguments);

			this.facetsConfig.queryChannel = this.queryChannel;
		}
	});
});
