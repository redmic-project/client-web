define([
	"dojo/_base/declare"
	, "app/base/views/Module"
	, "app/home/views/_DashboardItem"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/base/Credentials"
], function(
	declare
	, Module
	, _DashboardItem
	, lang
	, put
	, Credentials
) {

	return declare(_DashboardItem, {
		//	summary:
		//		Widget para la creación de un elemento Favoritos del modulo Initial
		//
		//	description:

		// items: array de String
		// 	contenido del widget
		elements: {
			"catalog": {"activities-catalog":{}, "project-catalog":{}, "program-catalog":{}, "species-catalog":{}/*,
						"organisation-catalog":{}, "platform-catalog":{}*/},
			"products": {"atlas":{}, "service-ogc-catalog":{}},
			"viewer": {"species-distribution":{}, "tracking":{}, "charts": {}, "trash-collection": {}},
			"admin": {"taxonomy":{}},
			"maintenance": {"domains":{}, "service-ogc": {}}
		},

		hrefs: [{
			url: "/catalog/activity-infrastructure/1378",
			label: "webcams",
			icon: "fa-camera"
		},{
			url: "/viewer/real-time",
			label: "real-time",
			icon: "fa-clock-o"
		}],

		suffixI18n: '-view',

		constructor: function(args){

			lang.mixin(this, args);
			this.items = Credentials.get("allowedModules");
		},

		postCreate: function() {

			this.inherited(arguments); // PostCreate del padre
			this.createStructure(this.checkItems());
		},

		checkItems: function() {
			// summary:
			// 	Recorre los items recibidos y devuelve los módulos correspondientes.
			// returns:
			// 	Array con los módulos a mostrar

			var result = [],
				items = {},
				item;

			// Pasamos los datos de los módulos a formato objeto para comprobar más rapido luego
			for (var i = 0; i < this.items.length; i++) {

				item = this.items[i];
				var obj = items[item.name] = item;

				obj.subItems = {};

				if (item.modules) {
					for (var j = 0; j < item.modules.length; j++) {
						var subItem = item.modules[j],
							subObj = obj.subItems[subItem.name] = subItem;
					}
				}

				delete obj.modules;
			}

			for (item in this.elements) {
				if (items[item]) {
					var subelements = this.elements[item];
					for (var subitem in subelements) {
						if (items[item].subItems[subitem]) {

							var label = subitem !== "list" ? subitem : item;

							if (item == "catalog") {
								label = subitem.split("-")[0] + "CatalogView";
							}

							var moduleName = this.i18n[label + this.suffixI18n] || this.i18n[label],
								moduleIcon = items[item].subItems[subitem].icon,
								iconPrefix = moduleIcon.split("-")[0],
								icon = iconPrefix + " " + moduleIcon;

							result.push(
								new Module({
									url: "/" + item + "/" + subitem,
									name: moduleName,
									icon: icon,
									domain: false
								})
							);
						}
					}
				}
			}

			for (i = 0; i < this.hrefs.length; i++) {
				var href = this.hrefs[i],
					iconHref = href.icon,
					iconHrefPrefix = iconHref.split("-")[0];

				iconHref = iconHrefPrefix + " " + iconHref;

				result.push(
					new Module({
						url: href.url,
						name: this.i18n[href.label] || href.label,
						icon: iconHref,
						domain: false
					})
				);
			}

			return result;	// return Array
		},

		createStructure: function(/*Array*/ modules) {

			this.favouritesContainerNode = put(this.contentNode, 'div.favouritesBoxItems');

			for (var i = 0; i < modules.length; i++) {
				modules[i].placeAt(this.favouritesContainerNode);
			}
		}
	});
});
