define([
	'd3'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
], function(
	d3
	, declare
	, lang
	, aspect
	, Utilities
) {
	return declare(null, {
		//	summary:
		//		Extensión para consultar el valor que toma una gráfica en un punto concreto.
		//		Es decir, dado un valor para 'x', devuelve el valor de 'y' correspondiente.
		//		Solo es aplicable a gráficas lineales (con elemento 'path').

		constructor: function(args) {

			this.config = {
				queryableValueEvents: {
					GOT_Y_VALUE: "gotYValue"
				},
				queryableValueActions: {
					GET_Y_VALUE: "getYValue",
					GOT_Y_VALUE: "gotYValue"
				},

				countName: "count",
				_getYValueTimeout: 100
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixQueryableValueEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineQueryableValueSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineQueryableValuePublications));
			aspect.after(this, "_setSettingsForTooBigData", lang.hitch(this,
				this._setQueryableValueSettingsForTooBigData));

			aspect.after(this, "_setSettingsForNotTooBigData", lang.hitch(this,
				this._setQueryableValueSettingsForNotTooBigData));

			this._currentGetYValueTimeout = this._getYValueTimeout;
		},

		_mixQueryableValueEventsAndActions: function() {

			lang.mixin(this.events, this.queryableValueEvents);
			lang.mixin(this.actions, this.queryableValueActions);
			delete this.queryableValueEvents;
			delete this.queryableValueActions;
		},

		_defineQueryableValueSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getChannel("GET_Y_VALUE"),
				callback: "_subGetYValue"
			});
		},

		_defineQueryableValuePublications: function() {

			this.publicationsConfig.push({
				event: 'GOT_Y_VALUE',
				channel: this.getChannel("GOT_Y_VALUE")
			});
		},

		_subGetYValue: function(req) {

			clearTimeout(this._getYValueTimeoutHandler);
			this._getYValueTimeoutHandler = setTimeout(lang.hitch(this, this._getYValue, req),
				this._currentGetYValueTimeout);
		},

		_getYValue: function(req) {

			var xValueRequested = req.x,
				resObj = {
					x: null,
					y: null,
					value: null,
					distanceToReqX: Number.POSITIVE_INFINITY,
					layerInfo: this._getLayerInfo()
				},
				res;

			if (!this._layerIsHidden) {

				var data = this._getData();
				res = data ? this._findYValueInData(data, xValueRequested, resObj) : resObj;
			} else {

				res = resObj;
			}

			this._emitEvt("GOT_Y_VALUE", res);
		},

		_findYValueInData: function(data, reqX, resObj) {

			var dataItem;
			if (data.length === 1) {

				dataItem = data[0];
			} else if (Utilities.isValidNumber(reqX)) {

				dataItem = this._getDesiredDataItemFromData(data, reqX);
			}

			return dataItem ? this._getUpdatedResponseObject(dataItem, reqX, resObj) : resObj;
		},

		_getDesiredDataItemFromData: function(data, reqX) {

			if (!this._bisectX) {

				this._createBisector();
			}

			var i = this._findPositionOfNearestValueInData(data, reqX);

			return data[i];
		},

		_createBisector: function() {

			var self = this;

			this._bisectX = d3.bisector(function(d) {

				return lang.hitch(self, self._getXTranslatedToScale)(d);
			}).left;
		},

		_getUpdatedResponseObject: function(item, reqX, resObj) {

			resObj.value = this._getComponentValue(item, this._getValuePath(this.yName));

			if (item[this.yName]) {

				var countPath = this.yName + this.pathSeparator + this.countName,
					count = this._getComponentValue(item, countPath);

				if (count) {

					resObj.count = count;
				}
			}

			if (Utilities.isValidNumber(resObj.value)) {

				resObj.x = this._getXTranslatedToScale(item);
				resObj.distanceToReqX = resObj.x >= reqX ? resObj.x - reqX : reqX - resObj.x;
				resObj.y = this._getYTranslatedToScale(item);
			}

			return resObj;
		},

		_findPositionOfNearestValueInData: function(data, x) {

			var i = this._bisectX(data, x, 1),
				d0Index = i > 0 ? i - 1 : i,
				d1Index = i < data.length ? i : i - 1,
				d0 = data[d0Index],
				d1 = data[d1Index],
				d0YValue = this._getComponentValue(d0, this._getValuePath(this.yName)),
				d1YValue = this._getComponentValue(d1, this._getValuePath(this.yName));

			if (!Utilities.isValidNumber(d0YValue)) {

				if (d0Index > 0) {

					d0Index--;
				} else {

					d0Index = d1Index;
					d1Index++;
					d1 = data[d1Index];
					d1YValue = this._getComponentValue(d1, this._getValuePath(this.yName));
				}

				d0 = data[d0Index];
			}

			if (!Utilities.isValidNumber(d1YValue)) {

				if (d1Index < data.length - 1) {

					d1Index++;
				} else {

					d1Index = d0Index;
				}

				d1 = data[d1Index];
			}

			var d0XValue = this._getXTranslatedToScale(d0),
				d1XValue = this._getXTranslatedToScale(d1);

			return (x - d0XValue) > (d1XValue - x) ? d1Index : d0Index;
		},

		_findYValueInPath: function(path, x) {

			var beginning = x,
				end = path.getTotalLength(),
				target, pos;

			while (true) {

				target = Math.floor((beginning + end) / 2);
				pos = path.getPointAtLength(target);

				if ((target === end || target === beginning) && pos.x !== x) {

					break;
				}

				if (pos.x > x) {

					end = target;
				} else if (pos.x < x) {

					beginning = target;
				} else {

					break;
				}
			}

			return pos.y;
		},

		_setQueryableValueSettingsForTooBigData: function() {

			this._currentGetYValueTimeout = this._getYValueTimeout;
		},

		_setQueryableValueSettingsForNotTooBigData: function() {

			this._currentGetYValueTimeout = 0;
		}
	});
});
