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
		//		Layout para vistas que contienen una barra superior y un contenido central

		constructor: function(args) {

			this.config = {
				layoutAdditionalClasses: 'topAndCenterContentLayoutEmbeddedContentWithTopbarDesign',
				topClass: "embeddedContentTopbar",
				centerClass: "embeddedContentContainer"
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._createTopbarNode();
			this._createCenterNode();
		},

		_createTopbarNode: function(container) {

			var topContent = put(this.domNode, 'div.' + this.topClass);

			this._titleNode = put(topContent, "div.titleZone");
			this._setTitle(this.title);

			this._optionNode = put(topContent, "div.optionZone");
			this.buttonsNode = put(this._optionNode, "div.keypadZone");
		},

		_createCenterNode: function(container) {

			this.centerContainer = put(this.domNode, 'div.' + this.centerClass);
		}
	});
});
