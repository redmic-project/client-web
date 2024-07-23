define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/kernel'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_ShowInTooltip'
	, 'src/component/base/_ShowOnEvt'
	, 'src/component/layout/listMenu/ListMenu'
], function(
	redmicConfig
	, declare
	, kernel
	, lang
	, put
	, _Module
	, _Show
	, _ShowInTooltip
	, _ShowOnEvt
	, ListMenu
) {

	return declare([_Module, _Show], {
		//	summary:
		//		Módulo selector de idioma.
		//	description:
		//		Muestra un listado de idiomas para traducir la app.

		constructor: function(args) {

			this.config = {
				ownChannel: 'languageSelector',
				'class': 'languageSelector'
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.listMenuConfig = this._merge([{
				parentChannel: this.getChannel(),
				items: [{
					icon: 'flag-icon-background.flag-icon-es',
					label: this.i18n.es,
					callback: '_changeLanguage',
					value: 'es'
				},{
					icon: 'flag-icon-background.flag-icon-gb',
					label: this.i18n.en,
					callback: '_changeLanguage',
					value: 'en'
				}]
			}, this.listMenuConfig || {}]);
		},

		_initialize: function() {

			this.listMenu = new declare([ListMenu, _ShowOnEvt]).extend(_ShowInTooltip)(this.listMenuConfig);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.listMenu.getChannel('EVENT_ITEM'),
				callback: '_subEventItem'
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			put(this.domNode, '[title=$]', this.i18n.language);

			var languageIcon = this._getLanguageIcon(window.lang);
			put(this.domNode, 'i.' + languageIcon);

			this._publish(this.listMenu.getChannel('ADD_EVT'), {
				sourceNode: this.domNode
			});
		},

		_subEventItem: function(res) {

			var cbk = res.callback;

			cbk && this[cbk](res);
		},

		_changeLanguage: function(itemObj) {

			var language = itemObj.value,
				currentUrl = window.location,
				protocol = currentUrl.protocol,
				hostname = currentUrl.hostname,
				hostnameWithoutLang = hostname.replace(kernel.locale + '.', '');

			window.location.href = protocol + '//' + language + '.' + hostnameWithoutLang;
		},

		_getLanguageIcon: function(currentLanguage) {

			var iconClasses;

			if (currentLanguage === 'es') {
				iconClasses = 'flag.flag-icon-background.flag-icon-es';
			} else if (currentLanguage === 'en') {
				iconClasses = 'flag.flag-icon-background.flag-icon-gb';
			} else {
				iconClasses = 'fa.fa-language';
			}

			return iconClasses;
		},

		_getNodeToShow: function() {

			return this.domNode;
		}
	});
});
