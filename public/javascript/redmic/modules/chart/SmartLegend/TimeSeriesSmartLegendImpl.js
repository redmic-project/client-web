define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/chart/SmartLegend/SmartLegend"
	, "RWidgets/Utilities"
	, "templates/ChartListHierarchical"
	, "templates/ChartList"
], function(
	declare
	, lang
	, aspect
	, SmartLegend
	, Utilities
	, HierarchicalTemplate
	, NonHierarchicalTemplate
){
	return declare(SmartLegend, {
		//	summary:
		//		Implementación de SmartLegend para representar información sobre capas basadas en
		//		datos procedentes de series temporales.

		constructor: function(args) {

			this.config = {
				ownChannel: "timeSeriesSmartLegend",
				_specificPathLengthLimit: 4
			};

			lang.mixin(this, this.config, args);
		},

		_getAncestorLabel: function(ancestorData) {

			if (Utilities.isValidNumber(ancestorData.z))
				return ancestorData.z;

			return ancestorData.name;
		},

		_getHierarchicalTemplate: function() {

			return HierarchicalTemplate;
		},

		_getNonHierarchicalTemplate: function() {

			return NonHierarchicalTemplate;
		},

		_addDataToBrowser: function(data) {

			if (this._currentIndex !== "noGrouped") {

				data = this._removeDefinitionIdsFromPaths(lang.clone(data));
			}

			this.inherited(arguments);
		},

		_removeDefinitionIdsFromPaths: function(data) {

			for (var i = 0; i < data.length; i++) {

				var item = data[i],
					itemPath = item.path;

				item.path = this._cleanLayerPath(itemPath);
			}

			return data;
		},

		_cleanLayerPath: function(itemPath) {

			var pathSplitted = itemPath.split(this.pathSeparator);

			if (pathSplitted.length > this._specificPathLengthLimit) {

				pathSplitted.splice(this._specificPathLengthLimit, 1);
				return pathSplitted.join(this.pathSeparator);
			}

			return itemPath;
		},

		_getPubToLayerObj: function(pubObj) {

			var layerId = pubObj.layerId;

			if (this._layerIdByPseudonym[layerId]) {

				var colorIndex = pubObj.layerId.split(this._pseudonymSeparator).pop();
				pubObj.colorIndex = parseInt(colorIndex, 10);
				pubObj.layerId = this._layerIdByPseudonym[layerId];
			}

			return pubObj;
		}

	});
});
