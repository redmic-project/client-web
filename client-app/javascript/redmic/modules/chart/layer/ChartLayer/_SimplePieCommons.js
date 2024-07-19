define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	declare
	, lang
){
	return declare(null, {
		//	summary:
		//		Base común para las gráficas que contienen un pie simple (tartas, rosas...).

		constructor: function(args) {

			this.config = {
			};

			lang.mixin(this, this.config, args);
		},

		_createChartSections: function() {

			this._categories = this._categoryGroup.enter()
				.append("svg:g")
					.attr("class", this.sectionClass)
					.attr("opacity", 1);

			this._categoriesPaths = this._categories.append("svg:path");
		},

		_findCategoryElement: function(i) {

			return this._chart.select("g." + this.sectionClass + ":nth-child(" + (i + 1) + ")");
		},

		_checkCategoryIsHidden: function(d, i) {

			return !!this._hiddenCategories[i] || this._allCategoriesHidden;
		},

		_manageSubscriptionsToCategories: function(method) {

			method(this._categories);
		},

		_clearCategories: function() {

			this._categories && this._categories.remove();
			this._categories = null;

			this._categoryGroup && this._categoryGroup.remove();
			this._categoryGroup = null;
		},

		_getData: function() {

			var data;

			if (this._categoryGroup) {
				data = this._categoryGroup.data();
			}

			return data;
		}
	});
});
