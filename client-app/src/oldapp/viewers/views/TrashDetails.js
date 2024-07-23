define([
	"app/designs/dynamicDualContent/Controller"
	, "app/designs/dynamicDualContent/layout/TopSecondaryContent"
	, "app/designs/embeddedContentWithTopbar/main/EmbeddedContentSelectionInTopbar"
	, "app/viewers/views/TrashCharts"
	, "app/viewers/views/TrashInfo"
	, "app/viewers/views/_SelectTimeInterval"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, 'moment/moment.min'
	, "redmic/modules/base/_Filter"
	, "redmic/modules/base/_Store"
	, "redmic/modules/browser/HierarchicalImpl"
	, "redmic/modules/browser/_DataTypeParser"
	, "redmic/modules/browser/_HierarchicalTable"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "templates/LoadingEmpty"
], function(
	DynamicContentController
	, DynamicContentLayout
	, EmbeddedContentSelectionInTopbar
	, TrashCharts
	, TrashInfo
	, _SelectTimeInterval
	, redmicConfig
	, declare
	, lang
	, Deferred
	, moment
	, _Filter
	, _Store
	, HierarchicalImpl
	, _DataTypeParser
	, _HierarchicalTable
	, TemplateDisplayer
	, NoDataTemplate
) {

	return declare([EmbeddedContentSelectionInTopbar, _SelectTimeInterval, _Filter, _Store], {
		//	summary:
		//		Permite agrupar la información sobre recogidas de basura.
		//	description:
		//		Mostrará información de la actividad, gráficas sobre los datos y los propios datos.

		constructor: function(args) {

			this.config = {
				title: " ",
				ownChannel: "trashDetailsView",

				browserTarget: "browser",

				actions: {
					SHOW_NO_DATA: "showNoData"
				},

				objectCollectingSeriesTarget: redmicConfig.services.objectCollectingSeriesClassificationList,
				activityTarget: redmicConfig.services.activity,

				intervalValue: '1q',
				//_dataList: [],
				_pathSeparator: '.',
				_idData: null,
				embeddedButtons: {
					"showInfo": {
						className: "fa-database",
						title: this.i18n.data
					},
					"showChart": {
						className: "fa-line-chart",
						title: this.i18n.charts
					},
					"showList": {
						className: "fa-list",
						title: this.i18n.list
					}
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.filterConfig = this._merge([{
				target: this.objectCollectingSeriesTarget
			}, this.filterConfig || {}]);

			this.target = [this.objectCollectingSeriesTarget, this.activityTarget];

			this.infoViewerConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.infoViewerConfig || {}]);

			this.dynamicContainerConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.dynamicContainerConfig || {}]);

			this.chartsViewerConfig = this._merge([{
				filterConfig: {}
			}, this.chartsViewerConfig || {}]);

			this.browserConfig = this._merge([{
				idProperty: "path",
				target: this.browserTarget,
				noDataMessage: NoDataTemplate({
					i18n: this.i18n
				}),
				tableConfig: {
					columns: [{
						property: "category",
						noDisabled: true
					},{
						type: "arrayColumns",
						property: "v",
						propertyInArrayItem: "v",
						propertyHeader: 'dates',
						style: "width: 8rem; justify-content: flex-end;",
						notContent: "-"
					}],
					header: {
						format: function(value) {

							var ret = moment(value);

							if (ret.isValid()) {
								return ret.format("YYYY-MM-DD");
							}

							return value;
						}
					}
				}
			}, this.browserConfig || {}]);
		},

		_initialize: function() {

			this.dynamicContainer = new declare([
				DynamicContentLayout,
				DynamicContentController
			])(this.dynamicContainerConfig);

			this.browserConfig.parentChannel = this.dynamicContainer.getChannel();
			this.browser = new declare([HierarchicalImpl, _HierarchicalTable, _DataTypeParser])(this.browserConfig);

			this.modelChannelFilter = this.filter.modelChannel;
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getChannel("SHOW_NO_DATA"),
				callback: "_subShowNoData"
			},{
				channel: this.filter.getChannel("CHANGED_MODEL"),
				callback: "_subChangedModelFilter"
			},{
				channel: this.filter.getChannel("SERIALIZED"),
				callback: "_subRequestFilter"
			});
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('SHOW', lang.hitch(this, this._loadInitialEmbeddedContent));
			this._onEvt('CHANGE_EMBEDDED_CONTENT', lang.hitch(this, this._changeEmbeddedContent));
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.dynamicContainer.getChannel("SET_PROPS"), {
				secondaryContent: this.timeIntervalSelectContainer
			});
		},

		_subChangedModelFilter: function(res) {

			this.modelChannelFilter = res.modelChannel;
		},

		_subRequestFilter: function(obj) {

			var buttonKeys = Object.keys(this.embeddedButtons),
				embeddedInfoKey = buttonKeys[1];

			if (this._lastButtonKeyEmbedded === embeddedInfoKey) {
				this._objQuery = obj.data;
				this._showChartsViewer(embeddedInfoKey);
			}
		},

		_loadInitialEmbeddedContent: function(evt) {

			var props = this.currentData.feature.properties;

			if (this._lastSiteId && this._lastSiteId === props.site.id)
				return;
			else {
				this._lastSiteId = props.site.id;
			}

			this._emitEvt('ADD_TO_QUERY', {
				query: {
					"terms": {
						"parentId": this.currentData.parentId,
						"grandparentId": this.currentData.grandparentId
					},
					size: null,
					from: null
				},
				omitRefresh: true
			});

			this._infoData = {
				siteInfo: props.site,
				measurementData: this._getMeasurementData(props.measurements)
			};

			this._addOptionsSelectTimeInterval(props.measurements);

			this._newDataAvailable = {};

			var buttonKeys = Object.keys(this.embeddedButtons),
				embeddedInfoKey = buttonKeys[0];

			for (var i = 0; i < buttonKeys.length; i++) {
				var buttonKey = buttonKeys[i];
				this._newDataAvailable[buttonKey] = true;
			}

			if (this._lastActivityId && this._lastActivityId === props.activityId) {
				this._infoData.activityInfo = this._lastActivityInfo;
				this._showInfoViewer(embeddedInfoKey);
			} else {
				var activityInfoDfd = this._getActivityInfo(props.activityId);
				activityInfoDfd.then(lang.hitch(this, this._gotActivityInfo, embeddedInfoKey));

				this._lastActivityId = props.activityId;
			}
		},

		_beforeHide: function(req) {

			var buttonKeys = Object.keys(this.embeddedButtons),
				embeddedInfoKey = buttonKeys[0];

			this._showInfoViewer(embeddedInfoKey);
		},

		_getMeasurementData: function(measurements) {

			var measurementData = [];
			for (var i = 0; i < measurements.length; i++) {
				var measurement = measurements[i],
					parameterObj = lang.clone(measurement.parameter),
					unitObj =  lang.clone(measurement.unit),
					measurementObj = lang.clone(measurement.dataDefinition);

				parameterObj.path = "r." + parameterObj.id;

				measurementObj.path = parameterObj.path + "." + measurementObj.id;
				measurementObj.unit = unitObj;

				measurementData.push(parameterObj, measurementObj);
			}

			return measurementData;
		},

		_getActivityInfo: function(activityId) {

			var dfd = new Deferred();

			this._activityInfoDfd = dfd;

			this._emitEvt('GET', {
				target: this.activityTarget,
				id: activityId
			});

			return dfd;
		},

		_gotActivityInfo: function(embeddedKey, activityInfo) {

			this._setTitle(activityInfo.name);

			this._infoData.activityInfo = activityInfo;

			this._lastActivityInfo = activityInfo;

			delete this._activityInfoDfd;

			this._showInfoViewer(embeddedKey);
		},

		_changeEmbeddedContent: function(evt) {

			var inputKey = evt.inputKey,
				buttonKeys = Object.keys(this.embeddedButtons),
				embeddedContentIndex = buttonKeys.indexOf(inputKey);

			if (embeddedContentIndex === 0) {
				this._showInfoViewer(inputKey);
			} else if (embeddedContentIndex === 1) {
				this._showChartsViewer(inputKey);
			} else if (embeddedContentIndex === 2) {
				this._showBrowser(inputKey);
			}
		},

		_showInfoViewer: function(inputKey) {

			if (!this.infoViewer) {
				this.infoViewer = new TrashInfo(this.infoViewerConfig);
			}

			var objToPublicateToEmbed = {};

			if (this._newDataAvailable[inputKey]) {
				delete this._newDataAvailable[inputKey];
				objToPublicateToEmbed.data = this._infoData;
			}

			this._embedModule(this.infoViewer, inputKey, objToPublicateToEmbed);
		},

		_showChartsViewer: function(inputKey) {

			if (!this.chartsViewer) {
				this.chartsViewerConfig.parentChannel = this.dynamicContainer.getChannel();
				this.chartsViewerConfig.noDataChannel = this.getChannel();
				this.chartsViewerConfig.filterConfig.modelChannel = this.modelChannelFilter;
				this.chartsViewer = new TrashCharts(this.chartsViewerConfig);
			}

			var chartsViewerData = {
				"parentId": this.currentData.parentId,
				"grandparentId": this.currentData.grandparentId,
				"data": this.currentData.feature.properties,
				"interval": this.intervalValue,
				"intervalLabelKey": this._intervalLabelKey
			};

			this._noDataMessageEnabled = false;

			this._publish(this.chartsViewer.getChannel("SET_PROPS"), {
				data: chartsViewerData,
				objQuery: this._objQuery
			});

			this._publish(this.dynamicContainer.getChannel("SET_PROPS"), {
				primaryContent: this.chartsViewer
			});

			this._embedModule(this.dynamicContainer, inputKey);
		},

		_subShowNoData: function() {

			this._showNoDataMessage();
		},

		_showNoDataMessage: function() {

			this._noDataMessageEnabled = true;
			this._showTemplateDisplayerNoDataViewer();
		},

		_showTemplateDisplayerNoDataViewer: function() {

			if (!this.templateDisplayerNoData) {
				this.templateDisplayerNoData = new TemplateDisplayer({
					parentChannel: this.getChannel(),
					"class": "fHeight.flex"
				});
			}

			this._embedModule(this.templateDisplayerNoData, "noData");
		},

		_showBrowser: function(inputKey) {

			if (this._noDataMessageEnabled) {
				this._lastButtonKeyEmbedded = inputKey;
				this._showTemplateDisplayerNoDataViewer();
				return;
			}

			this._publish(this.dynamicContainer.getChannel("SET_PROPS"), {
				primaryContent: this.browser
			});

			this._embedModule(this.dynamicContainer, inputKey);
		},

		_embedModule: function(module, /*String*/ buttonKey) {

			if (buttonKey !== "noData")
				this._lastButtonKeyEmbedded = buttonKey;

			this.inherited(arguments);
		},

		_itemAvailable: function(res) {

			this._activityInfoDfd.resolve(res.data);
		},

		_dataAvailable: function(res) {

			var data = lang.clone(res.data),
				buttonKeys = Object.keys(this.embeddedButtons),
				embeddedInfoKey = buttonKeys[2];

			if (!data || !data.length)
				this._noDataMessageEnabled = true;
			else
				this._noDataMessageEnabled = false;

			if (this._lastButtonKeyEmbedded === embeddedInfoKey) {
				this._showBrowser(embeddedInfoKey);
			}

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this.browserTarget
			});
		},

		_onIntervalChanged: function(value) {

			this._emitEvt('ADD_TO_QUERY', {
				query: {
					"interval": this.intervalValue
				}
			});

			this.chartsViewer && this._changeTimeIntervalForChart(value);
		},

		_changeTimeIntervalForChart: function(value) {

			this._publish(this.chartsViewer.getChannel("REFRESH"), {
				intervalValue: this.intervalValue,
				intervalLabelKey: this._intervalLabelKey
			});
		},

		_getNodeSelectTimeInterval: function() {

			return this._getSecondaryTopbarContent();
		},

		_getIconKeypadNode: function() {

			return this._optionNode;
		}
	});
});
