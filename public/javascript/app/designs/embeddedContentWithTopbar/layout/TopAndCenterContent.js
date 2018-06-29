define([
	"dijit/layout/BorderContainer"
	, "dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
], function (
	BorderContainer
	, ContentPane
	, declare
	, lang
	, put
){

	return declare(ContentPane, {
		//	summary:
		//		Layout para vistas que contienen una barra superior y un contenido central


		constructor: function(args) {

			this.config = {
				topClass: "embeddedContentTopbar",
				centerClass: "embeddedContentContainer"
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			var contentNode = new BorderContainer();
			this.addChild(contentNode);

			this._createTopbarNode(contentNode);
			this._createCenterNode(contentNode);

			this.inherited(arguments);
		},

		_createTopbarNode: function(container) {

			var topContent = new ContentPane({
				'class': this.topClass,
				region: "top"
			});

			container.addChild(topContent);

			this._titleNode = put(topContent.domNode, "div.titleZone.col-xs-6.col-sm-7.col-md-8.col-lg-9.col-xl-9");
			this._setTitle(this.title);

			this._optionNode = put(topContent.domNode, "div.optionZone.col-xs-6.col-sm-5.col-md-4.col-lg-3.col-xl-3");
			this.buttonsNode = put(this._optionNode, "div.keypadZone");
		},

		_createCenterNode: function(container) {

			var centerContainer = new ContentPane({
				'class': this.centerClass,
				region: "center"
			});

			container.addChild(centerContainer);

			this.centerContent = new BorderContainer();
			centerContainer.addChild(this.centerContent);
		}
	});
});