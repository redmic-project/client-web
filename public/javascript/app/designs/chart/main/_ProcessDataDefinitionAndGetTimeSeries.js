define([
	"app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/base/_Store"
], function (
	redmicConfig
	, declare
	, lang
	, aspect
	, _Filter
	, _Store
){
	return declare([_Filter, _Store], {
		//	summary:
		//		Extensión para procesar las estructuras de datos que representan a los
		//		DataDefinition y obtener datos de TimeSeries asociados.

		constructor: function(args) {

			this.config = {
				// TODO pueden pedirse por aqui series de datos no temporales, este target no se puede poner siempre
				target: redmicConfig.services.timeSeriesTemporalData,
				_specificPathLengthLimit: 4,

				filterConfig: {
					initQuery: {
						size: null,
						from: null
					}
				}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_setInterval', lang.hitch(this, this._buildQueryAndRequestData));
		},

		_getCategories: function() {

			return this._filterAncestors(this._categoriesIndexed.stations || this._buildCategory("stations"));
		},

		_filterAncestors: function(categories) {

			var filtered = {};
			for (var path in categories) {

				var pathSplitted = path.split(this.pathSeparator);
				if (pathSplitted.length > this._specificPathLengthLimit) {

					filtered[path] = categories[path];
				}
			}

			return filtered;
		},

		_getHierarchicalInfo: function(category) {

			var categoriesByStations = this._categoriesIndexed.stations || this._buildCategory("stations"),

				categoriesByParameters = this._categoriesIndexed.parameters || this._buildCategory("parameters");

				categoriesNoGrouped = this._categoriesIndexed.noGrouped ||
					this._getFlattenedData("noGrouped", this._categoriesIndexed.stations);

			return {
				byStations: this._getCategoryAndAncestors(category, categoriesByStations),
				byParameters: this._getCategoryAndAncestors(category, categoriesByParameters),
				noGrouped: this._getCategoryNoGrouped(category, categoriesNoGrouped)
			};
		},

		_getCategoryAndAncestors: function(category, categories) {

			var categoryKeys = Object.keys(categories),
				retObj = {};

			for (var i = 0; i < categoryKeys.length; i++) {

				var cat = categoryKeys[i],
					catSplitted = cat.split(this.pathSeparator);

				if (catSplitted.length > this._specificPathLengthLimit) {

					var categoryIsAnArray = category instanceof Array,
						childCat = catSplitted[catSplitted.length - 1];

					if (categoryIsAnArray && typeof category[0] === "number") {
						childCat = parseInt(childCat, 10);
					}

					if (!categoryIsAnArray ? category == childCat :
						category.indexOf(childCat) !== -1) {

						while (catSplitted.length > 1) {

							var catJoined = catSplitted.join(this.pathSeparator),
								obj = categories[catJoined];

							if (obj) {
								retObj[catJoined] = obj;
							}
							catSplitted.pop();
						}
					}
				}
			}

			return retObj;
		},

		_getFlattenedData: function(rootCategory, dataByStations) {

			if (!this._categoriesIndexed[rootCategory]) {

				this._categoriesIndexed[rootCategory] = {};
			}

			for (var item in dataByStations) {

				var splitItem = item.split(this.pathSeparator);

				if (splitItem.length > this._specificPathLengthLimit) {

					this._processItem(rootCategory, splitItem, dataByStations, item);
				}
			}

			return this._categoriesIndexed[rootCategory];
		},

		_processItem: function(rootCategory, splitItem, dataByStations, item) {

			var keyData = "r." + splitItem[1];

			this._categoriesIndexed[rootCategory][item] = {
				"station": dataByStations[keyData],
				"parameter": dataByStations[keyData + this.pathSeparator + splitItem[2]],
				"definition": dataByStations[item],
				"parentPath": splitItem.join(this.pathSeparator)
			};
		},

		_getCategoryNoGrouped: function(category, categories) {

			var retObj = this._getCategoryAndAncestors(category, categories);

			for (var item in retObj) {

				if (!retObj[item]) {

					delete retObj[item];
				}
			}

			return retObj;
		},

		_buildCategory: function(rootCategory) {

			var level1, level2, data1, data2, level3Selector1, level3Selector2,
				level3 = this.chartsData.definitionIndex,
				data3 = this.chartsData.data.definitions;

			if (rootCategory === "parameters") {
				level1 = this.chartsData.parameterIndex;
				level2 = this.chartsData.stationIndex;
				data1 = this.chartsData.data.parameters;
				data2 = this.chartsData.data.stations;
				level3Selector1 = "sIds";
				level3Selector2 = "pIds";
			} else {
				level1 = this.chartsData.stationIndex;
				level2 = this.chartsData.parameterIndex;
				data1 = this.chartsData.data.stations;
				data2 = this.chartsData.data.parameters;
				level3Selector1 = "pIds";
				level3Selector2 = "sIds";
			}

			if (!this._categoriesIndexed[rootCategory]) {
				this._categoriesIndexed[rootCategory] = {};
			}

			this._iterateAndSetCategoryItems(rootCategory, level1, level2, level3, data1, data2,
				data3, level3Selector1, level3Selector2);

			return this._categoriesIndexed[rootCategory];
		},

		_iterateAndSetCategoryItems: function(rootCategory, level1, level2, level3, data1, data2, data3,
			level3Selector1, level3Selector2) {
			//	summary:
			//		Construye la estructura por categorías con los elementos indexados por path.
			//		Los path se componen de la forma: 'r.stationId.parameterId.zValue.definitionId'.

			for (var level1Id in level1) {
				var itemL1 = level1[level1Id],
					pathL1 = "r" + this.pathSeparator + level1Id,
					objL1 = data1[level1Id];

				this._categoriesIndexed[rootCategory][pathL1] = objL1;

				for (var i = 0; i < itemL1.length; i++) {
					var level2Id = itemL1[i],
						itemL2 = level2[level2Id],
						pathL2 = pathL1 + this.pathSeparator + level2Id,
						objL2 = data2[level2Id];

					this._categoriesIndexed[rootCategory][pathL2] = objL2;

					for (var level3Id in level3) {
						var itemL3 = level3[level3Id];
						if (itemL3[level3Selector1] == level2Id && itemL3[level3Selector2] == level1Id) {
							var level3IdSplitted = level3Id.split(this.idSeparator);
							for (var j = 0; j < level3IdSplitted.length; j++) {
								var level3IdComponent = level3IdSplitted[j],
									objL3 = data3[level3IdComponent],
									zValue = objL3.z,
									zId = zValue.toString().replace('.', ','),
									pathL3 = pathL2 + this.pathSeparator + zId + this.pathSeparator +
										level3IdComponent;

								this._categoriesIndexed[rootCategory][pathL3] = objL3;
							}
						}
					}
				}
			}
		},

		_dataAvailable: function(res) {

			if (!res || !res.data || !res.data.data || !res.data.data.length) {
				return;
			}

			var data = res.data.data,
				minDate = data[0].date,
				maxDate = data[data.length - 1].date,
				minValue = res.data.minValue,
				maxValue = res.data.maxValue,
				dataDefinitionIds = res.data.dataDefinitionIds,
				parameterName = this._getParameterName(dataDefinitionIds),
				objToPub = {
					data: data,
					xMin: minDate,
					xMax: maxDate,
					yMin: minValue,
					yMax: maxValue,
					parameterName: parameterName
				};

			this._data[dataDefinitionIds] = objToPub;

			this._selectAndRemoveUnusedAggregationCharts(dataDefinitionIds, []);
			this._addUsedAggregationChart(this._aggregations, dataDefinitionIds);
		},

		_getDefinitionsData: function(key) {

			var definitionData = lang.clone(this.chartsData.data.definitions[key]);

			switch (this._interval) {

				case "day":
					definitionData.timeInterval = 86400;
					break;
				case "week":
					definitionData.timeInterval = 604800;
					break;
				case "month":
					definitionData.timeInterval = 2628000;
					break;
				case "year":
					definitionData.timeInterval = 31540000;
					break;
				default:
			}

			return definitionData;
		},

		_getParameterName: function(ids) {

			var categories = this._categoriesIndexed.stations,
				idsSplitted = ids.toString().split(this.idSeparator);

			for (var i = 0; i < idsSplitted.length; i++) {

				var idsComponent = idsSplitted[i];
				for (var path in this.categories) {

					var pathSplitted = path.split(this.pathSeparator),
						id = pathSplitted.pop();

					if (id === idsComponent) {

						pathSplitted.splice(this._specificPathLengthLimit - 1, 1);

						var parentPath = pathSplitted.join(this.pathSeparator),
							parameter = categories[parentPath],
							unit = parameter.unit;

						return unit;
					}
				}
			}
		},

		_buildQueryAndRequestData: function() {

			if (!this.chartsData) {
				return;
			}

			// TODO cada item tiene que esperar por el ADDED_TO_QUERY del anterior, salvo el primero
			for (var cat in this.chartsData.definitionIndex) {
				var dataDefinitionIds = [],
					catSplitted = cat.split(this.idSeparator);

				for (var i = 0; i < catSplitted.length; i++) {
					dataDefinitionIds.push(parseInt(catSplitted[i], 10));
				}

				this.reqObjQuery && delete this.reqObjQuery.terms;

				var objQuery = this._merge([{
					dateLimits: null,
					accessibilityIds: null,
					vFlags: null,
					qFlags: null
				}, this.reqObjQuery || {}, {
					terms: {
						dataDefinition: dataDefinitionIds
					},
					returnFields: ["value", "date"]
				}]);

				var activityId = this.chartsData.data.activityId;
				if (activityId) {
					objQuery.terms.activityId = activityId;
					objQuery.terms.grandparentId = activityId;
				}

				if (this._interval !== "raw") {
					objQuery.interval = this._interval;
				} else {
					objQuery.interval = null;
				}

				this._emitEvt('ADD_TO_QUERY', {
					query: objQuery
				});
			}
		}
	});
});
