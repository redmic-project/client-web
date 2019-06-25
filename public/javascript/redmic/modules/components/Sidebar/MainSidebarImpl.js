define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/components/Sidebar/_Secondary"
	, "redmic/modules/components/Sidebar/Sidebar"
], function(
	declare
	, lang
	, aspect
	, _Secondary
	, Sidebar
) {

	return declare([Sidebar, _Secondary], {
		//	summary:
		//		Módulo para la creación del Sidebar de la aplicación.
		//	description:
		//		El Sidebar está compuesto por dos barras laterales (principal y secundaria).
		//		La barra principal está dividida en iconos que corresponden a las categorías en las que
		//		el usuario, al menos, tiene permiso de visualización de los módulos contenidos.
		//		La barra secundaria se compone de los módulos pertenecientes a una misma categoría.
		//		Si se hace click sobre alguna categoría, se desplegará la barra secundaria.
		//		Si se hace click sobre algún módulo, la aplicación lo cargará.
		//		Si se accede con una ruta previa, se detectará para informar del módulo y categoría activos.

		_addPrimaryIcon: function(/*Object*/ item) {

			this._addHrefToItem(item);

			return this.inherited(arguments);
		},

		_addSecondaryIcon: function(/*Object*/ item) {

			this._addHrefToItem(item);

			return this.inherited(arguments);
		},

		_addHrefToItem: function(item) {

			item.href = "/" + item.name;
		},

		_updateActive: function(res) {

			var path = res.path,
				urlSplitted = path.split("/");

			this._updateItemsActive(urlSplitted[0]);

			this._updateItemsActiveSecondary(urlSplitted[1]);
		}
	});
});
