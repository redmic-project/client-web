define([
	'dojo/_base/declare'
	, 'src/component/textSearch/_Request'
	, 'src/component/textSearch/TextSearchImpl'
], function(
	declare
	, _Request
	, TextSearchImpl
) {

	return declare([TextSearchImpl, _Request], {
		// summary:
		//   Implementación de buscador por texto con petición directa de datos.
	});
});
