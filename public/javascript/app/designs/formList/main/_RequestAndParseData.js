define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "dojo/promise/all"
], function (
	declare
	, lang
	, Deferred
	, all
){
	return declare(null, {
		//	summary:
		//		Extensión para main que usen el layout Form_List.

		constructor: function (args) {

			this.config = {
				items: {},
				pathSeparator: "."
			};

			lang.mixin(this, this.config, args);
		},

		_requestItems: function(data) {

			this._emitRequests && this._emitRequests(data);

			var allDfds = all(this._getRequestDfds ? this._getRequestDfds() : {});
			allDfds.then(lang.hitch(this, this._publishLocalData));

			return allDfds;
		},

		_emitRequests: function(data) {

			this.resultsToPub = lang.clone(data);

			for (var key in this.items) {
				var item = this.items[key];
				if (this._requiredPropertyAndExistValue(item, key)) {
					var ids = this._parsePathKeyAndReturnObj(key, data);

					if (ids instanceof Array) {
						this._activePost = true;
						this._emitRequest(ids, item, key);
					} else {
						this._emitGet(ids, item, key);
					}
				}
			}
		},

		_emitGet: function(ids, item, key) {

			var obj = {
				target: item.target,
				requesterId: this.getOwnChannel(),
				id: ids,
				options: {}
			};

			this._emitEvt('GET', obj);
		},

		_emitRequest: function(ids, item, key) {

			var obj = {
				target: item.target,
				requesterId: this.getOwnChannel(),
				method: "POST",
				action: "_mget",
				query: {
					ids: this._parseIdsOfMget(ids, key)
				}
			};

			this._emitEvt('REQUEST', obj);
		},

		_parseIdsOfMget: function(ids, key) {

			return ids;
		},

		_parsePathKeyAndReturnObj: function(key, obj) {

			var splitKey = key.split(this.pathSeparator);

			if (splitKey.length === 1) {
				return obj[key];
			}

			var returnObj = obj;

			for (var i = 0; i < splitKey.length; i++) {
				returnObj = returnObj[splitKey[i]];
			}

			return returnObj;
		},

		_getRequestDfds: function() {

			var dfds = {};

			for (var key in this.items) {
				if (this._requiredPropertyAndExistValue(this.items[key], key)) {
					this[key + 'Dfd'] = new Deferred();
					dfds[key] = this[key + 'Dfd'];
				}
			}

			return dfds;
		},

		_requiredPropertyAndExistValue: function(item, key) {

			if (!item.hasOwnProperty('required') || item.required || this.resultsToPub[key]) {
				return true;
			}

			return false;
		},

		_chkTargetIsMine: function(res) {

			var target = res.target;

			return (this._isTargetAnyOfMine && this._isTargetAnyOfMine(target)) || this._targetIsMine(target);
		},

		_isTargetAnyOfMine: function(target) {

			for (var key in this.items) {
				if (target === this.items[key].target) {
					return true;
				}
			}

			return false;
		},

		_itemAvailable: function(response) {

			var target = response.target,
				data = response.data;

			for (var key in this.items) {
				if (target === this.items[key].target) {
					this[key + 'Dfd'].resolve(data);
				}
			}
		},

		_dataAvailable: function(response) {

			var target = response.target,
				data = response.data;

			if (this._activePost) {
				this._activePost = false;
				for (var key in this.items) {
					if (target === this.items[key].target) {
						this[key + 'Dfd'].resolve(this._parseResultMget(data.data, key));
						break;
					}
				}
			}
		},

		_parseResultMget: function(data, key) {

			return data;
		},

		_publishLocalData: function(dataToInject) {

			if (this.resultsToPub) {
				lang.mixin(this.resultsToPub, dataToInject);
			} else {
				this.resultsToPub = dataToInject;
			}

			this._parseDataWithKeySplit();
		},

		_parseDataWithKeySplit: function() {

			var obj = {};

			for (var key in this.items) {
				var keySplit = key.split(this.pathSeparator);
				if (keySplit.length > 1 && this.resultsToPub[key]) {
					var objPosAct = lang.clone(this.resultsToPub[key]);
					for (var i = keySplit.length - 1; i > 0; i--) {
						var aux = {};
						aux[keySplit[i]] = objPosAct;
						objPosAct = aux;
					}

					obj[keySplit[0]] = objPosAct;

					delete this.resultsToPub[key];
				}
			}

			this.resultsToPub = this._merge([this.resultsToPub, obj || {}]);
		}
	});
});
