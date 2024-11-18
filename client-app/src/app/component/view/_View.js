define([
	'dojo/_base/declare'
	, 'src/app/component/view/_MetaTagsHandler'
	, 'src/app/component/view/_RequestErrorHandler'
	, 'src/app/component/view/_SettingsHandler'
], function(
	declare
	, _MetaTagsHandler
	, _RequestErrorHandler
	, _SettingsHandler
) {

	return declare([_MetaTagsHandler, _RequestErrorHandler, _SettingsHandler], {
		//	summary:
		//		Extensión común para todas los componentes usados como vistas, es decir, aquellos que con instanciados
		//		tras reconocer un valor concreto en la ruta actual. Cuando la navegación a través de la app requiere que
		//		se instancie un nuevo componente, esta extensión se adjunta automáticamente a la lista de dependencias
		//		del mismo.
	});
});
