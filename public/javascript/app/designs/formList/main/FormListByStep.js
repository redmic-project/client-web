define([
	"app/designs/base/_Main"
	, "app/designs/formList/Controller"
	, "app/designs/formList/main/_RequestAndParseData"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function (
	_Main
	, Controller
	, _RequestAndParseData
	, declare
	, lang
	, aspect
){
	return declare([Controller, _Main, _RequestAndParseData], {
		//	summary:
		//		Main para las vistas que usen el layout Form_List.

		constructor: function (args) {

			this.mainConfig = {
				mainActions: {
					DESERIALIZE: "deserialize",
					VALIDATION_ERRORS_CHANGED: "validationErrorsChanged",
					VALUE_ADDED: "valueAdded"
				},
				items: {},
				idProperty: "localId",
				idPropertySerialize: "id",
				_results: [],
				_resultsByIdProperty: {},
				_totalSelected: 0,
				pathSeparator: "."
			};

			lang.mixin(this, this.mainConfig, args);

			aspect.before(this, "_beforeShow", this._beforeShowController);
		},

		_setMainConfigurations: function() {

			this.browserConfig = this._merge([{
				idProperty: this.idProperty
			}, this.browserConfig || {}]);
		},

		_defineMainSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.modelChannel, this.actions.VALIDATION_ERRORS_CHANGED),
				callback: "_subValidationErrorsChanged"
			},{
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

		_beforeShowController: function() {

			this._emitEvt('REFRESH_STATUS');
		},

		// TODO: este método es propio de steps, y esto no es un step
		// hay que crear un step que extienda de este y se lo aplique
		_instanceDataToResult: function(data) {

			if (!data || !this.propToRead) {
				return;
			}

			var propToReadSplit = this.propToRead.split("/"),
				dataToRead = data;

			for (var i = 0; i < propToReadSplit.length; i++) {
				dataToRead = dataToRead[propToReadSplit[i]];
			}

			this._once(this._buildChannel(this.modelChannel, this.actions.GOT_PROPERTY_INSTANCE),
				lang.hitch(this, this._subGotPropertyInstance, dataToRead));

			this._publish(this._buildChannel(this.modelChannel, this.actions.GET_PROPERTY_INSTANCE), {
				key: this.propToRead
			});
		},

		_subGotPropertyInstance: function(dataToRead, res) {

			var items = res.instance.get("items");

			this._clearFormAndList();

			if (items) {
				for (i = 0; i < items.length; i++) {
					this.resultsToPub = lang.clone(dataToRead[i]);

					this._injectItemToList(items[i].generatedId);
				}
			}

			this._updateCompletedStatus();
		},

		_listDataAdded: function(response) {

			this._totalSelected++;
			this._updateCompletedStatus();
		},

		_listDataRemoved: function(response) {

			var removedItemId = response[this.idProperty] || response;

			this._removeItemFromResults(removedItemId);
			this._emitRemoveItem(removedItemId);
			this._totalSelected--;
			this._updateCompletedStatus();
		},

		_emitRemoveItem: function() {

		},

		_removeItemFromResults: function(removedItemId) {

			this._results.splice(this._resultsByIdProperty[removedItemId], 1);

			this._restorePositionInResult(this._resultsByIdProperty[removedItemId]);

			delete this._resultsByIdProperty[removedItemId];
		},

		_restorePositionInResult: function(ref) {

			for (var key in this._resultsByIdProperty) {
				var pos = this._resultsByIdProperty[key];

				if (pos > ref) {
					this._resultsByIdProperty[key] = pos - 1;
				}
			}
		},

		_updateCompletedStatus: function() {

			this._isCompleted = !!this._totalSelected;

			this._emitEvt('REFRESH_STATUS');
		},

		_formSubmitted: function(res) {

			if (res.error) {
				return;
			}

			var data = res.data;

			this._errorUniqueItemsByRequiredProperties = false;

			this._requestItems(this._proccesNewItem(data));
		},

		_proccesNewItem: function(item) {

			return item;
		},

		_subValidationErrorsChanged: function(response) {

			var errors = response.errors[this.propertyName];

			if (errors) {
				errors = errors.errors;

				for (var i = 0; i < errors.length; i++) {
					if (errors[i].code === 10400) {
						this._errorUniqueItemsByRequiredProperties = true;
					}
				}
			}
		},

		_publishLocalData: function(dataToInject) {

			this.inherited(arguments);

			this._emitChangeResults(this.resultsToPub);
		},

		_emitChangeResults: function(results) {

			if (this.propertyName) {
				if (results && !results[this.idProperty]) {
					this._addValueResults(results);
				} else {
					this._editValueResults(results);
				}
			}
		},

		_addValueResults: function(results) {

			var obj = {};
			obj[this.propertyName] = results;

			this._emitEvt('ADD_VALUE', obj);
		},

		_editValueResults: function(results) {

			this._once(this._buildChannel(this.modelChannel, this.actions.GOT_PROPERTY_INSTANCE),
				lang.hitch(this, this._subGotPropertyInstanceEditValue, results));

			this._publish(this._buildChannel(this.modelChannel, this.actions.GET_PROPERTY_INSTANCE), {
				key: this.propToRead
			});
		},

		_subGotPropertyInstanceEditValue: function(data, res) {

			res.instance.get(data[this.idProperty]).set("value", data);

			this._onValueChanged(data[this.idProperty]);
		},

		_subValueAdded: function(res) {

			res = res[this.propertyName];

			if (this._errorUniqueItemsByRequiredProperties) {

				this._emitEvt('COMMUNICATION', {
					description: this.i18n.messageErrorUniqueItemsByRequiredProperties,
					type: "alert",
					level: "error"
				});

				this._errorUniqueItemsByRequiredProperties = false;
				this._emitRemoveItem(res.generatedId);
			} else {
				if (!this.resultsToPub) {
					this.resultsToPub = res.value;
				}

				this._onValueChanged(res.generatedId);
			}
		},

		_onValueChanged: function(generatedId) {

			if (!generatedId) {
				return;
			}

			this._emitEvt("SAVED", {
				success: true,
				clear: true
			});

			this._injectItemToList(generatedId);

			this._updateCompletedStatus();
		},

		_injectItemToList: function(idProperty) {

			var results = this._getDataToPublishLocally(idProperty);

			this._emitEvt('INJECT_ITEM', {
				data: results,
				target: this.getChannel()
			});
		},

		_getDataToPublishLocally: function(idProperty) {

			var resultsToPub = lang.clone(this.resultsToPub);

			delete this.resultsToPub;

			resultsToPub[this.idProperty] = idProperty;

			var itemForAddOrUpdateResults = this._serialize(lang.clone(resultsToPub));

			if (this._resultsByIdProperty[idProperty] > -1) {
				this._results[this._resultsByIdProperty[idProperty]] = itemForAddOrUpdateResults;

			} else {
				// TODO: este atributo es propio de steps, y esto no es un step, ojo
				this._results.push(itemForAddOrUpdateResults);

				this._resultsByIdProperty[idProperty] = this._results.length - 1;
			}

			return resultsToPub;
		},

		_serialize: function(resultsToPub) {

			var results = {};

			for (var key in this.items) {
				var keySplit = key.split(this.pathSeparator);
				if (keySplit.length > 1) {
					var auxObj = resultsToPub;

					for (var i = 0; i < keySplit.length; i++) {
						auxObj = auxObj[keySplit[i]];
					}

					if (auxObj && auxObj[this.idPropertySerialize]) {
						var objPosAct = this._valuePropertyResults(auxObj);

						for (i = keySplit.length - 1; i > 0; i--) {
							var aux = {};
							aux[keySplit[i]] = objPosAct;
							objPosAct = aux;
						}

						results[keySplit[0]] = objPosAct;
					}

				} else if (resultsToPub[key]) {
					results[key] = this._valuePropertyResults(resultsToPub[key]);
					resultsToPub[key] = null;
				}
			}

			return this._merge([resultsToPub, results || {}]);
		},

		_valuePropertyResults: function(item) {

			if (item instanceof Array) {
				var ret = [];

				for (var i = 0; i < item.length; i++) {
					ret.push(item[i][this.idPropertySerialize]);
				}

				return ret;
			} else {
				return item[this.idPropertySerialize];
			}

		},

		_doFlush: function() {

			var obj = {
				step: this.stepId,
				results: this._getStepResultsForFlush(),
				status: this.statusStep
			};

			this._emitEvt('FLUSH', obj);
		},

		_getStepResultsForFlush: function() {

			var results = lang.clone(this.getStepResults());

			for (var i = 0; i < results.length; i++) {
				delete results[i][this.idProperty];
			}

			return results;
		},

		// TODO: este método es propio de steps, y esto no es un step
		// hay que crear un step que extienda de este y se lo aplique
		_resetStep: function(initialData) {

			this._clearFormAndList();
			this._instanceDataToResult(initialData);
		},

		// TODO: este método es propio de steps, y esto no es un step
		// hay que crear un step que extienda de este y se lo aplique
		_clearStep: function() {

			this._clearFormAndList();
		},

		_clearFormAndList: function() {

			// TODO: este atributo es propio de steps, y esto no es un step, ojo
			this._results = [];
			this._resultsByIdProperty = {};
			this._totalSelected = this.mainConfig._totalSelected;

			this.form && this._publish(this.form.getChannel("CLEAR"));
			this._publish(this.browser.getChildChannel("browser", "CLEAR"));
		}
	});
});
