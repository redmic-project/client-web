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
){
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

		constructor: function(args) {

			this.config = {
				"class": "mainSidebar",
				region: "left",
				// own actions
				mainSidebarActions: {
					GET_ALLOWED_MODULES: "getAllowedModules",
					AVAILABLE_ALLOWED_MODULES: "availableAllowedModules",
					UPDATE_ACTIVE: "updateActive"
				},
				mainSidebarEvents: {
					GET_ALLOWED_MODULES: "getAllowedModules"
				},
				suffixI18n: '-view',
				subitems: 'modules',
				// mediator params
				ownChannel: "sidebar"
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixMainSidebarEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineMainSidebarSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineMainSidebarPublications));
		},

		_mixMainSidebarEventsAndActions: function () {

			lang.mixin(this.events, this.mainSidebarEvents);
			lang.mixin(this.actions, this.mainSidebarActions);

			delete this.mainSidebarEvents;
			delete this.mainSidebarActions;
		},

		_defineMainSidebarSubscriptions: function () {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.credentialsChannel, this.actions.AVAILABLE_ALLOWED_MODULES),
				callback: "_subAllowedModules",
				options: {
					predicate: lang.hitch(this, this._chkPublicationIsForMe)
				}
			});
		},

		_defineMainSidebarPublications: function() {

			this.publicationsConfig.push({
				event: 'GET_ALLOWED_MODULES',
				channel: this._buildChannel(this.credentialsChannel, this.actions.GET_ALLOWED_MODULES)
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('GET_ALLOWED_MODULES', {
				id: this.getOwnChannel()
			});
		},

		_subAllowedModules: function(/*Object*/ res) {
			//	summary:
			//		Se ejecuta este callback cuando recibe los módulos permitidos al usuario
			//		mandando a crear la estructura y añadiendo los items con los módulos recibidos
			//	tags:
			//		private
			//	response: Object
			//		Respuesta de la petición que contiene los módulos permitidos.

			this._addItems(res.data);
		},

		_addPrimaryIcon: function(/*Object*/ item) {

			arguments[0].href = "/" + item.name;

			return this.inherited(arguments);
		},

		_addSecondaryIcon: function(/*Object*/ item) {

			arguments[0].href = "/" + item.name;

			return this.inherited(arguments);
		},

		_updateActive: function(res) {

			var path = res.path,
				urlSplitted = path.split("/");

			this._updateItemsActive(urlSplitted[0]);

			this._updateItemsActiveSecondary(urlSplitted[1]);
		}
	});
});
