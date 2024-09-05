define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/query'
	, 'src/app/component/meta/metaTagsContent'
	, 'src/component/base/_Module'
], function(
	declare
	, lang
	, query
	, metaTagsContent
	, _Module
) {

	return declare(_Module, {
		//	summary:
		//		Módulo para poner los meta-tags dinámicos en las páginas
		//	description:
		//		Este módulo procesa y aplica los meta-tags que dependen del contenido de la vista actual, ya que los
		//		de valor fijo o resolubles de forma global se aplican directamente desde las plantillas pug.
		//		El módulo Router indica a la vista a mostrar si debe enviar meta-tags cuando le hace show.
		//		La nueva vista publicará a este módulo MetaTags los datos necesarios para generar sus meta-tags. También
		//		es capaz de recibir sobrescrituras directas de meta-tags concretos.
		//		Aparte de los datos que aporta la vista, se reemplazan las variables {i18n.xxx} y {hostname}.
		//		Finalmente, reemplaza variables usando esos datos con soporte de traducciones y los aplica al head.

		constructor: function(args) {

			this.config = {
				ownChannel: 'metaTags',
				actions: {
					PUT_META_TAGS: 'putMetaTags'
				},

				ogTitleLimit: 60,
				twitterTitleLimit: 70,
				ogDescriptionLimit: 200,
				twitterDescriptionLimit: 200,

				_headNode: globalThis.document.getElementsByTagName('head')[0],
				_defaultKey: 'default'
			};

			if (args && args.ecomarcan) {
				this.config.nativeTitleSuffix = 'ECOMARCAN';
			} else {
				this.config.nativeTitleSuffix = 'REDMIC';
			}

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel('PUT_META_TAGS'),
				callback: '_subPutMetaTags'
			});
		},

		_subPutMetaTags: function(/*Object*/ metaTagsData) {
			//	summary:
			//		Recibe los datos de una vista quiere asignar meta-tags.
			//	tags:
			//		private
			//	metaTagsData: Object
			//		Datos que envía la vista para generar los meta-tags (clave traducción, datos y sobrescrituras)

			var viewKey = metaTagsData.view,
				viewData = metaTagsData.data || {},
				viewMetaTags = metaTagsData.metaTags || {};

			if (!viewKey) {
				return;
			}

			var currUrl = globalThis.location.href,
				hostname = new URL(currUrl).hostname;

			viewData.hostname = hostname;
			viewData.i18n = this.i18n;

			this._setTranslatableMetaTags(viewKey, viewData);
			this._setUrlMetaTags(currUrl);
			this._setAdditionalMetaTags(viewMetaTags);
		},

		_setTranslatableMetaTags: function(/*String*/ viewKey, /*Object*/ viewData) {
			//	summary:
			//		Manda a aplicar los meta-tags dependientes del idioma actual.
			//	tags:
			//		private
			//	viewKey: String
			//		Clave que contiene los meta-tags traducibles de la vista.
			//	viewData: Object
			//		Datos concretos que envía la vista para reemplazar variables en los meta-tags.

			var viewLocaleMetaTags = metaTagsContent[viewKey] || metaTagsContent[this._defaultKey];

			this._setTitleMetaTags(viewLocaleMetaTags, viewData);
			this._setDescriptionMetaTags(viewLocaleMetaTags, viewData);
			this._setImageMetaTags(viewLocaleMetaTags, viewData);
		},

		_setTitleMetaTags: function(/*Object*/ viewLocaleMetaTags, /*Object*/ viewData) {
			//	summary:
			//		Genera y setea el contenido del tag 'title' y de otros meta-tags de título.
			//	tags:
			//		private
			//	viewLocaleMetaTags: Object
			//		Meta-tags traducidos de la vista.
			//	viewData: Object
			//		Datos concretos que envía la vista para reemplazar variables en los meta-tags.

			var customTitle = this._getMetaTagValue('title', viewLocaleMetaTags, viewData);

			// Title nativo
			globalThis.document.title = customTitle + ' | ' + this.nativeTitleSuffix;

			// Open Graph
			var ogTag = 'og:title',
				customOgTitle = this._getMetaTagValue(ogTag, viewLocaleMetaTags, viewData) || customTitle;

			this._addMetaTag(ogTag, 'property', customOgTitle.substring(0, this.ogTitleLimit));

			// Twitter
			var twitterTag = 'twitter:title',
				customTwitterTitle = this._getMetaTagValue(twitterTag, viewLocaleMetaTags, viewData) || customTitle;

			this._addMetaTag(twitterTag, 'name', customTwitterTitle.substring(0, this.twitterTitleLimit));
		},

		_setDescriptionMetaTags: function(/*Object*/ viewLocaleMetaTags, /*Object*/ viewData) {
			//	summary:
			//		Genera y setea el contenido de los meta-tags de descripción.
			//	tags:
			//		private
			//	viewLocaleMetaTags: Object
			//		Meta-tags traducidos de la vista.
			//	viewData: Object
			//		Datos concretos que envía la vista para reemplazar variables en los meta-tags.

			var customDescription = this._getMetaTagValue('description', viewLocaleMetaTags, viewData);

			// Open Graph
			var ogTag = 'og:description',
				customOgDescription = this._getMetaTagValue(ogTag, viewLocaleMetaTags, viewData) || customDescription;

			this._addMetaTag(ogTag, 'property', customOgDescription.substring(0, this.ogDescriptionLimit));

			// Twitter
			var twitterTag = 'twitter:title',
				customTwitterDescription = this._getMetaTagValue(twitterTag, viewLocaleMetaTags, viewData) ||
					customDescription;

			this._addMetaTag(twitterTag, 'name', customTwitterDescription.substring(0, this.twitterDescriptionLimit));
		},

		_setImageMetaTags: function(/*Object*/ viewLocaleMetaTags, /*Object*/ viewData) {
			//	summary:
			//		Genera y setea el contenido de los meta-tags de imagen.
			//	tags:
			//		private
			//	viewLocaleMetaTags: Object
			//		Meta-tags traducidos de la vista.
			//	viewData: Object
			//		Datos concretos que envía la vista para reemplazar variables en los meta-tags.

			var customImage = this._getMetaTagValue('image', viewLocaleMetaTags, viewData),
				customImageAlt = this._getMetaTagValue('image:alt', viewLocaleMetaTags, viewData),
				customImageType = this._getMetaTagValue('image:type', viewLocaleMetaTags, viewData),
				customImageWidth = this._getMetaTagValue('image:width', viewLocaleMetaTags, viewData),
				customImageHeight = this._getMetaTagValue('image:height', viewLocaleMetaTags, viewData);

			// Open Graph
			var ogImageTag = 'og:image',
				customOgImage = this._getMetaTagValue(ogImageTag, viewLocaleMetaTags, viewData) || customImage;

			this._addMetaTag(ogImageTag, 'property', customOgImage);

			var ogImageAltTag = 'og:image:alt',
				customOgImageAlt = this._getMetaTagValue(ogImageAltTag, viewLocaleMetaTags, viewData) || customImageAlt;

			this._addMetaTag(ogImageAltTag, 'property', customOgImageAlt);

			var ogImageTypeTag = 'og:image:type',
				customOgImageType = this._getMetaTagValue(ogImageTypeTag, viewLocaleMetaTags, viewData) ||
					customImageType;

			this._addMetaTag(ogImageTypeTag, 'property', customOgImageType);

			var ogImageWidthTag = 'og:image:width',
				customOgImageWidth = this._getMetaTagValue(ogImageWidthTag, viewLocaleMetaTags, viewData) ||
					customImageWidth;

			this._addMetaTag(ogImageWidthTag, 'property', customOgImageWidth);

			var ogImageHeightTag = 'og:image:height',
				customOgImageHeight = this._getMetaTagValue(ogImageHeightTag, viewLocaleMetaTags, viewData) ||
					customImageHeight;

			this._addMetaTag(ogImageHeightTag, 'property', customOgImageHeight);

			// Twitter
			var twitterImageTag = 'twitter:image',
				customTwitterImage = this._getMetaTagValue(twitterImageTag, viewLocaleMetaTags, viewData) ||
					customImage;

			this._addMetaTag(twitterImageTag, 'name', customTwitterImage);

			var twitterImageAltTag = 'twitter:image:alt',
				customTwitterImageAlt = this._getMetaTagValue(twitterImageAltTag, viewLocaleMetaTags, viewData) ||
					customImageAlt;

			this._addMetaTag(twitterImageAltTag, 'name', customTwitterImageAlt);
		},

		_setUrlMetaTags: function(/*String*/ currUrl) {
			//	summary:
			//		Genera y setea el contenido de los meta-tags de URL.
			//	tags:
			//		private
			//	tagIdValue: String
			//		Valor de URL en el momento de aplicar los meta-tags.

			// Open Graph
			this._addMetaTag('og:url', 'property', currUrl);

			// Twitter
			this._addMetaTag('twitter:url', 'name', currUrl);
		},

		_setAdditionalMetaTags: function(/*Object*/ viewMetaTags) {
			//	summary:
			//		Genera y setea el contenido de los meta-tags adicionales que la vista desea asignar.
			//	tags:
			//		private
			//	viewMetaTags: Object
			//		Meta-tags que provee la vista para sobrescribir el valor por defecto.

			for (var item in viewMetaTags) {
				var tagIdProperty = item.propName || 'name',
					tagIdValue = item.id,
					tagContent = item.content;

				this._addMetaTag(tagIdValue, tagIdProperty, tagContent);
			}
		},

		_getMetaTagValue: function(/*String*/ tagIdValue, /*Object*/ viewLocaleMetaTags, /*Object*/ viewData) {
			//	summary:
			//		Obtiene el valor del meta-tag deseado en la especificación localizada para la vista que se
			//		proporciona, o en la especificación por defecto si no se ha encontrado el valor.
			//	tags:
			//		private
			//	tagIdValue: String
			//		Nombre del meta-tag deseado (valor del identificador).
			//	viewLocaleMetaTags: Object
			//		Meta-tags traducidos de la vista.
			//	viewData: Object
			//		Datos concretos que envía la vista para reemplazar variables en los meta-tags.

			var viewTagValue = viewLocaleMetaTags[tagIdValue] || metaTagsContent[this._defaultKey][tagIdValue];

			return viewTagValue ? lang.replace(viewTagValue, viewData) : null;
		},

		_addMetaTag: function(/*String*/ tagIdValue, /*String*/ tagIdProperty, /*String*/ tagContent) {
			//	summary:
			//		Genera o actualiza el nodo para el meta-tag proporcionado.
			//	tags:
			//		private
			//	tagIdValue: String
			//		Nombre del meta-tag (valor del identificador).
			//	tagIdProperty: String
			//		Identificador que recibe el nombre del meta-tag (nombre del identificador), 'name' o 'property'.
			//	tagContent: String
			//		Contenido del meta-tag.

			var metaTagIdDefinition = tagIdProperty + '="' + tagIdValue + '"',
				metaTagNodes = query('meta[' + metaTagIdDefinition + ']', this._headNode),
				metaTagNode;

			if (metaTagNodes.length > 0) {
				metaTagNode = metaTagNodes[0];
				metaTagNode.content = tagContent;
			} else {
				metaTagNode = globalThis.document.createElement('meta');
				metaTagNode.setAttribute(tagIdProperty, tagIdValue);
				metaTagNode.content = tagContent;
				this._headNode.appendChild(metaTagNode);
			}
		}
	});
});
