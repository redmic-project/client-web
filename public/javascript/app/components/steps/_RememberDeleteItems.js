define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
], function (
	declare
	, lang
	, aspect
	, Utilities
){
	return declare(null, {
		//	summary:
		//		Step

		constructor: function (args) {

			this.config = {
				_itemsRemoved: [],
				_requiredItems: null,

				rememberDeleteItemsActions: {
					VALUE_REMOVED: "valueRemoved"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixRememberDeleteItemsEventsAndActions));
			aspect.before(this, "_defineSubscriptions", lang.hitch(this, this._defineRememberDeleteItemsSubscriptions));
		},

		_mixRememberDeleteItemsEventsAndActions: function () {

			lang.mixin(this.actions, this.rememberDeleteItemsActions);

			delete this.rememberDeleteItemsActions;
		},

		_defineRememberDeleteItemsSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.modelChannel, this.actions.VALUE_REMOVED),
				callback: "_subValueRemoved",
				options: {
					predicate: lang.hitch(this, this._containedPropertyIsMine)
				}
			});
		},

		_containedPropertyIsMine: function(obj) {

			return obj[this.propertyName] !== undefined;
		},

		postCreate: function() {

			this.inherited(arguments);

			this._once(this._buildChannel(this.modelChannel, this.actions.GOT_PROPERTY_INSTANCE),
				lang.hitch(this, this._subGotPropertyInstanceInit));

			this._publish(this._buildChannel(this.modelChannel, this.actions.GET_PROPERTY_INSTANCE), {
				key: this.propToRead
			});
		},

		_subGotPropertyInstanceInit: function(res) {

			var required = res.instance.get("schema").items.required;

			this._requiredItems = required;
		},

		_proccesNewItem: function(item) {

			return this._compareItemNewWithItemsRemoved(item);
		},

		_compareItemNewWithItemsRemoved: function(item) {

			if (!this._requiredItems || !this._requiredItems.length) {
				return item;
			}

			for(var i = 0; i< this._itemsRemoved.length; i++) {
				var equalRequired = 0,
					itemRemoved = this._itemsRemoved[i];
				for(var n = 0; n < this._requiredItems.length; n++) {
					var required = this._requiredItems[n];
					if (Utilities.isEqual(item[required], itemRemoved[required])) {
						equalRequired ++;
					}
				}

				if (this._requiredItems.length === equalRequired) {
					item[this.idPropertySerialize] = itemRemoved[this.idPropertySerialize];
					this._itemsRemoved.splice(i, 1);
					return item;
				}
			}

			return item;
		},

		_emitRemoveItem: function(removedItemId) {

			if (this.propertyName) {

				var obj = {};
				obj[this.propertyName] = removedItemId;

				this._emitEvt('DELETE_VALUE', obj);
			}
		},

		_subValueRemoved: function(res) {

			res = res[this.propertyName];

			if (res.value[this.idPropertySerialize]) {
				this._itemsRemoved.push(res.value);
			}
		}
	});
});