define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
], function (
	declare
	, lang
	, put
	, _Module
	, _Show
) {

	return declare([_Module, _Show], {
		//	summary:
		//		Módulo que permite mostrar un contenido genérico que reciba, ya sea otro módulo o un nodo simple.

		constructor: function(args) {

			this.config = {
				ownChannel: 'genericDisplayer',
				events: {
					'ADD_CONTENT': 'addContent'
				},
				actions: {
					'ADD_CONTENT': 'addContent',
					'ADD_TOPBAR_CONTENT': 'addTopbarContent',
					'REMOVE_TOPBAR_CONTENT': 'removeTopbarContent'
				},

				layoutClass: 'genericDisplayer',
				contentClass: 'centerZone',
				additionalLayoutClasses: null,
				additionalContentClasses: null,
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel('ADD_CONTENT'),
				callback: '_subAddContent'
			});
		},

		postCreate: function() {

			var ownNode = this._getNodeToShow(),
				layoutClasses = this.layoutClass,
				contentClasses = this.contentClass;

			if (this.additionalLayoutClasses) {
				layoutClasses += '.' + this.additionalLayoutClasses;
			}

			put(ownNode, '.' + layoutClasses);

			if (this.additionalContentClasses) {
				contentClasses += '.' + this.additionalContentClasses;
			}

			this._contentNode = put(ownNode, 'div.' + contentClasses);

			if (this.content) {
				this._addGenericContent(this.content);
			}
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_subAddContent: function(req) {

			var content = req.content;

			if (!content) {
				console.error('No content received to show at module "%s"', this.getChannel());
				return;
			}

			this._addGenericContent(content, req);
		},

		_addGenericContent: function(content, req) {

			this._removeOldContent();

			if (content.getChannel) {
				this._addModuleContent(content, req || {});
			} else {
				this._addNodeContent(content);
			}
		},

		_addModuleContent: function(contentModule, req) {

			this._oldContentModule = contentModule;

			var showProps = req.showProps || {};

			var showRequestObj = this._merge([showProps, {
				node: this._contentNode
			}]);

			this._publish(contentModule.getChannel('SHOW'), showRequestObj);
		},

		_addNodeContent: function(contentNode) {

			this._oldContentNode = put(this._contentNode, contentNode);
		},

		_removeOldContent: function() {

			if (this._oldContentModule) {
				this._publish(this._oldContentModule.getChannel('HIDE'));
			}

			if (this._oldContentNode) {
				put('!', this._oldContentNode);
			}
		}
	});
});
