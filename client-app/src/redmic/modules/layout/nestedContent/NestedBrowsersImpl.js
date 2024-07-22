define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/browser/bars/Total'
	, 'redmic/modules/browser/_ButtonsInRow'
	, 'redmic/modules/browser/_Framework'
	, 'redmic/modules/browser/_MultiTemplate'
	, 'redmic/modules/browser/ListImpl'
	, 'templates/DefaultList'
	, 'RWidgets/Utilities'
	, './NestedContent'
], function (
	declare
	, lang
	, Total
	, _ButtonsInRow
	, _Framework
	, _MultiTemplate
	, ListImpl
	, DefaultListTemplate
	, Utilities
	, NestedContent
) {

	return declare(NestedContent, {
		//	summary:
		//		Main de contenido primario y secundario de tipo listado, donde un item del primero despliega sus
		//		descendientes en el segundo.

		constructor: function(args) {

			this.config = {
				idProperty: 'id',
				typeGroupProperty: 'category',
				primaryTarget: 'primaryTarget',
				secondaryTarget: 'secondaryTarget',
				primaryListTemplate: null,
				secondaryListTemplate: null,
				_defaultTemplate: DefaultListTemplate,
				_defaultPrimaryListButtons: [{
					icon: 'fa-chevron-right',
					btnId: 'changeToSecondary',
					title: 'info',
					returnItem: true
				}],

				_defaultSecondaryListButtons: [],

				_secondaryTemplatesByTypeGroup: {}
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

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
			], {arrayMergingStrategy: 'concatenate'}));

			primaryListButtons.reverse();

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

			var secondaryListButtons = Utilities.uniq(this._merge([
				this._defaultSecondaryListButtons,
				this.secondaryListButtons || []
			], {arrayMergingStrategy: 'concatenate'}));

			secondaryListButtons.reverse();

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

		_initialize: function() {

			this.inherited(arguments);

			var BrowserDefinition = declare([ListImpl, _Framework, _ButtonsInRow, _MultiTemplate]);

			this._primaryContentInstance = new BrowserDefinition(this.primaryBrowserConfig);

			this._secondaryContentInstance = new BrowserDefinition(this.secondaryBrowserConfig);
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel : this._primaryContentInstance.getChannel('GOT_DATA'),
				callback: '_subPrimaryGotData'
			},{
				channel : this._primaryContentInstance.getChannel('BUTTON_EVENT'),
				callback: '_subListBtnEvent'
			},{
				channel : this._secondaryContentInstance.getChannel('BUTTON_EVENT'),
				callback: '_subListBtnEvent'
			},{
				channel : this.getChannel('NEW_DATA'),
				callback: '_subNewData',
				options: {
					predicate: function(req) { return !!req; }
				}
			},{
				channel : this.getChannel('CLEAR'),
				callback: '_subClear'
			},{
				channel : this.getChannel('ADD_NEW_TEMPLATES'),
				callback: '_subAddNewTemplates'
			});
		},

		_subListBtnEvent: function(evt) {

			var callback = '_' + evt.btnId + 'Callback';
			this[callback] && this[callback](evt);
		},

		_subNewData: function(req) {

			this._emitInjectItem(req);
		},

		_subPrimaryGotData: function(dataWrapper) {

			var data = dataWrapper.data;

			if (data.length === 1) {
				var item = data[0];

				this._changeToSecondaryCallback({
					btnId: 'changeToSecondary',
					id: item[this.idProperty],
					item: item
				});
			} else {
				this._changeToPrimary();
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

			this._publish(this._primaryContentInstance.getChannel('CLEAR'));
			this._publish(this._secondaryContentInstance.getChannel('CLEAR'));
		},

		_subAddNewTemplates: function(req) {

			var typeGroup = req.typeGroup,
				parentTemplate = req.parentTemplate,
				childrenTemplate = req.childrenTemplate;

			this._publish(this._primaryContentInstance.getChannel('ADD_TEMPLATE'), {
				typeGroup: typeGroup,
				template: parentTemplate
			});

			if (typeof childrenTemplate === 'object') {
				for (var key in childrenTemplate) {
					this._publish(this._secondaryContentInstance.getChannel('ADD_TEMPLATE'), {
						typeGroup: key,
						template: childrenTemplate[key]
					});
				}
			}

			this._secondaryTemplatesByTypeGroup[typeGroup] = childrenTemplate;
		},

		_changeToSecondaryCallback: function(itemData) {

			var primaryData = itemData.item;

			this._updateSecondaryTemplate(primaryData);

			var secondaryOptions = {
				title: this._getSecondaryTitleFromData(primaryData)
			};

			this._changeToSecondary(secondaryOptions);
		},

		_updateSecondaryTemplate: function(primaryData) {

			var typeGroup = primaryData[this.typeGroupProperty];

			if (!typeGroup || typeof this._secondaryTemplatesByTypeGroup[typeGroup] === 'object') {
				this._emitInjectData(primaryData.children);
			} else {
				var template = this._secondaryTemplatesByTypeGroup[typeGroup] || this.secondaryListTemplate ||
					this._defaultTemplate;

				this._once(this._secondaryContentInstance.getChannel('TEMPLATE_UPDATED'), lang.hitch(this,
					this._emitInjectData, primaryData.children));

				this._publish(this._secondaryContentInstance.getChannel('UPDATE_TEMPLATE'), {
					template: template
				});
			}
		},

		_emitInjectData: function(data) {

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this.secondaryTarget
			});
		},

		_getSecondaryTitleFromData: function(primaryData) {

			var parentName = primaryData.parentName,
				parentData = primaryData.parent,
				title;

			if (typeof parentName === 'function') {
				title = parentName(parentData);
			} else {
				title = Utilities.getDeepProp(parentData, parentName);
			}

			return title || this.title;
		}
	});
});
