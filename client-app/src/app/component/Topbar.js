define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/user/FullscreenToggle'
	, 'src/component/user/LanguageSelector'
	, 'src/component/user/UserArea'
	, 'src/redmicConfig'
], function(
	declare
	, lang
	, put
	, _Module
	, _Show
	, FullscreenToggle
	, LanguageSelector
	, UserArea
	, redmicConfig
) {

	return declare([_Module, _Show], {
		//	summary:
		//		Componente que controla la barra superior, siempre visible y compartida para toda la aplicación (salvo
		//		para la zona externa).

		constructor: function(args) {

			this.config = {
				ownChannel: 'topbar',
				'class': 'topbar',

				collapseButtonClass: 'collapseSidebarButton',

				logoClass: 'topbarLogo',
				logoHref: '/home',
				logoImgSrc: '/res/images/logos/logo.svg',
				logoTextContent: 'ECOMARCAN',

				_isProductionEnvironment: (/true/i).test(redmicConfig.getEnvVariableValue('envProduction'))
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.userArea = new UserArea({
				parentChannel: this.getChannel()
			});

			this.languageSelector = new LanguageSelector({
				parentChannel: this.getChannel()
			});

			this.fullscreenToggle = new FullscreenToggle({
				parentChannel: this.getChannel()
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._createCollapseNode();
			this._createLogoNode();
			this._createContentNode();
		},

		_createCollapseNode: function() {

			var collapseNode = put(this.domNode, 'div.' + this.collapseButtonClass);

			collapseNode.onclick = lang.hitch(this, this._onCollapseClicked);
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

		_createContentNode: function() {

			var contentNode = put(this.domNode, 'div.topbarContent'),
				centerNode = put(contentNode, 'div.center'),
				buttonsNode = put(contentNode, 'div.buttons');

			this._addGobCanLogos(centerNode);

			if (!this._isProductionEnvironment) {
				put(contentNode, '.appDev');
				put(centerNode, 'span.fontExo2', this.i18n.messageAppDev);
			}

			this._showModules(buttonsNode);
		},

		_addGobCanLogos: function(containerNode) {

			var logosContainer = put(containerNode, 'div.gobcan-logos');

			put(logosContainer, 'img[src=/res/images/logos/gobcan-logos.png]');
		},

		_showModules: function(containerNode) {

			// TODO notification es global, pero se podría separar su botón como módulo independiente y crearlo aquí
			this._publish(this._buildChannel(this.notificationChannel, this.actions.SHOW), {
				node: containerNode
			});

			this._publish(this.fullscreenToggle.getChannel('SHOW'), {
				node: containerNode
			});

			this._publish(this.languageSelector.getChannel('SHOW'), {
				node: containerNode
			});

			this._publish(this.userArea.getChannel('SHOW'), {
				node: containerNode
			});
		},

		_onCollapseClicked: function() {

			this._publish(this._buildChannel(this.innerAppChannel, 'toggleSidebar'));
		}
	});
});
