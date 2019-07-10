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

		// TODO sustituto de método de dijit, cuando se resuelvan todas las dependencias, eliminar y usar el interno
		addChild: function(child) {

			this._addNodeToLayout(child);
		},

		_getNodeToShow: function() {

			return this.domNode;
		}
	});
});
