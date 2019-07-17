define([
	'app/designs/base/_Layout'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
], function(
	_Layout
	, declare
	, lang
	, put
) {

	return declare(_Layout, {
		//	summary:
		//		Layout con dos contenedores (primario y secundario) para contenido dinámico.

		constructor: function(args) {

			this.config = {
				primaryContentClass: 'primaryContent',
				secondaryContentClass: 'secondaryContent'
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._createSecondaryNode();
			this._createPrimaryNode();
		},

		_createPrimaryNode: function() {

			this.primaryNode = put(this.domNode, 'div.' + this.primaryContentClass);
		},

		_createSecondaryNode: function() {

			this.secondaryNode = put(this.domNode, 'div.' + this.secondaryContentClass);
		}
	});
});
