define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "RWidgets/Utilities"
	, "put-selector/put"
	, "./_RowItfc"
], function(
	declare
	, lang
	, _Module
	, _Show
	, Utilities
	, put
	, _RowItfc
){
	return declare([_Module, _RowItfc, _Show], {
		//	summary:
		//		Todo lo necesario para trabajar con browser.
		//	description:
		//		Proporciona métodos y contenedor para el browser.

		constructor: function(args) {

			this.config = {
				rowContainerClass: "containerRow",
				rowContainerTopClass: "containerTopRow",
				rowContainerBottomClass: "containerBottomRow",

				actions: {
					UPDATE_TEMPLATE_ROW: "updateTemplateRow",
					UPDATE_TEMPLATE: "updateTemplate",
					UPDATE_DATA: "updateData"
				},

				idProperty: 'id',

				templateColClass: ".col-xs-12.col-sm-12.col-md-12.col-lg-12.col-xl-12"
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getParentChannel("UPDATE_TEMPLATE_ROW"),
				callback: "_subUpdateTemplate"
			},{
				channel : this.getChannel("UPDATE_TEMPLATE"),
				callback: "_subUpdateTemplate"
			},{
				channel : this.getChannel("UPDATE_DATA"),
				callback: "_subUpdateData"
			});
		},

		postCreate: function() {

			this._createStructure();

			this.inherited(arguments);
		},

		_createStructure: function() {

			put(this.domNode, "." + this.rowContainerClass);

			this.rowTopNode = put(this.domNode, "div." + this.rowContainerTopClass);
			this.rowBottomNode = put(this.domNode, "div." + this.rowContainerBottomClass);

			this.templateNode = put(this.rowTopNode, "span.rowList");
			put(this.templateNode, this.templateColClass);
		},

		_subUpdateTemplate: function(req) {

			this.template = req.template;
		},

		_subUpdateData: function(req) {

			this._updateData(req.data);
		},

		_afterShow: function(obj) {

			this._updateData(obj.data);
		},

		_updateData: function(item) {

			this.currentData = item;

			put(this.templateNode, "[data-redmic-id=$]", this._getId());

			this._replaceHighlights();

			this.templateNode.innerHTML = this._getContent();
		},

		_getId: function() {

			return this.currentData[this.idProperty];
		},

		_getContent: function() {

			if (this.itemLabel) {
				return this._getLabelValue();
			} else {
				return this._insertTemplate();
			}
		},

		_getLabelValue: function() {

			var item = this.currentData;

			if (this._isItemLabelFunction()) {
				return this.itemLabel(item);
			}

			if (this._isItemLabelString()) {
				return this._getItemLabelString();
			}

			return item[this.itemLabel];
		},

		_getItemLabelString: function() {

			var item = this.currentData;

			if (this.itemLabel.indexOf("{") < 0) {
				return item[this.itemLabel];
			}

			return lang.replace(this.itemLabel, item);
		},

		_isItemLabelFunction: function() {

			if (typeof this.itemLabel === "function") {
				return true;
			}

			return false;
		},

		_isItemLabelString: function() {

			if (typeof this.itemLabel === "string") {
				return true;
			}

			return false;
		},

		_insertTemplate: function() {

			return this._getTemplate(this._propertiesTemplate());
		},

		_propertiesTemplate: function() {

			var obj = {
				data: this.currentData
			};

			if (this.i18n) {
				obj.i18n = this.i18n;
			}

			if (this.shownOptionTemplate) {
				obj.shownOption = this.shownOptionTemplate;
			}

			return obj;
		},

		_getTemplate: function(dataObj) {

			return this.template && this.template(dataObj);
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_replaceHighlights: function() {

			var item = this.currentData;

			if (item && item._meta) {
				var highlight = item._meta.highlight;

				for (var property in highlight) {
					this._replaceHighlight(property, highlight[property]);
				}
			}
		},

		_replaceHighlight: function(property, content) {

			var value = Utilities.getDeepProp(this.currentData, property);

			if (!value) {
				return;
			}

			Utilities.setDeepProp(this.currentData, property, this._replaceHighlightInContent(value, content));
		},

		_replaceHighlightInContent: function(value, content) {

			var returnValue = value;

			for (var i = 0; i < content.length; i++) {
				returnValue = this._replacePartHighlightInContent(returnValue, content[i]);
			}

			return returnValue;
		},

		_replacePartHighlightInContent: function(value, content) {

			return value.replace(this._cleanValueHighlight(content), content);
		},

		_cleanValueHighlight: function(value) {

			return value.replace(/<b>/g, '').replace(/<\/b>/g, '');
		}
	});
});
