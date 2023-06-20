define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, './GenericDisplayer'
], function (
	declare
	, lang
	, put
	, GenericDisplayer
) {

	return declare(GenericDisplayer, {
		//	summary:
		//		Implementación del módulo que permite mostrar un contenido genérico (módulo o no) junto con una barra
		//		superior.

		constructor: function(args) {

			this.config = {
				topbarClass: 'topZone',
				titleClass: 'titleZone',
				titleContentClass: 'titleContent',
				topbarContentClass: 'topbarContent',

				title: 'contentWithTopbar',

				_topbarContentNodes: []
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel : this.getChannel('ADD_TOPBAR_CONTENT'),
				callback: '_subAddTopbarContent'
			});
		},

		postCreate: function() {

			this._topbarNode = put(this._getNodeToShow(), 'div.' + this.topbarClass);

			this._titleNode = put(this._topbarNode, 'div.' + this.titleClass);
			this._addTitle(this.title);

			this.inherited(arguments);
		},

		_subAddTopbarContent: function(req) {

			var content = req.content;

			if (!content) {
				console.error('No topbar content received to show at module "%s"', this.getChannel());
				return;
			}

			this._addTopbarContent(content);
		},

		_addTopbarContent: function(content) {

			var contentParentNode = put(this._topbarNode, 'div.' + this.topbarContentClass);

			this._topbarContentNodes.push(contentParentNode);

			if (content.getChannel) {
				this._addModuleTopbarContent(content, contentParentNode);
			} else {
				this._addNodeTopbarContent(content, contentParentNode);
			}
		},

		_addModuleTopbarContent: function(contentModule, contentParentNode) {

			this._oldContentModule = contentModule;

			this._publish(contentModule.getChannel('SHOW'), {
				node: contentParentNode
			});
		},

		_addNodeTopbarContent: function(contentNode, contentParentNode) {

			this._oldContentNode = put(contentParentNode, contentNode);
		},

		_onTitlePropSet: function(propEvt) {

			this._addTitle(propEvt.value);
		},

		_addTitle: function(title) {

			if (this._oldTitleContentNode) {
				put('!', this._oldTitleContentNode);
			}

			this._oldTitleContentNode = put(this._titleNode, 'span.' + this.titleContentClass, title);
		}
	});
});
