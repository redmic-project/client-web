define([
	'app/designs/base/_Layout'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector'
], function(
	_Layout
	, declare
	, lang
	, put
) {

	return declare(_Layout, {
		//	summary:
		//		Layout para vistas que contienen un formulario y un listado.

		constructor: function(args) {

			this.config = {
				layoutAdditionalClasses: 'layoutListDesign'
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this.parentTopNode = put(this.domNode, "div");

			this.topNode = put(this.domNode, "div.topZone");

			this._titleNode = put(this.topNode, "div.titleZone");

			this._setTitle(this.title);

			this.keypadZoneNode = put(this.topNode, "div.keypadZone");

			put(this.titleSpanNode, "a[href]");

			this.centerNode = put(this.domNode, "div.centerZone");

			this.listNode = put(this.centerNode, "div.listZone");
		}
	});
});
