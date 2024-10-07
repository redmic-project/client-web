define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'put-selector'
], function(
	declare
	, lang
	, aspect
	, put
) {

	return declare(null, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				selectEvents: {
					SELECT: "select",
					DESELECT: "deselect"
				},
				selectActions: {
					SELECT: "select",
					DESELECT: "deselect",
					SELECT_ROW: "selectRow",
					DESELECT_ROW: "deselectRow",
					CLEAR_SELECTION_ROWS: "clearSelectionRows",
					SELECT_ALL_ROWS: "SelectAllRows"
				},
				checkboxContainerClass: "check",
				selectContainerClass: "selectContainerRow",
				noSeeSelect: false
			};

			lang.mixin(this, this.config, args);

			if (!this.simpleSelection) {
				this.selectionIconClass = 'checkboxIcon';
			} else {
				this.selectionIconClass = 'radioButtonIcon';
			}

			if (!this.selectionIdProperty) {
				this.selectionIdProperty = this.idProperty;
			}

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixSelectEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineSelectSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineSelectPublications));

			aspect.after(this, "_createStructure", lang.hitch(this, this._createSelectStructure));
			aspect.before(this, "_updateData", lang.hitch(this, this._updateSelectData));
		},

		_mixSelectEventsAndActions: function () {

			lang.mixin(this.events, this.selectEvents);
			lang.mixin(this.actions, this.selectActions);

			delete this.selectEvents;
			delete this.selectActions;
		},

		_defineSelectSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("SELECT"),
				callback: "_subSelect"
			},{
				channel : this.getChannel("DESELECT"),
				callback: "_subDeselect"
			},{
				channel : this.getParentChannel("CLEAR_SELECTION_ROWS"),
				callback: "_subDeselect"
			},{
				channel : this.getParentChannel("SELECT_ALL_ROWS"),
				callback: "_subSelect"
			});
		},

		_defineSelectPublications: function() {

			this.publicationsConfig.push({
				event: 'SELECT',
				channel: this.getParentChannel("SELECT_ROW")
			},{
				event: 'DESELECT',
				channel: this.getParentChannel("DESELECT_ROW")
			});
		},

		_subSelect: function(req) {

			this._select();
		},

		_subDeselect: function(req) {

			this._deselect();
		},

		_select: function() {

			if (this._isSelect()) {
				return;
			}

			this._selected = true;
			this._selectChangeBackground();
		},

		_deselect: function() {

			this._selected = false;
			this._deselectChangeBackground();
		},

		_createSelectStructure: function() {

			if (this.noSeeSelect) {
				return;
			}

			this.selectContainerNode = put(this._getParentNodeSelect(), '-div.' + this.checkboxContainerClass);

			this.selectNode = put(this.selectContainerNode, "span." + this.selectionIconClass);
		},

		_getParentNodeSelect: function() {

			return this.rowTopNode.firstChild;
		},

		_updateSelectData: function(item) {

			if (this.noSeeSelect) {
				return;
			}

			this.selectNode.onclick = lang.hitch(this, this._eventChecked, item[this.selectionIdProperty]);
		},

		_eventChecked: function(idProperty, e) {

			var action = 'SELECT';

			if (this._isSelect()) {
				action = 'DESELECT';
			}

			this._emitEvt(action, {
				idProperty: idProperty
			});
		},

		_isSelect: function() {

			if (this._selected) {
				return true;
			}

			return false;
		},

		_selectChangeBackground: function() {

			put(this.domNode, '.' + this.selectContainerClass);
		},

		_deselectChangeBackground: function() {

			put(this.domNode, '!' + this.selectContainerClass);
		}
	});
});
