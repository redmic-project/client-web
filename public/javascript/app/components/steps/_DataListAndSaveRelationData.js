define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_ShowInPopup"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/browser/_Table"
	, "RWidgets/Button"
], function (
	declare
	, lang
	, _ShowInPopup
	, ListImpl
	, _Table
	, Button
){
	return declare(null, {
		//	summary:
		//		Extensión para la relación de datos de parametros.

		constructor: function (args) {
			this.config = {
				tableConfig: {
					columns: []
				},

				/*_relationDataDefault: {
					"date": {
						"columns": ["date"],
						"format": "YYYY-MM-DD HH:mm:ss"
					},
					"vFlag": {
						"columns": ["vFlag"]
					},
					"qFlag": {
						"columns": ["qFlag"]
					},
					"remark": {
						"columns": ["remark"]
					},
					"parameters": {
						"matching": [{
							"columns": ["value"],
							"dataDefinitionId": 63
						}]
					}
				},*/

				_defaultColumns: {
					width: '14',
					align: 'center',
					noDisabled: true,
					notContent: "-"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			/*this.browserConfig = this._merge([{
				buttonsInTopZone: true,
				buttons: {
					"loadRelationData": {
						className: "fa-plus",
						title: this.i18n.loadRelationData
					}
				}
			}, this.browserConfig || {}]);*/

			this.previewDataBrowserConfig = this._merge([{
				parentChannel: this.getChannel(),
				title: this.i18n.previewData,
				target: "viewPrevData",
				noDataMessage: null,
				tableConfig: {},
				pathSeparator: "//",
				width: 8,
				height: "lg"
			}, this.previewDataBrowserConfig || {}]);
		},

		/*_defineSubscriptions: function() {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel: this.browser.getChildChannel("iconKeypad", "KEYPAD_INPUT"),
				callback: "_subBrowserKeypadInput"
			});
		},*/

		postCreate: function() {

			this.inherited(arguments);

			this.previewDataButton = new Button({
				iconClass: "fa fa-table",
				'class': "primary",
				title: this.i18n.previewData,
				onClick: lang.hitch(this, this._showPreviewData)
			}).placeAt(this.topLeftNode);
		},

		/*_subBrowserKeypadInput: function(res) {

			if (res.inputKey === "loadRelationData") {
				this._loadRelationData(this._relationDataDefault);
			}
		},*/

		/*_loadRelationData: function(relationData) {

			this._cleanData();

			this._blockLoadFormTypesInSelector = true;

			for (var key in relationData)
				this._loadItemRelationData(relationData[key], key);

			this._blockLoadFormTypesInSelector = false;
			this._currentValueSelect = null;
			this._loadFormTypesInSelector(true);
		},

		_loadItemRelationData: function(item, key) {

			if (this.formTypeOptions[key]) {
				this._currentValueSelect = key;
				this._formSubmitted({
					data: item
				});
			}
		},*/

		_processLoadedData: function(data) {

			this.tableConfig.columns = [];

			this.inherited(arguments);
		},

		_processItemData: function(head) {

			this.inherited(arguments);

			var column = lang.clone(this._defaultColumns);
			column.property = head;

			this.tableConfig.columns.push(column);
		},

		_showPreviewData: function() {

			if (!this.previewDataBrowser) {
				this.previewDataBrowser = new declare([ListImpl, _Table]).extend(_ShowInPopup)(this.previewDataBrowserConfig);
			}

			if (this._loadDataInPreviewList) {

				this._loadDataInPreviewList = false;

				this._publish(this.previewDataBrowser.getChannel("CLEAR"));

				this._publish(this.previewDataBrowser.getChannel("SET_PROPS"), {
					tableConfig: this.tableConfig
				});

				this._emitEvt("INJECT_DATA", {
					data: this.data.data,
					target: "viewPrevData"
				});
			}

			this._publish(this.previewDataBrowser.getChannel("SHOW"));
		}
	});
});
