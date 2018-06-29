define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "put-selector/put"
	, "./_RowItfc"
], function(
	declare
	, lang
	, _Module
	, _Show
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

			put(this.templateNode, "[data-redmic-id=$]", this._getId(item));

			this.templateNode.innerHTML = this._insertTemplate(item);
		},

		_getId: function(item) {

			return item[this.idProperty];
		},

		_insertTemplate: function(item) {

			var json = {data: item};

			if (this.i18n) {
				json.i18n = this.i18n;
			}

			if (this.shownOptionTemplate) {
				json.shownOption = this.shownOptionTemplate;
			}

			if (this.itemLabel) {
				return this._getLabelValue(item);
			} else {
				return this._getTemplate(json);
			}
		},

		_getLabelValue: function(item) {

			if (typeof this.itemLabel === "function") {
				return this.itemLabel(item);
			}

			if (typeof this.itemLabel === "string") {
				if (this.itemLabel.indexOf("{") < 0) {
					return item[this.itemLabel];
				}

				return lang.replace(this.itemLabel, item);
			}

			return item[this.itemLabel];
		},

		_getTemplate: function(dataObj) {

			return this.template && this.template(dataObj);
		},

		_getNodeToShow: function() {

			return this.domNode;
		}
	});
});
