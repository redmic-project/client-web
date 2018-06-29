define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
], function(
	declare
	, lang
	, aspect
	, put
	, _Module
	, _Show
){
	return declare([_Module, _Show], {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				'class': 'orderZone',
				options: null,
				optionDefault: 'default',
				directionOrder: "ASC",
				directionIconAsc: "fa-sort-amount-asc",
				directionIconDesc: "fa-sort-amount-desc",

				actions: {
					ADD_TO_QUERY: "addToQuery",
					UPDATE_OPTIONS: "updateOptions"
				}
			};

			lang.mixin(this, this.config);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("UPDATE_OPTIONS"),
				callback: "_subUpdateOptions"
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._createOrder();
		},

		_subUpdateOptions: function(req) {

			var options = req.options;

			if (!options) {
				return;
			}

			this.selectOrderNode && put(this.selectOrderNode, '!');

			this.options = options;

			this._createSelectOrderOption();
		},

		_createOrder: function() {

			put(this.domNode, 'span', this.i18n.sort + ":");

			this.orderNode = put(this.domNode, 'div.containerOrder');

			this._createDirectionOrder();

			if (!this.options) {
				return;
			}

			this._createSelectOrderOption();
		},

		_createSelectOrderOption: function() {

			this.optionSelect = this.optionDefault;

			this.options.unshift({value: "default"});

			this.selectOrderNode = put(this.orderNode, 'select.form-control');

			this.selectOrderNode.onchange = lang.hitch(this, this._eventOrderOptionClick);


			for (var i = 0; i < this.options.length; i++ ) {
				var item = this.options[i],
					selected = "";

				if (item.value == this.optionDefault) {
					selected = "[selected]";
				}

				var optionNode = put(this.selectOrderNode, "option" +
					selected + "[value=$]", item.value, item.label || this.i18n[item.value] || item.value);
			}

			this._changeDirectionIcon();
		},

		_createDirectionOrder: function() {

			this.directionOrderNode = put(this.orderNode, 'span.hidden');
			this.directionOrderNode.onclick = lang.hitch(this, this._eventDirectionClick);

			this._changeDirectionIcon();
		},

		_changeDirectionIcon: function() {

			if (this.directionOrder == "ASC") {
				this.directionOrderNode.setAttribute("class", "fa " + this.directionIconAsc);
			} else {
				this.directionOrderNode.setAttribute("class", "fa " + this.directionIconDesc);
			}

			this.optionSelect !== "default" ? this._showDirectionIcon() : this._hideDirectionIcon();
		},

		_hideDirectionIcon: function() {

			put(this.directionOrderNode, '.hidden');
		},

		_showDirectionIcon: function() {

			put(this.directionOrderNode, '!hidden');
		},

		_eventOrderOptionClick: function(evt) {

			var optionSelect = this.selectOrderNode.options[this.selectOrderNode.selectedIndex].value,
				optionOrder = null;

			if (optionSelect != this.optionSelect) {
				this.optionSelect = optionSelect;

				optionOrder = "ASC";

				this._eventDirectionClick(optionOrder);
			}
		},

		_eventDirectionClick: function(optionOrder) {

			if (typeof optionOrder !== 'string') {
				if (this.directionOrder === "ASC") {
					this.directionOrder = "DESC";
				} else {
					this.directionOrder = "ASC";
				}
			} else {
				this.directionOrder = optionOrder;
			}

			this._changeDirectionIcon();

			this._publishOrder();
		},

		_publishOrder: function() {

			if (this.queryChannel) {
				this._publish(this._buildChannel(this.queryChannel, this.actions.ADD_TO_QUERY), {
					query: {
						sorts: this._createSorts(),
						target: this.target
					}
				});
			}
		},

		_createSorts: function() {

			var sorts = [];

			if (this.optionSelect && this.optionSelect !== this.optionDefault) {
				sorts.push({
					"field": this.optionSelect,
					"order": this.directionOrder
				});
			}

			return sorts;
		},

		_getNodeToShow: function() {

			return this.domNode;
		}
	});
});
