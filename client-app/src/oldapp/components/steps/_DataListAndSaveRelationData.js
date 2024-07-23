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
				previewDataIdProperty: 'idPreviewList',
				tableConfig: {
					columns: []
				},

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

			this.previewDataBrowserConfig = this._merge([{
				parentChannel: this.getChannel(),
				title: this.i18n.previewData,
				target: "viewPrevData",
				noDataMessage: null,
				tableConfig: {},
				idProperty: this.previewDataIdProperty,
				width: 8,
				height: "lg"
			}, this.previewDataBrowserConfig || {}]);
		},

		postCreate: function() {

			this.inherited(arguments);

			this.previewDataButton = new Button({
				iconClass: "fa fa-table",
				'class': "primary",
				title: this.i18n.previewData,
				onClick: lang.hitch(this, this._showPreviewData)
			}).placeAt(this.topLeftNode);
		},

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
					data: this._buildPreviewData(this.data.data),
					target: "viewPrevData"
				});
			}

			this._publish(this.previewDataBrowser.getChannel("SHOW"));
		},

		_buildPreviewData: function(data) {

			var items = [];

			for (var i = 0; i < data.length; i++) {
				var item = data[i],
					itemKeys = Object.keys(item),
					itemValues = Object.values(item),
					itemObj = {};

				itemObj[this.previewDataIdProperty] = i;

				for (var j = 0; j < itemKeys.length; j++) {
					var itemKey = itemKeys[j],
						itemValue = itemValues[j];

					itemObj[itemKey] = itemValue;
				}

				items.push(itemObj);
			}

			return items;
		}
	});
});
