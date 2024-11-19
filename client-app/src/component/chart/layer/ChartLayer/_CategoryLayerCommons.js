define([
	'd3'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "dojo/promise/all"
	, "RWidgets/Utilities"
	, "./_CategoryLayerCommonsItfc"
], function(
	d3
	, declare
	, lang
	, aspect
	, Deferred
	, all
	, Utilities
	, _CategoryLayerCommonsItfc
){
	return declare(_CategoryLayerCommonsItfc, {
		//	summary:
		//		Base común para las gráficas organizadas por categorías.

		constructor: function(args) {

			this.config = {
				categoryName: "name",
				valueName: "value",
				lowOpacity: 0.3,

				_hiddenCategories: {},
				_allCategoriesHidden: false,

				categoryLayersCommonsEvents: {
					ZERO_VALUE_DATA_ADDED: "zeroValueDataAdded"
				},
				categoryLayersCommonsActions: {
					ZERO_VALUE_DATA_ADDED: "zeroValueDataAdded"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_mixEventsAndActions", lang.hitch(this,
				this._mixCategoryLayersCommonsEventsAndActions));

			aspect.before(this, "_definePublications", lang.hitch(this, this._defineCategoryLayersCommonsPublications));
		},

		_mixCategoryLayersCommonsEventsAndActions: function() {

			lang.mixin(this.events, this.categoryLayersCommonsEvents);
			lang.mixin(this.actions, this.categoryLayersCommonsActions);

			delete this.categoryLayersCommonsEvents;
			delete this.categoryLayersCommonsActions;
		},

		_defineCategoryLayersCommonsPublications: function() {

			this.publicationsConfig.push({
				event: 'ZERO_VALUE_DATA_ADDED',
				channel: this.getChannel('ZERO_VALUE_DATA_ADDED')
			});
		},

		_isValidData: function(d) {

			var categoryValue = this._getComponentValue(d, this.categoryName),
				value = this._getComponentValue(d, this._getValuePath(this.valueName));

			return categoryValue !== null && value !== null;
		},

		_getLayerAdditionalInfo: function(options) {

			return {
				totalCount: this._getTotalCount()
			};
		},

		_getTotalCount: function() {

			return this._totalCount || 0;
		},

		_clear: function() {

			this._clearCategories();
			this._chart && this._chart.remove();
			this._chart = null;
		},

		_isReadyToDraw: function() {

			return this._isDataAdded();
		},

		_show: function(req) {

			var index = req ? req.index : null,
				dfd = new Deferred();

			if (Utilities.isValidNumber(index)) {
				delete this._hiddenCategories[index];
			} else {
				this._allCategoriesHidden = false;
			}

			return this._changeCategoryElementsOpacity(index, 1, dfd);
		},

		_hide: function(req) {

			var index = req ? req.index : null,
				dfd = new Deferred();

			if (Utilities.isValidNumber(index)) {
				this._hiddenCategories[index] = true;
			} else {
				this._allCategoriesHidden = true;
			}

			return this._changeCategoryElementsOpacity(index, this.lowOpacity, dfd);
		},

		_changeCategoryElementsOpacity: function(index, opacity, dfd) {

			var element;

			if (Utilities.isValidNumber(index)) {
				element = this._findCategoryElement(index);
			} else {
				element = this._container;
			}

			if (!element) {
				dfd.resolve();
				return dfd;
			}

			if (element instanceof Array) {
				return this._changeElementsOpacity(element, opacity, dfd);
			}

			return this._changeElementOpacity(element, opacity, dfd);
		},

		_changeElementsOpacity: function(elements, opacity, dfd) {

			var dfds = [];
			for (var i = 0; i < elements.length; i++) {
				var element = elements[i],
					subDfd = new Deferred();

				dfds.push(subDfd);

				if (element instanceof Array) {
					this._changeElementsOpacity(element, opacity, subDfd);
				} else {
					this._changeElementOpacity(d3.select(element), opacity, subDfd);
				}
			}

			all(dfds).then(dfd.resolve);

			return dfd;
		}
	});
});
