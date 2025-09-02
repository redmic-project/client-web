define([
	'dojo/_base/declare'
	, 'put-selector'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
], function (
	declare
	, put
	, _Module
	, _Show
) {

	const defaultConfig = {
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
		additionalContentClasses: null
	};

	return declare([_Module, _Show], {
		//	summary:
		//		Módulo que permite mostrar un contenido genérico que reciba, ya sea otro módulo o un nodo simple.

		postMixInProperties: function() {

			this._mergeOwnAttributes(defaultConfig);

			// TODO por algún motivo, si el atributo content es una instancia de componente Browser, la mezcla de
			// parámetros sufre un bucle infinito, seguramente por alguna referencia cíclica en sus estructuras.
			// Mantener este parche hasta que se solucione o se deje de pasar la instancia al construir este componente
			// (publicarla posteriormente en su lugar, o recibir su channel para gestionarla sin recibir la instancia).
			let externalContent;
			if (this.params?.content) {
				externalContent = this.params.content;
				delete this.params.content;
			}

			this.inherited(arguments);

			if (externalContent) {
				this.content = externalContent;
			}
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel('ADD_CONTENT'),
				callback: '_subAddContent'
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			var ownNode = this.getNodeToShow(),
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

		getNodeToShow: function() {

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
