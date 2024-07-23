define([
	"src/component/base/_Module"
	, "src/component/base/_Show"
	, "app/base/views/Module"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
	, "src/util/Credentials"
], function (
	_Module
	, _Show
	, Module
	, declare
	, lang
	, aspect
	, put
	, Credentials
){
	return declare([_Module, _Show], {
		//	Summary:
		//		Vista base de listado de acceso a vistas de tercer nivel (Taxonomy, domains).
		//	Description:
		//		Muestra los enlaces a todas las subvistas

		constructor: function(args) {

			this.config = {
				title: "noTitle",
				mask: {}
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);	// PostCreate del padre

			var allowedModules = Credentials.get("allowedModules");

			var box = this.items;
			for (var i = 0; i < allowedModules.length; i++) {
				if (allowedModules[i].id === box.catergoryId) {
					box.basePath = "/"+allowedModules[i].name+"/";
					box.items = allowedModules[i].modules;
					break;
				}
			}
			this._checkItems();
			this._createStructure();
		},

		_checkItems: function() {
			//	Summary:
			//		Crea los módulos a mostrar
			//	Description:
			//		Recorre la lista de items de taxonomy y crea los enlaces

			var box = this.items;
			for (var i = 0; i < box.items.length; i++) {
				var item = box.items[i],
					name = this._getModuleName(item.id, item.name);
				name = name in this.i18n ? this.i18n[name] : name;
				box.modules.push(
					new Module({
						url: box.basePath + lang.replace(item.name, {id: 'new'}),
						uglyName: item.name,
						name: name,
						icon: item.icon,
						domain: true,
						'class': ((this.specialDomains && this.specialDomains.indexOf(item.id) >= 0) ? "domainsSpecial" : "")
					})
				);
			}
		},

		_getModuleName: function (id, name) {
			//	Summary:
			//		Retorna el nombre del enlace dependiendo de si tiene tratamiento especial
			//	Description:
			//		Si el enlace es especial contruye el label a mostrar

			//	id: Integer
			//		Identificador del nombre
			//	name: String
			//		label del enlace

			return name.replace(/\/{id}/i, "");/*this.specialDomains && this.specialDomains.indexOf(id) >= 0
				? "[ " + name + " ]" : */
		},

		_createStructure: function() {

			this.containerNode = put(this.domNode, "div.domains.mediumSolidContainer");
			this.contentNode = put(this.containerNode, "div.domainsBox");

			for (var i = 0; i < this.items.modules.length; i++) {
				this.items.modules[i].placeAt(this.contentNode);
			}
		},

		_getNodeToShow: function() {

			return this.containerNode;
		}
	});
});
