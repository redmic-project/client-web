define([
	"app/base/views/extensions/_AddSelectionHandlerKeypad"
	, "app/base/views/extensions/_LocalSelectionView"
	, "app/designs/list/Controller"
	, "app/designs/list/layout/Layout"
	, "app/redmicConfig"
	, "app/designs/contentAndList/main/ListFilteredBySelect"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "redmic/modules/base/_ShowInPopup"
	, "redmic/modules/base/_Store"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/HierarchicalImpl"
	, "RWidgets/Button"
	, 'templates/ThematicTypeList'
], function(
	_AddSelectionHandlerKeypad
	, _LocalSelectionView
	, Controller
	, Layout
	, redmicConfig
	, ListFilteredBySelect
	, declare
	, lang
	, Deferred
	, _ShowInPopup
	, _Store
	, _ButtonsInRow
	, _Framework
	, HierarchicalImpl
	, Button
	, templateList
){
	return declare([Layout, Controller, _Store], {
		//	summary:
		//		Step para las clasificaciones de las areas.

		constructor: function(args) {

			this.config = {
				idProperty: "path",
				title: this.i18n.areaClassifications,
				label: this.i18n.classifications,
				_localTarget: "areaClassifications",
				_isCompleted: true,
				ownChannel: "areaClassifications"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				target: this._localTarget,
				template: templateList,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-trash-o",
							btnId: "remove",
							title: "remove"
						}]
					}
				}
			}, this.browserConfig || {}]);

			this.addConfig = this._merge([{
				target: redmicConfig.services.thematicType,
				browserConfig: {
					browserBase: [HierarchicalImpl, _Framework, _ButtonsInRow],
					browserConfig: {
						template: templateList,
						pathLengthMinChildren: 3,
						pathLengthMinParent: 2,
						simpleSelection: true
					}
				},
				filterConfig: {
					initQuery: {
						terms: {
							level: 1,
							children: false
						}
					}
				},
				changedInputValue: this.changedInputValue,
				keypadConfig: {
					items: {
						confirm: {
							props: {
								label: this.i18n.add
							}
						}
					}
				}
			}, this.addConfig || {}]);
		},

		postCreate: function() {

			this.inherited(arguments);

			this.addNewButton = new Button({
				iconClass: "fa fa-plus",
				'class': "success",
				title: this.i18n.add,
				onClick: lang.hitch(this, this._addNewClassificationsCallback)
			}).placeAt(this.keypadZoneNode);
		},

		_addNewClassificationsCallback: function() {

			this._createContentDialog();

			this._publish(this.popupView.getChannel("SHOW"));
		},

		_createContentDialog: function() {

			if (this.popupView) {
				return;
			}

			var config = this._merge([{
				parentChannel: this.getChannel(),
				title: this.i18n.newClassification,
				width: 6,
				height: "lg"
			}, this.addConfig || {}]);

			this.popupView = new declare([ListFilteredBySelect, _LocalSelectionView,
				_AddSelectionHandlerKeypad]).extend(_ShowInPopup)(config);

			this._popupViewSubscription = this._setSubscription({
				channel: this.popupView.getChannel("SELECTED_CONFIRM"),
				callback: "_subSelectedConfirm"
			});
		},

		_subSelectedConfirm: function(res) {

			this._once(this.popupView.getChildChannel('browser.browser', 'GOT_ITEM'), lang.hitch(this, this._subGotItem));

			this._publish(this.popupView.getChildChannel('browser.browser', 'GET_ITEM'), {
				idProperty: res[this.idProperty]
			});
		},

		_subGotItem: function(res) {

			this._newItem(res.item);
		},

		_newItem: function(item) {

			this._emitEvt("INJECT_ITEM", {
				data: item,
				target: this._localTarget
			});

			this._once(this.browser.getChannel('GOT_DATA'), lang.hitch(this, this._subGotData));

			this._publish(this.browser.getChannel('GET_DATA'));
		},

		_removeCallback: function(obj) {

			var objRemove = {};

			objRemove.idProperty = obj[this.idProperty];

			this._publish(this.browser.getChannel('REMOVE_ITEM'), objRemove);

			this._once(this.browser.getChannel('GOT_DATA'), lang.hitch(this, this._subGotData));

			this._publish(this.browser.getChannel('GET_DATA'));
		},

		_subGotData: function(res) {

			var data = res.data;

			this._results = data;

			this._emitEvt('REFRESH_STATUS');
		},

		_instanceDataToResult: function(data) {

			var areaClassifications = data.properties.areaClassifications;

			this._addDataToBrowser(areaClassifications);

			this._results = areaClassifications;

			this._emitEvt('REFRESH_STATUS');
		},

		_addDataToBrowser: function(data) {

			this._emitEvt("INJECT_DATA", {
				data: data,
				target: this._localTarget
			});
		},

		changedInputValue: function(value) {

			this._publish(this.browser.getChildChannel('filter', 'ADD_TO_QUERY'), {
				query: {
					terms: {
						parentPath: value
					}
				},
				refresh: true
			});
		}
	});
});