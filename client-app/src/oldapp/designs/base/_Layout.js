define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, './_LayoutItfc'
], function(
	declare
	, lang
	, put
	, _LayoutItfc
) {

	return declare(_LayoutItfc, {
		//	summary:
		//		Base para los layout.

		constructor: function(args) {

			this.config = {
				layoutClass: 'designLayoutContainer'
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._createLayoutContainer();
		},

		_createLayoutContainer: function() {

			var classNames = this.layoutClass;

			if (this.layoutAdditionalClasses) {
				classNames += ' ' + this.layoutAdditionalClasses;
			}

			classNames = classNames.replace(/\ /g, '.');
			put(this.domNode, '.' + classNames);
		},

		_addNodeToLayout: function(child) {

			if (!child) {
				console.error('Tried to add invalid child to layout: "%s"', this.getChannel());
				return;
			}

			var childNode = child.domNode || child;

			put(this.domNode, childNode);
		},

		_updateTitleClassSelector: function() {

			var node = this._getTitleNode();
			node && put(node, this.titleClassSelector);
		},

		_updateTitle: function(title) {

			var titleNode = this._getTitleNode(),
				titleValue = title || this.title;

			if (!titleNode) {
				return;
			}

			put(titleNode, '[title=$]', titleValue);
			titleNode.innerHTML = titleValue;
		},

		_setTitle: function(title) {

			if (this.titleSpanNode) {
				put(this.titleSpanNode, "!");
			}

			this.titleSpanNode = put(this._titleNode, "span[title=$].designLayoutTitle", title, title);
		},

		_getTitleNode: function() {

			return this.titleSpanNode;
		},

		// TODO sustituto de método de dijit, cuando se resuelvan todas las dependencias, eliminar y usar el interno
		addChild: function(child) {

			this._addNodeToLayout(child);
		},

		getNodeToShow: function() {

			return this.domNode;
		}
	});
});
