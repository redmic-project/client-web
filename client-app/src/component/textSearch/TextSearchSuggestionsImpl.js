define([
	'dojo/_base/declare'
	, 'src/component/textSearch/_Suggestions'
	, 'src/component/textSearch/TextSearchImpl'
], function(
	declare
	, _Suggestions
	, TextSearchImpl
) {

	return declare([TextSearchImpl, _Suggestions], {
		// summary:
		//   Implementación de buscador por texto con sugerencias.
	});
});
