define([
	"dijit/layout/BorderContainer"
	, "dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function (
	BorderContainer
	, ContentPane
	, declare
	, lang
){
	return declare(ContentPane, {
		//	summary:
		//		Layout con dos contenedores (primario y secundario) para contenido dinámico.

		constructor: function(args) {

			this.config = {
				primaryContentRegion: "center"
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			var contentNode = new BorderContainer();

			this._createPrimaryNode(contentNode);
			this._createSecondaryNode(contentNode);

			this.addChild(contentNode);

			contentNode.startup();
		},

		_createSecondaryNode: function(container) {

			var secondaryContent = new ContentPane({
				region: this.secondaryContentRegion,
				splitter: this.secondaryContentSplitter
			});

			container.addChild(secondaryContent);
			this.secondaryNode = secondaryContent.domNode;
		},

		_createPrimaryNode: function(container) {

			var primaryContent = new ContentPane({
				region: this.primaryContentRegion
			});

			container.addChild(primaryContent);
			this.primaryNode = primaryContent.domNode;
		}
	});
});
