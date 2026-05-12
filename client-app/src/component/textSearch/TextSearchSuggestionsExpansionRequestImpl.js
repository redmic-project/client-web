define([
	'dojo/_base/declare'
	, 'src/component/textSearch/_Expansion'
	, 'src/component/textSearch/_Request'
	, 'src/component/textSearch/_Suggestions'
	, 'src/component/textSearch/TextSearchImpl'
], function(
	declare
	, _Expansion
	, _Request
	, _Suggestions
	, TextSearchImpl
) {

	return declare([TextSearchImpl, _Suggestions, _Expansion, _Request], {
		// summary:
		//   Implementación de buscador por texto con sugerencias, expansión de búsqueda y petición directa de datos.
	});
});
