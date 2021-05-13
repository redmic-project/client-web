define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/base/Manager'
	, 'redmic/modules/user/FullscreenToggle'
	, 'redmic/modules/user/LanguageSelector'
	, 'redmic/modules/user/UserArea'
], function(
	declare
	, lang
	, put
	, _Module
	, _Show
	, Manager
	, FullscreenToggle
	, LanguageSelector
	, UserArea
) {

	return declare([_Module, _Show], {
		//	summary:
		//		Widget que controla la barra superior, siempre visible y compartida.
		//	description:
		//		Zona común que comparten todos los módulos.

		constructor: function(args) {

			this.config = {
				ownChannel: 'topbar',
				'class': 'topbar',

				collapseButtonClass: 'collapseSidebarButton',

				logoClass: 'topbarLogo',
				logoHref: '/home',
				logoImgSrc: '/resources/images/logos/logo.svg',
				logoTextContent: 'REDMIC'
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
				managerNode = put(contentNode, 'div.manager'),
				buttonsNode = put(contentNode, 'div.buttons');

			this._createManagerNode(managerNode);
			this._showModules(buttonsNode);
		},

		_createManagerNode: function(containerNode) {

			// TODO integrar manager con topbar, manager está desfasado casi por completo
			this._manager = new Manager({
				//parentChannel: this.getChannel()
				parentChannel: this.getParentChannel()
			}, containerNode);
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
