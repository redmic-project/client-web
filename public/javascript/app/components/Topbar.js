define([
	"dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/modules/base/Manager"
], function(
	ContentPane
	, declare
	, lang
	, put
	, Manager
){
	return declare(ContentPane, {
		//	summary:
		//		Widget que controla la barra superior, siempre visible y compartida.
		//	description:
		//		Zona común que comparten todos los módulos.

		constructor: function(args) {

			this.config = {
				region: "top",
				'class': "topbar",
				logoClass: 'topbarLogo',
				logoHref: '/home',
				logoImgSrc: '/resources/images/logos/logo.svg',
				logoTextContent: 'REDMIC',
				doLayout: false,
				show: {
					left: true,
					right: true
				}
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			// Se crean los nodos
			this._collapseNode = put(this.domNode, "div.collapseSidebarButton");
			this._collapseNode.onclick = lang.hitch(this, this._onCollapseClicked);

			this._createLogoNode();

			if (this.show.left) {
				this.leftNode = put(this.domNode, "div.manager");
			}

			this.manager = new Manager({
				parentChannel: this.parentChannel
			}, this.leftNode);
		},

		_createLogoNode: function() {

			var classAttr = '.' + this.logoClass,
				hrefAttr = '[href="' + this.logoHref + '"]',
				singlePageAttr = '[d-state-url="true"]',
				titleAttr = '[title="' + this.i18n.home + '"]',
				logoNode = put(this.domNode, 'a' + classAttr + hrefAttr + singlePageAttr + titleAttr);

			put(logoNode, 'img[src="' + this.logoImgSrc + '"]');
			put(logoNode, 'span', this.logoTextContent);
		},

		_onCollapseClicked: function() {

			// TODO hacerlo en this en lugar de this.manager cuando topbar sea módulo
			this.manager._publish(this.manager._buildChannel(this.manager.rootChannel, 'toggleSidebar'));
		}
	});
});
