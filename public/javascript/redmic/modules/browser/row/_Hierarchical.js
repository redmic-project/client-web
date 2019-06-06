define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
], function(
	declare
	, lang
	, aspect
	, put
){
	return declare(null, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				hierarchicalEvents: {
					EXPAND: "expand",
					COLLAPSE: "collapse"
				},
				hierarchicalActions: {
					EXPAND: "expand",
					COLLAPSE: "collapse",
					EXPANDED: "expanded",
					COLLAPSED: "collapsed",
					TRY_TO_UPDATE_EXPAND_COLLAPSE: "tryToUpdateExpandCollapse"
				},
				expandCollapseClass: "expandCollapse",
				expandIcon: "fa-caret-right",
				collapseIcon: "fa-caret-down",
				rowsContainerClass: "rowsContainer"
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixHierarchicalEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineHierarchicalSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineHierarchicalPublications));
			aspect.after(this, "_setOwnCallbacksForEvents", lang.hitch(this, this._setOwnHierarchicalCallbacksForEvents));

			aspect.after(this, "_createStructure", lang.hitch(this, this._createHierarchicalStructure));
			aspect.before(this, "_updateData", lang.hitch(this, this._updateHierarchicalData));
		},

		_mixHierarchicalEventsAndActions: function () {

			lang.mixin(this.events, this.hierarchicalEvents);
			lang.mixin(this.actions, this.hierarchicalActions);

			delete this.hierarchicalEvents;
			delete this.hierarchicalActions;
		},

		_defineHierarchicalSubscriptions: function () {

			var options = {
				predicate: lang.hitch(this, this._chkIsMine)
			};

			this.subscriptionsConfig.push({
				channel : this.getParentChannel("EXPAND"),
				callback: "_subExpand",
				options: options
			},{
				channel : this.getParentChannel("COLLAPSE"),
				callback: "_subCollapse",
				options: options
			},{
				channel : this.getParentChannel("TRY_TO_UPDATE_EXPAND_COLLAPSE"),
				callback: "_subTryToUpdateExpandCollapse",
				options: options
			});
		},

		_defineHierarchicalPublications: function() {

			this.publicationsConfig.push({
				event: 'EXPAND',
				channel: this.getParentChannel("EXPANDED")
			},{
				event: 'COLLAPSE',
				channel: this.getParentChannel("COLLAPSED")
			});
		},

		_setOwnHierarchicalCallbacksForEvents: function() {

			this._onEvt('EXPAND', lang.hitch(this, this._updateCollapseIcon));
			this._onEvt('COLLAPSE', lang.hitch(this, this._updateExpandIcon));
		},

		_chkIsMine: function(res) {

			var idProperty = res.idProperty;

			if (idProperty === undefined || idProperty === null ||
				(this.currentData && idProperty === this.currentData[this.idProperty])) {
				return true;
			}

			return false;
		},

		_subExpand: function(req) {

			this._expand();
		},

		_subCollapse: function(req) {

			this._collapse();
		},

		_subTryToUpdateExpandCollapse: function(req) {

			this._tryToUpdateExpandCollapse();
		},

		_expand: function() {

			put(this.containerChildren, "!hidden");

			this._emitEvt('EXPAND', {
				nodeChildren: this.containerChildren,
				idProperty: this.currentData[this.idProperty]
			});
		},

		_collapse: function() {

			put(this.containerChildren, ".hidden");

			this._emitEvt('COLLAPSE', {
				nodeChildren: this.containerChildren,
				idProperty: this.currentData[this.idProperty]
			});
		},

		_tryToUpdateExpandCollapse: function() {

			this._updateHierarchicalExpandCollapse(this.containerChildren.children.length);
		},

		_createHierarchicalStructure: function() {

			if (this.noSeeHierarchical) {
				return;
			}

			this.containerChildren = put(this.rowBottomNode, "div.hidden." + this.rowsContainerClass);

			this.expandCollapseNode = put(this.rowTopNode.firstChild, '-div.' + this.expandCollapseClass);

			this.expandCollapseIconNode = put(this.expandCollapseNode, "span.fa");

			this._updateExpandIcon();
		},

		_onExpand: function() {

			this._expand();
		},

		_updateExpandIcon: function() {

			put(this.expandCollapseIconNode, "!" + this.collapseIcon);
			put(this.expandCollapseIconNode, "." + this.expandIcon);

			this.expandCollapseNode.onclick = lang.hitch(this, this._onExpand);
		},

		_onCollapse: function() {

			this._collapse();
		},

		_updateCollapseIcon: function() {

			put(this.expandCollapseIconNode, "!" + this.expandIcon);
			put(this.expandCollapseIconNode, "." + this.collapseIcon);

			this.expandCollapseNode.onclick = lang.hitch(this, this._onCollapse);
		},

		_updateHierarchicalData: function(item) {

			this._updateHierarchicalExpandCollapse(item[this.leavesProperty]);
		},

		_updateHierarchicalExpandCollapse: function(leaves) {

			if (leaves) {
				put(this.expandCollapseIconNode, "!hidden");
				put(this.domNode, ".category");
			} else {
				put(this.domNode, "!category");
				put(this.expandCollapseIconNode, ".hidden");
			}
		}
	});
});
