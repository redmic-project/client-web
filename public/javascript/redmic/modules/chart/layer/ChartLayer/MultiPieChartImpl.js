define([
	'd3/d3.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "./_ColorHierarchyGeneration"
	, "./_PieCommons"
], function(
	d3
	, declare
	, lang
	, aspect
	, _ColorHierarchyGeneration
	, _PieCommons
){
	return declare([_PieCommons, _ColorHierarchyGeneration], {
		//	summary:
		//		Implementación de gráfica de tarta/donut a muchos niveles.

		constructor: function(args) {

			this.config = {
				ownChannel: 'multiPieChart',

				className: 'multiPieChart',
				sectionClass: 'multiPieSection',
				hole: true,
				childrenName: 'categories',
				visibleDepths: 2,

				_maxDepthReached: 0,
				_ringRadius: 0,
				_updateChartSectionsTimeout: 100
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_addData', lang.hitch(this, this._beforeAddData));
		},

		_beforeAddData: function(data) {

			this._ringRadiusDivisor = this.visibleDepths + (this.hole ? 1 : 0);
		},

		_childrenAccessor: function(d) {

			return this._getComponentValue(d, this.childrenName);
		},

		_valueAccessor: function(d) {

			if (d[this.childrenName] && d[this._getValuePath(this.valueName)] !== undefined) {
				return;
			}

			return this.inherited(arguments);
		},

		_setSize: function(req) {

			this._radius = this._getMaxRadius();
			this._ringRadius = this._getRingRadius();

			clearTimeout(this._updateChartSectionsTimeoutHandler);
			this._updateChartSectionsTimeoutHandler = setTimeout(lang.hitch(this, this._updateChartSections),
				this._updateChartSectionsTimeout);
		},

		_getRingRadius: function(depth) {

			return this._radius / this._getRingRadiusDivisor();
		},

		_getRingRadiusDivisor: function() {

			return this._ringRadiusDivisor;
		},

		_getChartHoleRadius: function() {

			return this.hole ? this._ringRadius : 0;
		},

		_updateChartSource: function() {

			if (!this._chartSource) {
				this._chartSource = d3.arc()
					.startAngle(lang.hitch(this, this._getStartAngle))
					.endAngle(lang.hitch(this, this._getEndAngle))
					.innerRadius(lang.hitch(this, this._calculateInnerRadius))
					.outerRadius(lang.hitch(this, this._calculateOuterRadius));
			}
		},

		_getStartAngle: function(d) {

			return d.x0;
		},

		_getEndAngle: function(d) {

			return d.x1;
		},

		_calculateInnerRadius: function(d) {

			if (!this.hole && d.depth === 1) {
				return 0;
			}

			return d.y0;
		},

		_calculateOuterRadius: function(d) {

			return d.y1;
		},

		_updateChartSourceHelper: function() {

			if (!this._chartSourceHelper) {
				this._chartSourceHelper = d3.partition()
					.size([2 * Math.PI, this._radius]);
			}
		},

		_updateColor: function() {

			if (!this._categories) {
				return;
			}

			if (this.color instanceof Array) {
				this.color = [this.color];

				this._applyChartColor(0);
				this._generateColorsForNextLevels();
			} else {
				for (var key in this._categories) {
					var category = this._categories[key];
					category.attr('fill', this.color);
				}
			}
		},

		_applyChartSourceAndSourceHelper: function(dfd) {

			this._rootData = d3.hierarchy(this._data, lang.hitch(this, this._childrenAccessor))
				.sum(lang.hitch(this, this._valueAccessor));

			this._nodes = this._getPartitionNodes();

			this._updateDataMetrics();
			this._createChartSections();

			return this._prepareApplyChartSource(dfd, true);
		},

		_getPartitionNodes: function() {

			var nodes = this._chartSourceHelper(this._rootData).descendants();

			return nodes.filter(this._filterPartitionTinyNodes);
		},

		_filterPartitionTinyNodes: function(d) {

			return (d.x1 - d.x0) > 0.005;
		},

		_updateDataMetrics: function() {

			this._totalCount = this._valueAccessor(this._rootData);
			this._maxDepthReached = this._rootData.height;
		},

		_createChartSections: function() {

			this._categories = {};

			for (var depth = 1; depth <= this.visibleDepths; depth++) {
				var categoriesInThisDepth = this._nodes.filter(lang.partial(this._filterCategoriesByDepth, depth));

				if (!categoriesInThisDepth.length) {
					break;
				}

				var depthGroup = this._chart.append('svg:g')
					.attr('depth', depth);

				this._categories[depth - 1] = depthGroup;

				this._createMultiPieSectionsLevel(categoriesInThisDepth, depthGroup);
			}

			this._createElementSelections();
		},

		_filterCategoriesByDepth: function(depth, d) {

			return d.depth === depth;
		},

		_createMultiPieSectionsLevel: function(categoriesInThisDepth, depthGroup) {

			for (var i = 0; i < categoriesInThisDepth.length; i++) {
				var categories = depthGroup.selectAll('g.' + this.sectionClass)
					.data(categoriesInThisDepth).enter()
						.append('svg:g')
							.attr('class', this.sectionClass)
							.attr('opacity', lang.hitch(this, this._getOpacityForCategory));

				categories.append('svg:path');
			}
		},

		_getOpacityForCategory: function(d) {

			return this._checkCategoryIsHidden(d) ? this.lowOpacity : 1;
		},

		_createElementSelections: function() {

			this._categoriesPaths = this._chart.selectAll('g.' + this.sectionClass + ' path');
		},

		_updateChartSections: function() {

			if (!this._chartSourceHelper || !this._categoriesPaths) {
				return;
			}

			this._chartSourceHelper.size([2 * Math.PI, this._radius]);
			this._chartSourceHelper(this._rootData);

			this._categoriesPaths.attr('d', this._chartSource);
		},

		_manageSubscriptionsToCategories: function(method) {

			for (var key in this._categories) {
				var categories = this._categories[key];

				method(categories.selectAll('g.' + this.sectionClass));
			}
		},

		_getAnimateChartSourceStartProps: function(d) {

			var startX = this._getAngleXStartPosition(this.clockwiseTransition);

			return {
				x0: startX,
				x1: startX
			};
		},

		_getAngleXStartPosition: function(clockwise) {

			return clockwise ? 0 : 2 * Math.PI;
		},

		_clearCategories: function() {

			if (!this._categories) {
				return;
			}

			for (var level in this._categories) {
				this._clearCategoriesFromLevel(level);
			}
		},

		_clearCategoriesFromLevel: function(level) {

			var categoriesInLevel = this._categories[level];

			if (categoriesInLevel) {
				categoriesInLevel.selectAll('g.' + this.sectionClass).remove();
				categoriesInLevel.remove();
			}
		},

		_getData: function() {

			if (!this._categories || !this._categories[0]) {
				return;
			}

			var sectionData = this._categories[0].selectAll('g.' + this.sectionClass).data(),
				categories = sectionData.map(function(item) {

					return item.data;
				});

			var data = {};
			data[this.categoryName] = 'root';
			data[this.childrenName] = categories;

			return data;
		},

		_setLayerAdditionalInfo: function(req) {

			var data = req.data;

			if (data) {
				var categories = data[this.childrenName];
				this._colorsNeeded = categories ? categories.length : 0;
				this._entriesCount = this._colorsNeeded;
				this._emptyDataAdded = categories ? !categories.length : true;
			} else {
				this._emptyDataAdded = true;
			}
		},

		_findCategoryElement: function(index) {

			if (!this._categories) {
				return;
			}

			var res = [];
			for (var level in this._categories) {
				var categoriesInLevel = this._categories[level],
					filteredCategoriesInLevel = categoriesInLevel.selectAll('g.' + this.sectionClass)
						.filter(lang.hitch(this, this._filterToGetChildrenOfCategoryElement, index));

				if (filteredCategoriesInLevel.length) {
					res.push(filteredCategoriesInLevel[0]);
				}
			}

			return res;
		},

		_filterToGetChildrenOfCategoryElement: function(index, d, i) {

			var oldestAncestor = this._findOldestValidAncestor(d),
				oldestAncestorIndex = oldestAncestor.parent.children.indexOf(oldestAncestor);

			return oldestAncestorIndex === index;
		},

		_findOldestValidAncestor: function(d) {

			while (d.parent && d.parent.parent) {
				d = d.parent;
			}

			return d;
		},

		_checkCategoryIsHidden: function(d) {

			var oldestAncestor = this._findOldestValidAncestor(d),
				oldestAncestorIndex = oldestAncestor.parent.children.indexOf(oldestAncestor);

			return !!this._hiddenCategories[oldestAncestorIndex] || this._allCategoriesHidden;
		}
	});
});
