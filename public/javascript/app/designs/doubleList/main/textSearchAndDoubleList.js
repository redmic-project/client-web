define([
	"app/base/views/extensions/_SelectInDoubleList"
	, "app/components/steps/_RememberDeleteItems"
	, "app/designs/base/_Main"
	, "app/designs/doubleList/layout/TopLeftContentAndDoubleList"
	, "app/designs/doubleList/Controller"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "RWidgets/Utilities"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/browser/bars/Pagination"
	, "redmic/modules/search/TextImpl"
], function (
	_SelectInDoubleList
	, _RememberDeleteItems
	, _Main
	, Layout
	, Controller
	, declare
	, lang
	, Utilities
	, _Filter
	, Pagination
	, TextImpl
){
	return declare([Layout, Controller, _Main, _Filter, _RememberDeleteItems, _SelectInDoubleList], {
		//	summary:
		//		Step de ActivityDocument.

		constructor: function (args) {

			this.config = {
				// WizardStep params
				_results: [],

				idProperty: "localId",
				idPropertySerialize: "id",
				_totalSelected: 0,

				targetBrowserRight: "browserRight",

				mainActions: {
					VALUE_ADDED: "valueAdded",
					GOT_PROPERTY_VALUE: "gotPropertyValue"
				}
			};

			lang.mixin(this, this.config, args);

			if (!this.propToRead) {
				this.propToRead = this.propertyName;
			}
		},

		_setMainConfigurations: function() {

			this.browserLeftConfig = this._merge([{
				idProperty: this.idPropertySerialize,
				browserConfig: {
					target: this.target,
					bars: [{
						instance: Pagination
					}]
				}
			}, this.browserLeftConfig || {}], {
				arrayMergingStrategy: 'concatenate'
			});

			this.browserRightConfig = this._merge([{
				browserConfig: {
					target: this.targetBrowserRight
				}
			}, this.browserRightConfig || {}]);

			this.textSearchConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target
			}, this.textSearchConfig || {}]);
		},

		_setQueryChannelInModules: function() {

			this.textSearchConfig.queryChannel = this.queryChannel;
		},

		_initializeMain: function() {

			this.textSearch = new TextImpl(this.textSearchConfig);
		},

		_defineMainSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.modelChannel, this.actions.VALUE_ADDED),
				callback: "_subValueAdded",
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

			this._publish(this.textSearch.getChannel("SHOW"), {
				node: this.topLeftNode
			});
		},

		_beforeShow: function() {

			this._emitEvt('REFRESH');
			this._emitEvt('REFRESH_STATUS');
		},

		_subListBtnEvent: function(response) {

			this.inherited(arguments);

			var btnId = response.btnId,
				idProperty = response.item[this.idPropertySerialize],
				item = {
					id: null
				};

				item[this.labelAttr] = response.item[this.idPropertySerialize];

			if (btnId === "addItem") {
				if (this._results.indexOf(idProperty) < 0) {
					this._emitChangeResults(this._proccesNewItem(item), lang.clone(response.item));
				}
			} else if (btnId === "remove") {
				this._deleteItemInListRight(idProperty, response.item[this.idProperty], response.item);
			}
		},

		_deleteItemInListRight: function(idProperty, removedItemId, data) {

			this._emitRemoveItem(removedItemId);

			this._results = Utilities.without(this._results, idProperty);
			this._totalSelected--;

			this._updateCompletedStatus();
		},

		_emitChangeResults: function(data, item) {

			if (this.propertyName) {

				var objToPub = {};

				data[this.labelAttr] = item;

				objToPub[this.propertyName] = lang.clone(data);

				this._emitEvt('ADD_VALUE', objToPub);
			}
		},

		// TODO: este método es propio de steps, y esto no es un step
		// hay que crear un step que extienda de este y se lo aplique
		_instanceDataToResult: function(data) {

			if (this._getGlobalModelUsed()) {
				this._askForValue(data[this.propertyName]);
			} else {
				for (var i = 0; i < data[this.propertyName].length; i++) {
					var obj = data[this.propertyName][i];

					this._emitChangeResults(this._proccesNewItem(obj), obj);
				}
			}
		},

		_askForValue: function(data) {

			this._once(this._buildChannel(this.modelChannel, this.actions.GOT_PROPERTY_VALUE),
				lang.hitch(this, this._subGotItemsValue, lang.clone(data)));

			this._emitEvt('GET_PROPERTY_VALUE', {
				propertyName: this.propertyName,
				valueProperty: "items"
			});
		},

		_subValueAdded: function(res) {

			res = res[this.propertyName];

			var value = res.value[this.labelAttr],
				idProperty = value[this.idPropertySerialize];

			this._onValueAdded(idProperty, value, res.generatedId);
		},

		_onValueAdded: function(idProperty, data, generatedId) {

			if (!generatedId) {
				return;
			}

			if (!data) {
				this._subscriptionItemAvailableOnce = this._subscribe(
					this._buildChannel(this.storeChannel, this.actions.ITEM_AVAILABLE),
					lang.hitch(this, this._itemAvailableOnce, generatedId)
				);

				this._publish(this._buildChannel(this.storeChannel, this.actions.GET), {
					id: idProperty,
					options: {},
					target: this.target,
					requesterId: this.getOwnChannel()
				});
			} else {
				data[this.idProperty] = generatedId;
				this._addItemInListRight(idProperty, data, generatedId);
			}

			this._results.push(idProperty);
			this._totalSelected++;

			this._updateCompletedStatus();
		},

		_subGotItemsValue: function(data, res) {

			var items = res.items;

			if (!items) {
				return;
			}

			for (var i = 0; i < items.length; i++) {
				var item = items[i],
					generatedId = item.generatedId,
					idProperty = item.value[this.labelAttr];

				this._onValueAdded(idProperty, data[i][this.labelAttr], generatedId);
			}
		},

		_itemAvailableOnce: function(generatedId, resWrapper) {

			if (resWrapper.req.requesterId !== this.getOwnChannel()) {
				return;
			}

			var data = resWrapper.res.data;
			data[this.idProperty] = generatedId;

			this._addItemInListRight(data[this.idPropertySerialize], data, generatedId);

			this._unsubscribe(this._subscriptionItemAvailableOnce);
		},

		_addItemInListRight: function(idProperty, data, generatedId) {

			if (this._results.indexOf(idProperty) < 0) {
				this._emitEvt('INJECT_ITEM', {
					data: data,
					target: this.targetBrowserRight
				});
			}
		},

		// TODO: este método es propio de steps, y esto no es un step
		// hay que crear un step que extienda de este y se lo aplique
		_clearStep: function() {

			this._publish(this.filter.getChildChannel("modelInstance", "RESET"));
			this._clearItemsInListRight();
		},

		// TODO: este método es propio de steps, y esto no es un step
		// hay que crear un step que extienda de este y se lo aplique
		_resetStep: function(initialData) {

			this._publish(this.filter.getChildChannel("modelInstance", "RESET"));

			this._clearItemsInListRight();
			this._instanceDataToResult(initialData);
		},

		_clearItemsInListRight: function() {

			this._results = [];
			this._totalSelected = 0;
			this._publish(this.browserRight.getChildChannel("browser", "CLEAR"));
		}
	});
});
