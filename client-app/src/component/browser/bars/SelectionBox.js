define([
	'alertify/alertify.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/util/Credentials"
	, "src/component/base/_Module"
	, "src/component/base/_Show"
	, "src/component/selection/SelectionBox"
	, "src/component/browser/bars/_SelectBox"
	, "put-selector/put"
], function(
	alertify
	, declare
	, lang
	, Credentials
	, _Module
	, _Show
	, SelectionBox
	, _SelectBox
	, put
){
	return declare([_Module, _Show, _SelectBox], {
		//	summary:
		//		Extensión para las vistas de selección de datos.
		//	description:
		//		Añade funcionalidades de selección a la vista.

		constructor: function(args) {

			this.config = {
				'class': 'containerSelectionBox',
				labelSelect: this.i18n.show,
				omitShowSelectedOnly: false,
				selectOptions: [{
					value: "all"
				},{
					value: "selected"
				}],
				optionDefault: "all",

				actions: {
					CLEAR: "clear",
					ADD_TO_QUERY: "addToQuery",
					SELECTED_ROW: "selectedRow",
					DESELECTED_ROW: "deselectedRow",
					REMOVE_ITEM: "removeItem"
				}
			};

			lang.mixin(this, this.config);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.browserChannel, this.actions.SELECTED_ROW),
				callback: "_subSelectedRow"
			},{
				channel: this._buildChannel(this.browserChannel, this.actions.DESELECTED_ROW),
				callback: "_subDeselectedRow"
			});
		},

		_setConfigurations: function() {

			this.selectionBoxConfig = this._merge([{
				parentChannel: this.getChannel(),
				selectionTarget: this.selectionTarget || this.target,
				perms: this.perms,
				selectorChannel: this.selectorChannel
			}, this.selectionBoxConfig || {}]);
		},

		_subSelectedRow: function(res) {

		},

		_subDeselectedRow: function(res) {

			this._activeSeeSelection && this._deleteItemDeselected(res);
		},

		_deleteItemDeselected: function(obj) {

			this._publish(this._buildChannel(this.browserChannel, this.actions.REMOVE_ITEM), obj);
		},

		getNodeSelect: function() {

			return this.domNode;
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_initialize: function() {

			this.selectionBox = new SelectionBox(this.selectionBoxConfig);
		},

		_changeSelect: function(optionSelect) {

			this._processStatusSeeSelection(optionSelect);

			this._publishSeeSelection();
		},

		_processStatusSeeSelection: function(optionSelect) {

			this._activeSeeSelection = optionSelect !== "selected" ? false : true;

			var mode = "!",
				classTitleParent = "!blueIcon";

			if (this._activeSeeSelection) {
				mode = ".";
				classTitleParent = ".blueIcon";
			}

			this._publish(this.getParentChannel("SET_PROPS"), {
				titleClassSelector: classTitleParent
			});

			this._publish(this.getParentChannel("GET_PROPS"), {
				title: true
			});

			put(this.containerSelect, mode + "active");
		},

		_publishSeeSelection: function() {

			var terms = this._activeSeeSelection ? this._createQuerySelected() : {selection: null};

			if (this._activeSeeSelection && !terms.selection) {
				this._publish(this._buildChannel(this.browserChannel, this.actions.CLEAR));
				return;
			}

			this._publish(this._buildChannel(this.queryChannel, this.actions.ADD_TO_QUERY), {
				query: {
					terms: terms
				}
			});
		},

		_createQuerySelected: function() {

			var selectIds = Credentials.get("selectIds");

			return {
				"selection": selectIds && selectIds[this.selectionTarget || this.target]
			};
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.selectionBox.getChannel("SHOW"), {
				node: this.domNode
			});

			!this.omitShowSelectedOnly && this._createSelect();
		},

		_afterShow: function(request) {

			var target = this.selectionTarget ? this.selectionTarget : this.target;

			this._publish(this.selectionBox.getChannel("REFRESH"), {
				selectionTarget: target,
				perms: this.perms
			});
		}
	});
});
