define([
	'dojo/_base/declare'
	, 'src/component/textSearch/_Request'
	, 'src/component/textSearch/_Suggestions'
	, 'src/component/textSearch/TextSearchImpl'
], function(
	declare
	, _Request
	, _Suggestions
	, TextSearchImpl
) {

	return declare([TextSearchImpl, _Suggestions, _Request], {
		// summary:
		//   Implementación de buscador por texto con sugerencias y petición directa de datos.
	});
});
