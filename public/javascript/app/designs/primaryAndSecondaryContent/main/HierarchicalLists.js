define([
	"app/designs/base/_Main"
	, "app/designs/primaryAndSecondaryContent/Controller"
	, "app/designs/primaryAndSecondaryContent/layout/Layout"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "RWidgets/Utilities"
	, "redmic/modules/base/_Store"
	, "redmic/modules/browser/bars/Total"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/_MultiTemplate"
	, "redmic/modules/browser/ListImpl"
	, "templates/DefaultList"
], function (
	_Main
	, Controller
	, Layout
	, declare
	, lang
	, put
	, Utilities
	, _Store
	, Total
	, _ButtonsInRow
	, _Framework
	, _MultiTemplate
	, ListImpl
	, DefaultListTemplate
){
	return declare([Layout, Controller, _Main, _Store], {
		//	summary:
		//		Main de contenido primario y secundario de tipo listado, donde un item del primero despliega sus
		//		descendientes en el segundo.

		constructor: function(args) {

			this.config = {
				idProperty: "id",
				typeGroupProperty: "category",
				primaryTarget: "primaryTarget",
				secondaryTarget: "secondaryTarget",
				primaryListTemplate: null,
				secondaryListTemplate: null,
				_defaultTemplate: DefaultListTemplate,
				_defaultPrimaryListButtons: [{
					icon: "fa-chevron-right",
					btnId: "changeToSecondary",
					title: 'info',
					returnItem: true
				}],

				_defaultSecondaryListButtons: [],

				mainActions: {
					NEW_DATA: "newData",
					CLEAR: "clear",
					ADD_NEW_TEMPLATES: "addNewTemplates"
				},

				_secondaryTemplatesByTypeGroup: {}
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			var browserConfig = {
				parentChannel: this.getChannel(),
				idProperty: this.idProperty,
				typeGroupProperty: this.typeGroupProperty,
				bars: [{
					instance: Total
				}]
			};

			var primaryListButtons = Utilities.uniq(this._merge([
				this._defaultPrimaryListButtons,
				this.primaryListButtons || []
			], {arrayMergingStrategy: "concatenate"}));

			primaryListButtons.reverse();

			var secondaryListButtons = Utilities.uniq(this._merge([
				this._defaultSecondaryListButtons,
				this.secondaryListButtons || []
			], {arrayMergingStrategy: "concatenate"}));

			secondaryListButtons.reverse();

			var primaryBrowserConfig = this._merge([{
				target: this.primaryTarget,
				template: this.primaryListTemplate || this._defaultTemplate,
				rowConfig: {
					buttonsConfig: {
						listButton: primaryListButtons
					}
				}
			}, browserConfig]);

			this.primaryBrowserConfig = this._merge([primaryBrowserConfig, this.primaryBrowserConfig || {}]);

			var secondaryBrowserConfig = this._merge([{
				target: this.secondaryTarget,
				template: this.secondaryListTemplate || this._defaultTemplate,
				rowConfig: {
					buttonsConfig: {
						listButton: secondaryListButtons
					}
				}
			}, browserConfig || {}]);

			this.secondaryBrowserConfig = this._merge([secondaryBrowserConfig, this.secondaryBrowserConfig || {}]);
		},

		_initializeMain: function() {

			var exts = [ListImpl, _Framework, _ButtonsInRow, _MultiTemplate];

			this._primaryContentInstance = new declare(exts)(this.primaryBrowserConfig);
			this.primaryContentChannel = this._primaryContentInstance.getChannel();

			this._secondaryContentInstance = new declare(exts)(this.secondaryBrowserConfig);
			this.secondaryContentChannel = this._secondaryContentInstance.getChannel();
		},

		_defineMainSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this._primaryContentInstance.getChannel("BUTTON_EVENT"),
				callback: "_subListBtnEvent"
			},{
				channel : this._secondaryContentInstance.getChannel("BUTTON_EVENT"),
				callback: "_subListBtnEvent"
			},{
				channel : this.getChannel("NEW_DATA"),
				callback: "_subNewData",
				options: {
					predicate: function(req) { return !!req; }
				}
			},{
				channel : this.getChannel("CLEAR"),
				callback: "_subClear"
			},{
				channel : this.getChannel("ADD_NEW_TEMPLATES"),
				callback: "_subAddNewTemplates"
			});
		},

		_subListBtnEvent: function(evt) {

			var callback = "_" + evt.btnId + "Callback";
			this[callback] && this[callback](evt);
		},

		_subNewData: function(req) {

			this._emitInjectItem(req);
		},

		_beforeShow: function() {

			this._once(this._primaryContentInstance.getChannel('GOT_DATA'), lang.hitch(this,
				this._subOnceGetData));

			this._publish(this._primaryContentInstance.getChannel("GET_DATA"));
		},

		_subOnceGetData: function(data) {

			data = data.data;

			this._updateTitle();

			if (data.length === 1) {
				var item = data[0];

				this._changeToSecondaryCallback({
					btnId: "changeToSecondary",
					id: item[this.idProperty],
					item: item
				}, {
					showAnimation: null
				});
			} else {
				put(this._backButtonNode, "." + this.hiddenClass);
				put(this._primaryContentNode, "!" + this.hiddenClass);
				put(this._secondaryContentNode, "." + this.hiddenClass);

				this._showContent(this.primaryContentChannel, {
					node: this._primaryContentNode,
					hideAnimation: this.primaryOutClass
				});
			}
		},

		_emitInjectItem: function(data) {

			data[this.idProperty] = data.parent[this.idProperty];

			this._emitEvt('INJECT_ITEM', {
				data: data,
				target: this.primaryTarget
			});
		},

		_subClear: function() {

			this._publish(this._primaryContentInstance.getChannel("CLEAR"));
			this._publish(this._secondaryContentInstance.getChannel("CLEAR"));
		},

		_subAddNewTemplates: function(req) {

			var typeGroup = req.typeGroup,
				parentTemplate = req.parentTemplate,
				childrenTemplate = req.childrenTemplate;

			this._publish(this._primaryContentInstance.getChannel("ADD_TEMPLATE"), {
				typeGroup: typeGroup,
				template: parentTemplate
			});

			if (typeof childrenTemplate === "object") {
				for (var key in childrenTemplate) {
					this._publish(this._secondaryContentInstance.getChannel("ADD_TEMPLATE"), {
						typeGroup: key,
						template: childrenTemplate[key]
					});
				}
			}

			this._secondaryTemplatesByTypeGroup[typeGroup] = childrenTemplate;
		},

		_changeToSecondaryCallback: function(itemData, options) {

			var typeGroup = itemData.item[this.typeGroupProperty];

			if (!typeGroup || typeof this._secondaryTemplatesByTypeGroup[typeGroup] === "object") {
				this._emitInjectData(itemData.item.children);
			} else {
				var template = this._secondaryTemplatesByTypeGroup[typeGroup] || this.secondaryListTemplate ||
					this._defaultTemplate;

				this._once(this._secondaryContentInstance.getChannel("TEMPLATE_UPDATED"), lang.hitch(this,
					this._emitInjectData, itemData.item.children));

				this._publish(this._secondaryContentInstance.getChannel("UPDATE_TEMPLATE"), {
					template: template
				});
			}

			var parentName = itemData.item.parentName,
				parentData = itemData.item.parent,
				title;

			if (typeof parentName === "function") {
				title = parentName(parentData) || this.title;
			} else {
				title = Utilities.getDeepProp(parentData, parentName) || this.title;
			}

			options = options || { title: title };

			this._changeToSecondary(this.secondaryContentChannel, options);
		},

		_emitInjectData: function(data) {

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this.secondaryTarget
			});
		}
	});
});
