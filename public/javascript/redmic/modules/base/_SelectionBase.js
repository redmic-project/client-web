define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	declare
	, lang
	, aspect
){
	return declare(null, {
		//	summary:
		//		Base común para todos los módulos con selección

		constructor: function(args) {

			this.selectionBaseConfig = {
				selectionBaseEvents: {
					SELECTED: "selected",
					DESELECTED: "deselected",
					SELECT: "select",
					DESELECT: "deselect",
					GROUP_SELECTED: "groupSelected",
					CLEAR_SELECTION: "clearSelection",
					SELECTION_CLEARED: "selectionCleared",
					TOTAL: "total",
					SELECTION_TARGET_LOADING: "selectionTargetLoading",
					SELECTION_TARGET_LOADED: "selectionTargetLoaded"
				},

				selectionBaseActions: {
					SELECT: "select",
					DESELECT: "deselect",
					SELECTED: "selected",
					DESELECTED: "deselected",
					SELECTED_GROUP: "selectedGroup",
					GROUP_SELECTED: "groupSelected",
					CLEAR_SELECTION: "clearSelection",
					SELECTION_CLEARED: "selectionCleared",
					TOTAL: "total",
					TOTAL_AVAILABLE: "totalAvailable",
					SELECTION_TARGET_LOADING: "selectionTargetLoading",
					SELECTION_TARGET_LOADED: "selectionTargetLoaded",
					UPDATE_SELECTOR_CHANNEL: "updateSelectorChannel"
				}
			};

			lang.mixin(this, this.selectionBaseConfig);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixSelectionBaseEventsAndActions));
		},

		_mixSelectionBaseEventsAndActions: function() {

			lang.mixin(this.events, this.selectionBaseEvents);
			lang.mixin(this.actions, this.selectionBaseActions);

			delete this.selectionBaseEvents;
			delete this.selectionBaseActions;
		}
	});
});
