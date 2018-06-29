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
		//	summary:
		//		Extensión para los inputs, que permite eliminar los valores no validos de las instancias de array.

		constructor: function(args) {

			this.config = {
				deleteOnClearEvents: {
					ADD_VALUE: "addValue",
					DELETE_VALUE: "deleteValue"
				},
				deleteOnClearActions: {
					VALUE_ADDED: "valueAdded",
					VALUE_REMOVED: "valueRemoved",
					ADD_VALUE: "addValue",
					DELETE_VALUE: "deleteValue",
					VALUE_REINDEXED: "valueReindexed"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixDeleteOnClearEventsAndActions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineDeleteOnClearPublications));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineDeleteOnClearSubscriptions));

		},

		_mixDeleteOnClearEventsAndActions: function () {

			lang.mixin(this.events, this.deleteOnClearEvents);
			lang.mixin(this.actions, this.deleteOnClearActions);

			delete this.deleteOnClearEvents;
			delete this.deleteOnClearActions;
		},

		_defineDeleteOnClearSubscriptions: function() {

			if (this.modelChannel)
				this.subscriptionsConfig.push({
					channel: this._buildChannel(this.modelChannel, this.actions.VALUE_REINDEXED),
					callback: "_subValueReindexed",
					options: {
						predicate: lang.hitch(this, this._containedPropertyPathIsMine)
					}
				});
		},

		_defineDeleteOnClearPublications: function() {

			if (this.modelChannel)
				this.publicationsConfig.push({
					event: 'ADD_VALUE',
					channel: this._buildChannel(this.modelChannel, this.actions.ADD_VALUE)
				},{
					event: 'DELETE_VALUE',
					channel: this._buildChannel(this.modelChannel, this.actions.DELETE_VALUE)
				});
		},

		postCreate: function() {

			this._once(this._buildChannel(this.modelChannel, this.actions.VALUE_ADDED),
				lang.hitch(this, this._subValueAddedInit));

			this.inherited(arguments);
		},

		_containedPropertyPathIsMine: function(obj) {

			return obj[this.propertyPath] !== undefined;
		},

		_subValueReindexed: function(res) {

			this._valueReindexed(res[this.propertyPath].newIndex);
		},

		_valueReindexed: function(newIndex) {

			var path = this.propertyPath,
				splitPath = path.split("/");
			splitPath.pop();

			this.propertyName = splitPath.join() + "/" + newIndex;
		},

		_getInfoFromInstance: function(instance) {

			this.inherited(arguments);

			this._valueReindexed(this._initIndex);
		},

		_subValueAddedInit: function(res) {

			var key = Object.keys(res)[0];

			this._initIndex = res[key].index;
		},

		_shown: function() {

			if (this.propertyName === this.getChannel())
				return;

			this.inherited(arguments);

			var obj = this._parsePropertyAndReturnObj(this.propertyName);

			// TODO no forma definitiva, plantear con una solución buena, esto es un parche
			setTimeout(lang.hitch(this, this._initValueChange), 100 * obj.idProperty);
		},

		_emitChanged: function(value) {

			this._initValue = value;

			this.inherited(arguments);
		},

		_initValueChange: function() {

			if (this.modelChannel && this._inputInstance !== undefined && !this._initValue) {

				var obj = {};
				obj[this.propertyName] = this._initValue;

				this._deleteValue(obj);
			}
		},

		_emitSetValue: function(obj) {

			var evtName = 'SET_VALUE';

			if (this.modelChannel) {
				evtName = 'SET_PROPERTY_VALUE';
				if (this._deleteValue(obj))
					return;
				if (this._addValue(obj))
					return;
			}

			this._emitEvtSetValue(evtName, obj);
		},

		_deleteValue: function(obj) {

			if (!obj[this.propertyName] && this.propertyName !== this.getChannel()) {

				var objParse = this._parsePropertyAndReturnObj(this.propertyName);

				if (objParse) {
					var pubObj = {};
					pubObj[objParse.path] = objParse.idProperty;

					this._lastPropertyName = this.propertyName;
					this.propertyName = this.getChannel();

					this._once(this._buildChannel(this.modelChannel, this.actions.VALUE_REMOVED),
						lang.hitch(this, this._subValueRemoved));

					this._emitEvt('DELETE_VALUE', pubObj);

					return true;
				}
			}

			return false;
		},

		_addValue: function(obj) {

			if (this.propertyName === this.getChannel()) {

				if (!obj[this.propertyName])
					return true;

				var objParse = this._parsePropertyAndReturnObj(this.propertyPath);
				if (objParse) {
					var pubObj = {};
					pubObj[objParse.path] = obj[this.propertyName];

					this._once(this._buildChannel(this.modelChannel, this.actions.VALUE_ADDED),
						lang.hitch(this, this._subValueAdded));

					this._emitEvt('ADD_VALUE', pubObj);

					return true;
				}
			}

			return false;
		},

		_emitEvtSetValue: function(evtName, pubObj) {

			this._getShown() && this._emitEvt(evtName, pubObj);
		},

		_parsePropertyAndReturnObj: function(property) {

			var splitPath = property.split("/"),
			idProperty = splitPath.pop(),
			propertyPath = splitPath.join();

			if (Utilities.isValidNumber(idProperty) || Utilities.isValidUuid(idProperty))
				return {
					path: propertyPath,
					idProperty: idProperty
				};

			return false;
		},

		_subValueRemoved: function(res) {

			var obj = {};

			obj[this._lastPropertyName] = null;

			this._valueChanged(obj);
		},

		_subValueAdded: function(res) {

			var key = Object.keys(res)[0];

			this.propertyName = key + "/" + res[key].index;
			this.propertyPath = key + "/" + res[key].generatedId;

			var obj = {};

			obj[this.propertyName] = res[key].value[this.idProperty] || res[key].value;

			this._valueChanged(obj);
		}
	});
});