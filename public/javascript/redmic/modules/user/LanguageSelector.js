define([
	'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/kernel'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/base/_ShowInTooltip'
	, 'redmic/modules/base/_ShowOnEvt'
	, 'redmic/modules/layout/listMenu/ListMenu'
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
){
	return declare([_Module, _Show], {
		//	summary:
		//		Módulo selector de idioma.
		//	description:
		//		Muestra un listado de idiomas para traducir la app.

		constructor: function(args) {

			this.config = {
				ownChannel: 'languageSelector'
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

			put(this.domNode, '.languageSelector');

			this.containerNode = put(this.domNode, 'div[title=$]', this.i18n.language);

			this.iconNode = put(this.containerNode, 'i.fa.fa-language');

			this.listMenu = new declare([ListMenu, _ShowOnEvt]).extend(_ShowInTooltip)(this.listMenuConfig);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.listMenu.getChannel('EVENT_ITEM'),
				callback: '_subEventItem'
			});
		},

		postCreate: function() {

			this._publish(this.listMenu.getChannel('ADD_EVT'), {
				sourceNode: this.iconNode
			});

			this.inherited(arguments);
		},

		_subEventItem: function(response) {

			var cbk = response.callback;

			cbk && this[cbk](response);
		},

		_changeLanguage: function(itemObj) {

			var language = itemObj.value,
				currentUrl = window.location,
				protocol = currentUrl.protocol,
				hostname = currentUrl.hostname,
				hostnameWithoutLang = hostname.replace(kernel.locale + '.', '');

			window.location.href = protocol + '//' + language + '.' + hostnameWithoutLang;
		},

		_getNodeToShow: function() {

			return this.domNode;
		}
	});
});
