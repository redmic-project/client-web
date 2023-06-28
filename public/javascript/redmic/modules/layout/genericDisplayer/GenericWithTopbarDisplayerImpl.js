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

				_topbarContentNodes: {}
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel : this.getChannel('ADD_TOPBAR_CONTENT'),
				callback: '_subAddTopbarContent'
			},{
				channel : this.getChannel('REMOVE_TOPBAR_CONTENT'),
				callback: '_subRemoveTopbarContent'
			});
		},

		postCreate: function() {

			this._topbarNode = put(this._getNodeToShow(), 'div.' + this.topbarClass);

			this._titleNode = put(this._topbarNode, 'div.' + this.titleClass);
			this._addTitle(this.title);

			this.inherited(arguments);
		},

		_onTitlePropSet: function(propEvt) {

			this._addTitle(propEvt.value);
		},

		_addTitle: function(title) {

			if (this._titleContentNode) {
				put('!', this._titleContentNode);
			}

			this._titleContentNode = put(this._titleNode, 'span.' + this.titleContentClass, title);
		},

		_subAddTopbarContent: function(req) {

			var content = req.content,
				prependToTitle = req.prependToTitle || false,
				additionalClasses = req.additionalTopbarContentClasses;

			if (!content) {
				console.error('No topbar content received to add at module "%s"', this.getChannel());
				return;
			}

			this._addTopbarContent(content, prependToTitle, additionalClasses);
		},

		_addTopbarContent: function(content, prependToTitle, additionalClasses) {

			var topbarContentClasses = this.topbarContentClass;
			if (additionalClasses) {
				topbarContentClasses += '.' + additionalClasses;
			}

			var contentParentNode = put(this._topbarNode, 'div.' + topbarContentClasses);

			if (prependToTitle) {
				put(this._titleNode, '-', contentParentNode);
			}

			if (content.getChannel) {
				this._addModuleTopbarContent(content, contentParentNode);
			} else {
				this._addNodeTopbarContent(content, contentParentNode);
			}
		},

		_addModuleTopbarContent: function(contentModule, contentParentNode) {

			var moduleChannel = contentModule.getChannel();
			this._topbarContentNodes[moduleChannel] = contentParentNode;

			this._publish(contentModule.getChannel('SHOW'), {
				node: contentParentNode
			});
		},

		_addNodeTopbarContent: function(contentNode, contentParentNode) {

			var nodeId = contentNode.id;

			if (!nodeId) {
				console.error('Received a topbar content node to add without ID at module "%s"', this.getChannel());
			} else {
				this._topbarContentNodes[nodeId] = contentParentNode;
			}

			put(contentParentNode, contentNode);
		},

		_subRemoveTopbarContent: function(req) {

			var content = req.content;

			if (!content) {
				console.error('No topbar content received to remove at module "%s"', this.getChannel());
				return;
			}

			this._removeTopbarContent(content);
		},

		_removeTopbarContent: function(content) {

			if (content.getChannel) {
				this._removeModuleTopbarContent(content);
			} else {
				this._removeNodeTopbarContent(content);
			}
		},

		_removeModuleTopbarContent: function(contentModule) {

			var moduleChannel = contentModule.getChannel(),
				contentParentNode = this._topbarContentNodes[moduleChannel];

			this._publish(contentModule.getChannel('HIDE'));

			this._removeTopbarContentParentNode(contentParentNode, moduleChannel);
		},

		_removeNodeTopbarContent: function(contentNode) {

			var nodeId = contentNode.id,
				contentParentNode = nodeId && this._topbarContentNodes[nodeId];

			this._removeTopbarContentParentNode(contentParentNode, nodeId);
		},

		_removeTopbarContentParentNode: function(contentParentNode, contentId) {

			if (!contentParentNode) {
				console.error('No topbar content node found to remove at module "%s"', this.getChannel());
				return;
			}

			put('!', contentParentNode);
			delete this._topbarContentNodes[contentId];
		}
	});
});
