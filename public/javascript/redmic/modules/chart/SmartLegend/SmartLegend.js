define([
	"app/designs/list/Controller"
	, "app/designs/list/layout/NoTitle"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/query"
	, 'put-selector/put'
	, "RWidgets/Utilities"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "redmic/modules/base/_Store"
	, "redmic/modules/base/_ShowInTooltip"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/HierarchicalImpl"
	, "redmic/modules/layout/listMenu/ListMenu"
	, "redmic/modules/form/input/ColorPickerImpl"
	, "./_SmartLegendItfc"
], function(
	ListController
	, ListLayout
	, declare
	, lang
	, query
	, put
	, Utilities
	, _Module
	, _Show
	, _Store
	, _ShowInTooltip
	, _ButtonsInRow
	, _Framework
	, HierarchicalImpl
	, ListMenu
	, ColorPickerImpl
	, _SmartLegendItfc
) {
	return declare([_Module, _Show, _Store, _SmartLegendItfc], {
		//	summary:
		//		Leyenda inteligente asociada al contenedor de gráficas.

		constructor: function(args) {

			this.config = {
				events: {
					TEMPLATE_UPDATE_LIST: "templateUpdateList",
					GET_LAYER_INFO: "getLayerInfo",
					HIDE_LAYER: "hideLayer",
					SHOW_LAYER: "showLayer",
					SET_LAYER_COLOR: "setLayerColor",
					REMOVE_LAYER: "removeLayer",
					COPY_CHART_COLOR: "copyChartColor"
				},
				actions: {
					ADD_ENTRY: 'addEntry',
					ENTRY_ENABLED: 'entryEnabled',
					ENTRY_DISABLED: 'entryDisabled'
				},

				idProperty: "path",
				pathSeparator: ".",
				_pseudonymSeparator: "_",
				_localTarget: "local",
				_pathsByLayerId: {},
				_layerIdByPseudonym: {},
				_currentData: {},
				_currentIndex: "noGrouped",
				_hiddenLayers: {},
				_layerEntries: {},
				_stateByLayerId: {}
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			var ListDesignDefinition = declare([ListLayout, ListController]);
			this.chartsList = new ListDesignDefinition({
				parentChannel: this.getChannel(),
				title: this.i18n.selectedCharts,
				target: this._localTarget,
				buttons: {
					"iconListMenu": {
						className: "fa-sort-amount-desc",
						title: this.i18n.changeIndexingField
					}
				},
				browserBase: [HierarchicalImpl, _Framework, _ButtonsInRow],
				browserConfig: {
					idProperty: this.idProperty,
					template: this._getNonHierarchicalTemplate(),
					frameWorkClass: ".flexEndContent",
					rowConfig: {
						buttonsConfig: {
							noSpaceWhenNoButtons: true,
							listButton: [{
								icon: "fa-tint",
								btnId: "colorPicker",
								title: "color",
								returnItem: true,
								node: true,
								condition: function(item) { return !item.leaves; },
								startup: lang.hitch(this, this._startupColorPickerIcon)
							},{
								icon: "fa-toggle-on",
								altIcon: "fa-toggle-off",
								btnId: "toggleShowLayer",
								title: "layer",
								state: false,
								returnItem: true,
								condition: function(item) { return !item.leaves; }
							/*},{
								icon: "fa-trash-o",
								btnId: "removeLayer",
								title: "remove",
								returnItem: true,
								condition: function(item) { return !item.leaves }*/
							}]
						}
					}
				}
			});

			var ListMenuDefinition = declare(ListMenu).extend(_ShowInTooltip);
			this.listMenu = new ListMenuDefinition({
				classTooltip: "tooltipButtonMenu tooltipButtonAggrement",
				parentChannel: this.getChannel(),
				select: {
					"default": 0
				},
				items: [{
					label: this.i18n.noGrouped,
					value: "noGrouped"
				},{
					label: this.i18n.groupedByParameters,
					value: "byParameters"
				},{
					label: this.i18n.groupedByStations,
					value: "byStations"
				}]
			});

			var ColorPickerDefinition = declare(ColorPickerImpl).extend(_ShowInTooltip);
			this._colorPicker = new ColorPickerDefinition({
				parentChannel: this.getChannel(),
				idProperty: this.idProperty,
				propertyName: "colorPicker",
				multipleOpen: true
			});
		},

		_defineSubscriptions: function() {

			if (!this.getChartsContainerChannel) {
				console.error("ChartsContainer channel not defined for legend '%s'", this.getChannel());
			}

			this.subscriptionsConfig.push({
				channel : this.getChannel('ADD_ENTRY'),
				callback: '_subAddEntry'
			},{
				channel : this.getChartsContainerChannel("LAYER_ADDED"),
				callback: "_subLayerAdded"
			},{
				channel : this.getChartsContainerChannel("LAYER_CLEARED"),
				callback: "_subLayerCleared"
			},{
				channel : this.getChartsContainerChannel("LAYER_SHOWN"),
				callback: "_subLayerShown"
			},{
				channel : this.getChartsContainerChannel("LAYER_HIDDEN"),
				callback: "_subLayerHidden"
			},{
				channel : this.getChartsContainerChannel("LAYER_UPDATED"),
				callback: "_subLayerUpdated"
			},{
				channel : this.getChartsContainerChannel("GOT_LAYER_INFO"),
				callback: "_subGotLayerInfo"
			},{
				channel : this.getChartsContainerChannel("LAYER_INFO_UPDATED"),
				callback: "_subLayerInfoUpdated"
			},{
				channel: this.chartsList.getChildChannel("browser", "BUTTON_EVENT"),
				callback: "_subChartsListButtonEvent"
			},{
				channel: this.chartsList.getChildChannel("iconKeypad", "KEYPAD_INPUT"),
				callback: "_subChartsListKeypadInput"
			},{
				channel : this._colorPicker.getChannel("VALUE_CHANGED"),
				callback: "_subColorPickerValueChanged",
				options: {
					predicate: lang.hitch(this, this._chkColorChangeIsPossible)
				}
			},{
				channel : this.listMenu.getChannel("EVENT_ITEM"),
				callback: "_subListMenuEventItem"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'SHOW_LAYER',
				channel: this.getChannel('ENTRY_ENABLED')
			},{
				event: 'HIDE_LAYER',
				channel: this.getChannel('ENTRY_DISABLED')
			},{
				event: 'TEMPLATE_UPDATE_LIST',
				channel: this.chartsList.getChildChannel("browser", "UPDATE_TEMPLATE")
			},{
				event: 'GET_LAYER_INFO',
				channel: this.getChartsContainerChannel("GET_LAYER_INFO")
			},{
				event: 'SHOW_LAYER',
				channel: this.getChartsContainerChannel("SHOW_LAYER")
			},{
				event: 'SET_LAYER_COLOR',
				channel: this.getChartsContainerChannel("SET_LAYER_COLOR")
			},{
				event: 'HIDE_LAYER',
				channel: this.getChartsContainerChannel("HIDE_LAYER")
			},{
				event: 'REMOVE_LAYER',
				channel: this.getChartsContainerChannel("REMOVE_LAYER")
			},{
				event: 'COPY_CHART_COLOR',
				channel : this.getChartsContainerChannel("COPY_CHART_COLOR")
			});
		},

		postCreate: function() {

			this.legendNode = put('div.chartSmartLegend');

			this._publish(this.chartsList.getChannel("SHOW"), {
				node: this.legendNode
			});
		},

		_getNodeToShow: function() {

			return this.legendNode;
		},

		_subAddEntry: function(req) {

			var layerId = req.chart;

			if (this._layerEntries[layerId]) {
				return;
			}

			this._layerEntries[layerId] = req;
			this._stateByLayerId[layerId] = false;

			this._updateLegendContentWithNewInfo(req);
		},

		_subLayerAdded: function(res) {

			var layerId = res.chart;
			this._stateByLayerId[layerId] = true;

			if (this._layerEntries[layerId]) {
				delete this._layerEntries[layerId];
			}

			this._emitEvt("GET_LAYER_INFO", {
				layerId: layerId
			});
		},

		_subGotLayerInfo: function(res) {

			this._onLayerInfoUpdate(res);
		},

		_subLayerInfoUpdated: function(res) {

			this._onLayerInfoUpdate(res);
		},

		_onLayerInfoUpdate: function(res) {

			var layerId = res.chart;

			this._updateLegendContentWithNewInfo(res);
			this._deactivateHiddenLayer(this._pathsByLayerId[layerId]);
		},

		_updateLegendContentWithNewInfo: function(res) {

			var hierarchicalInfo = res.hierarchicalInfo || {},
				filteredHierarchicalInfo = hierarchicalInfo[this._currentIndex] || {},
				entriesCount = res.entriesCount,
				parentPath = this._findLongestPath(filteredHierarchicalInfo),
				layerData = this._getLayerData(res, parentPath),
				ancestorsData, data;

			if (this._currentIndex === "noGrouped") {
				layerData.info = filteredHierarchicalInfo[parentPath];
			} else {
				ancestorsData = this._getAncestorsData(filteredHierarchicalInfo);
			}

			if (entriesCount > 1) {
				data = this._updateWithMultipleAndGetCurrentData(ancestorsData, layerData, entriesCount);
			} else {
				data = this._updateAndGetCurrentData(ancestorsData, layerData);
			}

			this._addDataToBrowser(data);
			this._deactivateHiddenLayers(data);
		},

		_findLongestPath: function(hierarchicalInfo) {

			var retPath = "";
			for (var path in hierarchicalInfo) {
				if (path.length > retPath) {
					retPath = path;
				}
			}

			return retPath;
		},

		_getLayerData: function(res, parentPath) {

			if (this._currentIndex === "noGrouped") {
				parentPath = 'r';
			}

			var layerId = res.chart,
				label = res.label || layerId,
				path = parentPath + this.pathSeparator + layerId,
				color = res.color;

			this._pathsByLayerId[layerId] = this._cleanLayerPath(path);

			return {
				path: path,
				label: label,
				color: color
			};
		},

		_getAncestorsData: function(hierarchicalInfo) {

			var data = [];
			for (var path in hierarchicalInfo) {
				var ancestor = hierarchicalInfo[path],
					label = this._getAncestorLabel(ancestor);

				data.push({
					path: path,
					label: label,
					leaves: 0
				});
			}

			return data;
		},

		_updateWithMultipleAndGetCurrentData: function(ancestorsData, layerData, entriesCount) {

			var data;
			for (var i = 0; i < entriesCount; i++) {
				var layerDataClone = lang.clone(layerData),
					colors = layerDataClone.color,
					color = colors[0] instanceof Array ? colors[0] : colors;

				layerDataClone.label += " (" + i + ")";
				layerDataClone.color = color[i];
				layerDataClone.path += this._pseudonymSeparator + i;

				var layerId = layerDataClone.path.split(this.pathSeparator).pop(),
					actualLayerId = layerData.path.split(this.pathSeparator).pop();

				this._layerIdByPseudonym[layerId] = actualLayerId;

				var subData = this._updateAndGetCurrentData(ancestorsData, layerDataClone);
				if (!data) {
					data = subData;
				} else {
					data.push(subData[subData.length - 1]);
				}
			}

			return data;
		},

		_updateAndGetCurrentData: function(ancestorsData, layerData) {
			//	summary:
			//		Combina la información de ancestros y la propia capa, la guarda en
			//		'this._currentData' y la devuelve en forma de array.

			ancestorsData && this._insertAncestorsDataInCurrentData(ancestorsData);

			var layerPath = layerData.path,
				layerPathSplitted = layerPath.split(this.pathSeparator);

			// TODO revisar, se hace porque la ruta contiene el id de datadefinition, y rompe la jerarquía
			if (layerPathSplitted.length > 5) {
				layerPathSplitted.splice(4, 1);
				layerPath = layerPathSplitted.join(this.pathSeparator);
			}

			this._currentData[layerPath] = layerData;

			return this._currentDataToArray();
		},

		_insertAncestorsDataInCurrentData: function(ancestorsData) {

			for (var i = 0; i < ancestorsData.length; i++) {
				var ancestorData = ancestorsData[i],
					ancestorPath = ancestorData.path,
					ancestorPathSplitted = ancestorPath.split(this.pathSeparator);

				// TODO revisar, se hace porque la ruta contiene el id de datadefinition, y rompe la jerarquía
				if (ancestorPathSplitted.length > 4) {
					ancestorPathSplitted.pop();
					ancestorPath = ancestorPathSplitted.join(this.pathSeparator);
				}

				if (!this._currentData[ancestorPath]) {
					this._currentData[ancestorPath] = ancestorData;
				}

				this._currentData[ancestorPath].leaves++;
			}
		},

		_currentDataToArray: function() {

			var data = [];
			for (var key in this._currentData) {
				data.push(this._currentData[key]);
			}

			return data;
		},

		_addDataToBrowser: function(data) {

			this._emitEvt('INJECT_DATA', {
				data: this._getDataToAddToBrowser(data),
				target: this._localTarget
			});
		},

		_deactivateHiddenLayers: function(data) {

			for (var i = 0; i < data.length; i++) {
				var layerData = data[i],
					layerPath = layerData.path;

				this._deactivateHiddenLayer(layerPath);
			}
		},

		_deactivateHiddenLayer: function(layerPath) {

			var layerId = layerPath ? layerPath.split(this.pathSeparator).pop() : null;

			if (this._hiddenLayers[layerId]) {
				this._deactivateToggleShowLayerButton(layerPath);
			} else {
				if (this._stateByLayerId[layerId]) {
					this._activateToggleShowLayerButton(layerPath);
				}
			}
		},

		_subLayerCleared: function(res) {

			var layerId = res.chart,
				layerPath = this._pathsByLayerId[layerId];

			layerPath && this._removeLayerAndUpdateAncestors(layerPath);
		},

		_removeLayerAndUpdateAncestors: function(layerPath) {

			var pathSplitted = layerPath.split(this.pathSeparator);

			while (pathSplitted.length > 1) {
				var path = pathSplitted.join(this.pathSeparator);

				if (this._currentData[path]) {
					if (this._currentData[path].leaves) {
						this._currentData[path].leaves--;
					}
					if (!this._currentData[path].leaves) {
						this._publish(this.chartsList.getChildChannel("browser", "REMOVE"), {
							ids: [path]
						});
						delete this._currentData[path];
					}
				}
				pathSplitted.pop();
			}

			this._emitEvt("INJECT_DATA", {
				data: this._currentDataToArray(),
				target: this._localTarget
			});
		},

		_subLayerShown: function(res) {

			var layerId = res.chart,
				layerPath = this._pathsByLayerId[layerId],
				index = res.index;

			delete this._hiddenLayers[layerId];

			if (Utilities.isValidNumber(index)) {
				layerPath += this._pseudonymSeparator + index;
			}

			this._activateToggleShowLayerButton(layerPath);
		},

		_activateToggleShowLayerButton: function(layerPath) {

			this._publish(this.chartsList.getChildChannel("browser", "CHANGE_ROW_BUTTON_TO_MAIN_CLASS"), {
				idProperty: layerPath,
				btnId: "toggleShowLayer"
			});
		},

		_subLayerHidden: function(res) {

			var layerId = res.chart,
				layerPath = this._pathsByLayerId[layerId],
				index = res.index;

			this._hiddenLayers[layerId] = true;

			if (Utilities.isValidNumber(index)) {
				layerPath += this._pseudonymSeparator + index;
			}

			this._deactivateToggleShowLayerButton(layerPath);
		},

		_deactivateToggleShowLayerButton: function(layerPath) {

			this._publish(this.chartsList.getChildChannel("browser", "CHANGE_ROW_BUTTON_TO_ALT_CLASS"), {
				idProperty: layerPath,
				btnId: "toggleShowLayer"
			});
		},

		_subLayerUpdated: function(res) {

			var layerId = res.chart,
				layerPath = this._pathsByLayerId[layerId],
				label = res.label;

			if (!layerPath) {
				return;
			}

			lang.mixin(this._currentData[layerPath], {
				path: layerPath,
				label: label
			});

			this._emitEvt("INJECT_ITEM", {
				data: this._currentData[layerPath],
				target: this._localTarget
			});

			if (this._stateByLayerId[layerId]) {
				this._activateToggleShowLayerButton(layerPath);
			}
		},

		_subChartsListButtonEvent: function(res) {

			var btnId = res.btnId;

			if (btnId === "toggleShowLayer") {
				this._onToggleShowLayer(res);
			} else if (btnId === "colorPicker") {
				this._onChangeColor(res);
			} else if (btnId === "removeLayer") {
				this._onRemoveLayer(res);
			}
		},

		_startupColorPickerIcon: function(nodeIcon, item) {

			if (item.color) {
				nodeIcon.setAttribute("style", "color:" + item.color);
			}
		},

		_onChangeColor: function(res) {

			this._changeColorItem = res;

			this._publish(this._colorPicker.getChannel("SET_VALUE"), {
				colorPicker: this._getColorFromItem(this._changeColorItem)
			});

			this._publish(this._colorPicker.getChannel("SHOW"), {
				node: res.iconNode
			});
		},

		_getColorFromItem: function(obj) {

			var item = obj.item,
				itemColor = item.color;

			return itemColor instanceof Array ? itemColor[0] : itemColor;
		},

		_chkColorChangeIsPossible: function(res) {

			return this._changeColorItem && res && res.value;
		},

		_subColorPickerValueChanged: function(res) {

			var iconNode = query(".fa-tint", this._changeColorItem.node)[0],
				oldColor = this._getColorFromItem(this._changeColorItem),
				color = res.value;

			iconNode.setAttribute("style", "color:" + color);
			this._changeColorItem.item.color = color;

			this._emitEvt("INJECT_ITEM", {
				data: this._changeColorItem.item,
				target: this._localTarget
			});

			var layerPath = this._changeColorItem[this.idProperty],
				layerId = layerPath.split(this.pathSeparator).pop();

			this._setLayerColor(layerId, oldColor, color);

			if (this._stateByLayerId[layerId]) {
				this._activateToggleShowLayerButton(layerPath);
			}
		},

		_setLayerColor: function(layerId, oldColor, color) {

			this._emitEvt("SET_LAYER_COLOR", this._getPubToLayerObj({
				layerId: layerId,
				oldColor: oldColor,
				color: color
			}));
		},

		_onToggleShowLayer: function(obj) {

			var pathFromList = obj[this.idProperty],
				layerId = pathFromList.split(this.pathSeparator).pop(),
				propsToPub = {
					layerId: layerId
				};

			if (this._layerIdByPseudonym[layerId]) {
				var index = layerId.split(this._pseudonymSeparator).pop();
				propsToPub.index = parseInt(index, 10);
			}

			var objToPub = this._getPubToLayerObj(propsToPub);

			var prevState = this._stateByLayerId[layerId];
			this._stateByLayerId[layerId] = !prevState;

			if (prevState) {
				this._deactivateLayer(objToPub);
			} else {
				this._activateLayer(objToPub);
			}
		},

		_deactivateLayer: function(pubObj) {

			this._emitEvt('HIDE_LAYER', pubObj);
		},

		_activateLayer: function(pubObj) {

			this._emitEvt('SHOW_LAYER', pubObj);
		},

		_onRemoveLayer: function(obj) {

			var pathFromList = obj[this.idProperty],
				layerId = pathFromList.split(this.pathSeparator).pop();

			this._removeLayer(layerId);
		},

		_removeLayer: function(layerId) {

			this._emitEvt('REMOVE_LAYER', this._getPubToLayerObj({
				layerId: layerId
			}));
		},

		_subChartsListKeypadInput: function(res) {

			if (res.inputKey === "iconListMenu") {
				this._clickIconListMenu(res.node);
			}
		},

		_subListMenuEventItem: function(res) {

			var value = res.value;
			if (this._currentIndex === value) {
				return;
			}

			this._currentIndex = value;

			var template = value === "noGrouped" ? this._getNonHierarchicalTemplate() : this._getHierarchicalTemplate();

			this._applyGroup(template);
		},

		_clickIconListMenu: function(node) {

			this._publish(this.listMenu.getChannel("SHOW"), {
				node: node
			});
		},

		_applyGroup: function(template) {

			this._emitEvt("TEMPLATE_UPDATE_LIST", {
				template: template
			});

			var loadedLayerIds = this._getLoadedLayerIds();

			this._currentData = {};
			this._publish(this.chartsList.getChildChannel("browser", "CLEAR"));

			this._emitEvt("GET_LAYER_INFO");
			for (var layerEntryId in this._layerEntries) {
				var layerEntryInfo = this._layerEntries[layerEntryId];
				this._onLayerInfoUpdate(layerEntryInfo);
			}

			this._enablePreviouslySelectedItems(loadedLayerIds);
		},

		_getLoadedLayerIds: function() {

			var loadedLayerPaths = Object.keys(this._currentData).map(lang.hitch(this, function(layerPath) {

				return layerPath.split(this.pathSeparator).pop();
			}));

			return loadedLayerPaths.filter(lang.hitch(this, function(layerId) {

				return layerId && isNaN(parseInt(layerId, 10));
			}));
		},

		_enablePreviouslySelectedItems: function(layerIds) {

			for (var i = 0; i < layerIds.length; i++) {
				var layerId = layerIds[i];

				if (this._stateByLayerId[layerId]) {
					var layerPath = this._pathsByLayerId[layerId];
					this._activateToggleShowLayerButton(layerPath);
				}
			}
		}
	});
});
