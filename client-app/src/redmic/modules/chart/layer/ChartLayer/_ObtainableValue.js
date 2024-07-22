define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "./_ObtainableValueItfc"
], function(
	declare
	, lang
	, aspect
	, _ObtainableValueItfc
) {

	return declare(_ObtainableValueItfc, {
		//	summary:
		//		Extensión para devolver el valor que toma una gráfica en una zona concreta.
		//		Solo es aplicable a gráficas por categorías (tartas).

		constructor: function(args) {

			this.config = {
				obtainableValueEvents: {
					GOT_CATEGORY_VALUE: "gotCategoryValue",
					GOT_CATEGORY_DATA: "gotCategoryData"
				},
				obtainableValueActions: {
					GOT_CATEGORY_VALUE: "gotCategoryValue",
					GOT_CATEGORY_DATA: "gotCategoryData"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixObtainableValueEventsAndActions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineObtainableValuePublications));
			aspect.after(this, "_createChartSections", lang.hitch(this, this._createObtainableValuePieSections));
			aspect.before(this, "_clear", lang.hitch(this, this._clearObtainableValue));
		},

		_mixObtainableValueEventsAndActions: function() {

			lang.mixin(this.events, this.obtainableValueEvents);
			lang.mixin(this.actions, this.obtainableValueActions);
			delete this.obtainableValueEvents;
			delete this.obtainableValueActions;
		},

		_defineObtainableValuePublications: function() {

			this.publicationsConfig.push({
				event: 'GOT_CATEGORY_VALUE',
				channel: this.getChannel("GOT_CATEGORY_VALUE")
			},{
				event: 'GOT_CATEGORY_DATA',
				channel: this.getChannel("GOT_CATEGORY_DATA")
			});
		},

		_createObtainableValuePieSections: function() {

			this._manageSubscriptionsToCategories(lang.hitch(this, this._subscribeToCategoriesObtainableValue));
		},

		_subscribeToCategoriesObtainableValue: function(categories) {

			categories
				.each(function(d, i) {

					this.__data__ = {
						data: d,
						index: i
					};
				})
				.on("mouseup.obtainableValue", lang.hitch(this, this._onMouseUpCategory))
				.on("mouseenter.obtainableValue", lang.hitch(this, this._onMouseEnterCategory))
				.on("mouseleave.obtainableValue", lang.hitch(this, this._onMouseLeaveCategory));
		},

		_onMouseUpCategory: function(_e, dataWrapper) {

			var d = dataWrapper.data,
				i = dataWrapper.index;

			if (!this._checkCategoryIsHidden(d, i)) {
				this._publishCleanCategoryValue(d, i);
				this._publishCategoryData(d);
			}
		},

		_onMouseEnterCategory: function(_e, dataWrapper) {

			var d = dataWrapper.data,
				i = dataWrapper.index;

			if (!this._checkCategoryIsHidden(d, i)) {
				this._publishCategoryValue(d, i);
			}
		},

		_publishCategoryData: function(d) {

			var pubObj = this._getObjectToPublishCategoryData(d);
			this._emitEvt("GOT_CATEGORY_DATA", pubObj);
		},

		_publishCategoryValue: function(d, i) {

			var pubObj = this._getObjectToPublishCategoryValue(d, i);
			this._emitEvt("GOT_CATEGORY_VALUE", pubObj);
		},

		_onMouseLeaveCategory: function(_e, dataWrapper) {

			var d = dataWrapper.data,
				i = dataWrapper.index;

			this._publishCleanCategoryValue(d, i);
		},

		_publishCleanCategoryValue: function(d, i) {

			var pubObj = this._getObjectToPublishCategoryValue(d, i);
			pubObj.value = null;

			this._emitEvt("GOT_CATEGORY_VALUE", pubObj);
		},

		_getObjectToPublishCategoryData: function(d) {

			return {
				d: d,
				categoryName: this.categoryName,
				layerInfo: this._getLayerInfo()
			};
		},

		_getObjectToPublishCategoryValue: function(d, i) {

			var data = d.data ? d.data : d,
				value = this._getCategoryValue(data),
				categoryName = this._getCategoryName(data, i),
				layerInfo = this._getLayerInfo(),
				total = layerInfo.totalCount,
				pubObj = {
					value: value,
					categoryName: categoryName,
					categoryIndex: i,
					layerInfo: layerInfo
				};

			var percentage = this._getCategoryPercentage(value, total);
			if (percentage) {
				pubObj.percentage = percentage;
			}

			var categoryDepth = d.depth;
			if (categoryDepth) {
				pubObj.categoryDepth = categoryDepth - 1;
			}

			return pubObj;
		},

		_getCategoryValue: function(data) {

			var dataObj = this._getFinalDataObj(data);

			return dataObj[this.valueName];
		},

		_getFinalDataObj: function(data) {

			if (data && data instanceof Array) {
				return data[this.depth];
			}

			return data;
		},

		_getCategoryName: function(data, i) {

			if (!data) {
				return;
			}

			if (!data[this.categoryName]) {
				data[this.categoryName] = this._generateCategoryName(data, i);
			}

			return data[this.categoryName];
		},

		_clearObtainableValue: function() {

			this._manageSubscriptionsToCategories(lang.hitch(this, this._unsubscribeFromCategoriesObtainableValue));
		},

		_unsubscribeFromCategoriesObtainableValue: function(categories) {

			categories && categories
				.on("mouseup.obtainableValue", null)
				.on("mouseenter.obtainableValue", null)
				.on("mouseleave.obtainableValue", null);
		}
	});
});
