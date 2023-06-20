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
					'ADD_TOPBAR_CONTENT': 'addTopbarContent'
				},

				layoutClass: 'genericDisplayer',
				contentClass: 'centerZone'
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

			var ownNode = this._getNodeToShow();

			put(ownNode, '.' + this.layoutClass);

			this._contentNode = put(ownNode, 'div.' + this.contentClass);

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

			this._addGenericContent(content);
		},

		_addGenericContent: function(content) {

			if (content.getChannel) {
				this._addModuleContent(content);
			} else {
				this._addNodeContent(content);
			}
		},

		_addModuleContent: function(contentModule) {

			this._removeOldContent();

			this._oldContentModule = contentModule;

			this._publish(contentModule.getChannel('SHOW'), {
				node: this._contentNode
			});
		},

		_addNodeContent: function(contentNode) {

			this._removeOldContent();

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
