define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/dom-class"
	, "put-selector/put"
	, "./_Select"
], function(
	declare
	, lang
	, aspect
	, domClass
	, put
	, _Select
){
	return declare(_Select, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				hierarchicalSelectEvents: {},
				hierarchicalSelectActions: {
					MIXED: "mixed"
				},
				mixedSelectionContainerClass: 'mixedSelectContainerRow',
				mixedSelection: true
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixHierarchicalSelectEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineHierarchicalSelectSubscriptions));

			aspect.before(this, "_selectChangeBackground", lang.hitch(this, this._mixedDeselectChangeBackground));
			aspect.before(this, "_deselectChangeBackground", lang.hitch(this, this._mixedDeselectChangeBackground));
		},

		_mixHierarchicalSelectEventsAndActions: function () {

			lang.mixin(this.events, this.hierarchicalSelectEvents);
			lang.mixin(this.actions, this.hierarchicalSelectActions);

			delete this.hierarchicalSelectEvents;
			delete this.hierarchicalSelectActions;
		},

		_defineHierarchicalSelectSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("MIXED"),
				callback: "_subMixed"
			});
		},

		_subMixed: function(obj) {

			this._mixed(obj);
		},

		_mixed: function(obj) {

			this._mixedSelectChangeBackground();
			this._mixedSelected = true;
		},

		_mixedSelectChangeBackground: function() {

			this._deselect();

			if (!domClass.contains(this.domNode, this.mixedSelectionContainerClass)) {
				put(this.domNode, "." + this.mixedSelectionContainerClass);
			}
		},

		_mixedDeselectChangeBackground: function() {

			this._mixedSelected = false;

			put(this.domNode, "!" + this.mixedSelectionContainerClass);
		},

		_getParentNodeSelect: function() {

			if (this.expandCollapseNode) {
				return this.rowTopNode.children[1];
			}

			return this.rowTopNode.firstChild;
		}
	});
});
