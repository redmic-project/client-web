define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
], function(
	declare
	, lang
	, aspect
	, Utilities
){
	return declare(null, {

		constructor: function(args) {

			this.config = {
				selections: {},
				_hierarchyChar: ".",
				hierarchicalFilterEvents: {
					FILTER: "filter"
				},
				hierarchicalFilterActions: {
					ADD_TO_QUERY: "addToQuery"
				}
			};

			lang.mixin(this, this.config, args);

			this._initializeSelection();

			aspect.before(this, "_mixEventsAndActions",
				lang.hitch(this, this._mixHierarchicalFilterEventsAndActions));
			aspect.after(this, "_setOwnCallbacksForEvents",
				lang.hitch(this, this._setHierarchicalFilterCallbacksForEvents));
			aspect.after(this, "_definePublications",
				lang.hitch(this, this._defineHierarchicalFilterPublications));
		},

		_mixHierarchicalFilterEventsAndActions: function() {

			lang.mixin(this.events, this.hierarchicalFilterEvents);
			lang.mixin(this.actions, this.hierarchicalFilterActions);

			delete this.hierarchicalFilterEvents;
			delete this.hierarchicalFilterActions;
		},

		_setHierarchicalFilterCallbacksForEvents: function() {

			this._onEvt('SELECT', lang.hitch(this, this._selectHierarchicalFilter));
			this._onEvt('DESELECT', lang.hitch(this, this._deselectHierarchicalFilter));
		},

		_defineHierarchicalFilterPublications: function() {

			this.publicationsConfig.push({
				event: 'FILTER',
				channel: this._buildChannel(this.queryExternalChannel, this.actions.ADD_TO_QUERY)
			});
		},

		_selectHierarchicalFilter: function(path) {

			this._selectById(path);
			this._clearSelectedDescendants(path);

			this._filter();
		},

		_deselectHierarchicalFilter: function(path) {

			if (this._isAscendantSelected(path))
				this._deselectHierarchicalItem(path);

			this._deselectById(path);
			this._clearSelectedDescendants(path);
			this._filter();
		},

		_deselectHierarchicalItem: function(path) {

			var itemPathSplitted = path.split(this._hierarchyChar);
			itemPathSplitted.pop();
			var ancestorPath = itemPathSplitted.join(this._hierarchyChar);

			if (!this.selections.items[ancestorPath])
				this._deselectHierarchicalItem(ancestorPath);

			this._deselectById(ancestorPath);
			this.getDecendants(ancestorPath, lang.hitch(this, this._selectItems));
			this._deselectById(path);
		},

		_selectItems: function(items) {

			for (var i=0; i<items.length; i++)
				this._selectById(items[i][this.idProperty]);
		},

		_filter: function(argument) {

			this._emitEvt('FILTER', {
				query: {
					regexp: this._createRegexpQuery(this.selections.items)
				}
			});
		},

		_createRegexpQuery: function(selection) {

			if (!selection || Object.keys(selection).length < 1)
				return null;

			var str = "";
			for (var key in selection) {
				if (str.length)
					str += "|";
				str += key + "(.[0-9]+)*";
			}
			// TODO: de momento solo 1 en la lista y campo path siempre?
			return [{"field": "path", "exp": str}];
		},

		_getTotal: function() {

			return this.selections.total || 0;
		},

		_isSelected: function(itemPath) {

			if (!this.selections.items[itemPath])
				return false;

			return true;
		},

		_isAscendantSelected: function(itemPath) {

			var itemPathSplitted = itemPath.split(this._hierarchyChar);
			itemPathSplitted.pop();

			while (itemPathSplitted.length > 1) {
				var ancestorPath = itemPathSplitted.join(this._hierarchyChar);

				if (this.selections.items[ancestorPath])
					return true;

				itemPathSplitted.pop();
			}
			return;
		},

		_clearSelectedDescendants: function(itemPath) {

			for (var key in this.selections.items) {
				if (key !== itemPath && Utilities.startsWith(key, itemPath)) {
					this._deselectById(key);
				}
			}
		},

		_deselectById: function(itemPath) {

			if (!this.selections.items[itemPath])
				return;

			delete this.selections.items[itemPath];
			this.selections.total--;
		},

		_selectById: function(itemPath) {

			this._initializeSelection();

			if (!this.selections.items[itemPath]) {
				this.selections.items[itemPath] = true;
				this.selections.total++;
			}
		},

		_initializeSelection: function() {

			if (!this.selections.items || !this.selections.total)
				this.selections = {items: {}, total: 0};
		}
	});
});