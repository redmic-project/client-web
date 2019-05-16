define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/query"
	, "dojo/i18n!app/nls/metaTags"
	, "redmic/modules/base/_Module"
	, "dojo/NodeList-manipulate"
], function(
	declare
	, lang
	, query
	, i18n
	, _Module
){
	return declare(_Module, {
		//	summary:
		//		Módulo para poner los meta-tags en las páginas
		//	description:
		//		El router indica a la vista a mostrar si debe enviar meta-tags cuando le hace show.
		//		La nueva vista publicará al módulo metaTags los datos necesarios para generar los
		//		meta de la vista que se va a cargar
		//		Finalmente hace un replace de esos datos con el i18n y los añade al head


		constructor: function(args) {

			this.config = {
				// own actions
				actions: {
					PUT_META_TAGS: "putMetaTags"
				},
				// mediator params
				ownChannel: "metaTags",

				metaTags : ["description","keywords", "author", "og:title", "og:description"],

				baseMetaTags: {
					"og:type": "website",
					"og:url": window.location.href,
					"og:image": "https://redmic.es/resources/images/logos/redmic-logo-1200x1200.jpg",
					"og:image:type": "image/jpeg",
					"og:image:width": "1200",
					"og:image:height": "1200",
					"og:site_name": "REDMIC",
					//"og:locale": "es_ES",
					//"og:locale:alternate": "en_EN",
					"robots": "index, follow",
					"viewport": "width=device-width, initial-scale=1.0"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("PUT_META_TAGS"),
				callback: "_subPutMetaTags"
			});
		},

		_subPutMetaTags: function(/*Object*/ metaTagsData) {
			//	summary:
			//		Se ejecuta cuando se recibe por mediator que una vista quiere publicar meta-tags
			//	tags:
			//		private
			//	metaTagsData: Object
			//		Datos que envía la vista para generar los meta-tags (clave traducción...)

			if (!metaTagsData.view) {
				return;
			}

			var content,
				node;

			this._setMetaTagTitle(metaTagsData);

			for (var i=0; i<this.metaTags.length; i++) {
				content = this._generateContent(metaTagsData, this.metaTags[i]);
				node = this._getNodeToPutMeta(this.metaTags[i]);
				node.content = content;
			}

			for (var item in this.baseMetaTags) {
				var metaDefault = this.baseMetaTags[item];
				// Recalcular la url
				if (item === "og:url") {
					metaTagsData[item] = window.location.href;
				}

				content = metaTagsData[item] ? metaTagsData[item] : metaDefault;
				node = this._getNodeToPutMeta(item);
				node.content = content;
			}
		},

		_setMetaTagTitle: function(/*Object*/ metaTagsData) {
			//	summary:
			//		Genera y setea el contenido del meta "title" que conlleva un tratamiento especial
			//	tags:
			//		private
			//	metaTagsData: Object
			//		Datos que envía la vista para generar los meta-tags (clave traducción...)

			var node = query("title");

			if (node.length < 1) {
				query("head").append('<title></title>');
				node = query("title");
			}

			node.innerHTML("REDMIC | " +
				((metaTagsData.view && i18n[metaTagsData.view] && i18n[metaTagsData.view].title) ?
					lang.replace(i18n[metaTagsData.view].title, metaTagsData.data) :
					i18n["default"].title));
		},

		_generateContent: function(/*Object*/ metaTagsData, /*String*/ item) {
			//	summary:
			//		Genera el contenido del meta a partir de la información enviada por la
			//		vista y el i18n, en caso de no estar disponible, devuelve la de por defecto.
			//	tags:
			//		private
			//	metaTagsData: Object
			//		Datos que envía la vista para generar los meta-tags (clave traducción...)
			//	item: String
			//		Indica el tipo del meta que se está procesando

			var content = i18n[metaTagsData.view] && i18n[metaTagsData.view][item];

			if (content) {
				return lang.replace(content, metaTagsData.data);
			}

			return i18n["default"][item];
		},

		_getNodeToPutMeta: function(/*String*/ type) {
			//	summary:
			//		Si existe, obtiene el nodo del meta-tag, en caso contrario lo crea
			//	tags:
			//		private
			//	type: String
			//		Tipo del meta-tags

			(type.indexOf(":") > -1) ? id = "property" : id = "name";

			var node = query("meta["+id+"='"+type+"']");

			if (node.length > 0) {
				return node[0];
			}

			return query("head").append('<meta '+id+'="'+type+'" content="">')[0].lastElementChild;
		}
	});
});