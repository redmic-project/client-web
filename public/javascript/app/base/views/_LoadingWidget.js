define([
	"dojo/_base/declare"
	, "dijit/_WidgetBase"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "dojo/dom-class"
	, "dojo/domReady!"
    , "dojo/when"
    , "dojo/dom-construct"
], function(
	declare
	, _WidgetBase
	, lang
	, put
	, domClass
	, domReady
	, when
	, domConstruct
) {
	return declare(_WidgetBase, {
		//	summary:
		//		Widget
		//
		// description:
		//
		//		Author:  Carlos Glez
		//		<br>
		//		Last Update: 09/12/2014 - Carlos

		constructor: function(args) {

			lang.mixin(this, args);
		},

		postCreate: function() {
			this.inherited(arguments);

			domClass.add(this.contentNode, "hidden");
			this.loadingNode = put(this.containerNode ? this.containerNode : this.domNode, "div.loadingContainer");
			put(this.loadingNode, "span.fa.fa-refresh.symbolG.spinningElement");

			when(this.load(), lang.hitch(this, this._hiddenLoading), lang.hitch(this._errorLoad));
		},

		reload: function() {
			domConstruct.empty(this.contentNode);
			domClass.add(this.contentNode, "hidden");
			domClass.remove(this.loadingNode, "hidden");
			when(this.load(), lang.hitch(this, this._hiddenLoading), lang.hitch(this._errorLoad));
		},

		/*
		load: function() {

		},

		loading: function() {

		},

		loaded: function() {

		}
		*/

		_hiddenLoading: function() {
			domClass.remove(this.contentNode, "hidden");
			domClass.add(this.loadingNode, "hidden");
		},

		_errorLoad: function() {

		}

	});
});
