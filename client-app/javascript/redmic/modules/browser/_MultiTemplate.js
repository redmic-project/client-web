define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
], function(
	declare
	, lang
	, aspect
	, put
){
	return declare(null, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				multiTemplateEvents: {},
				multiTemplateActions: {
					ADD_TEMPLATE: "addTemplate",
					DELETE_TEMPLATE: "deleteTemplate",
					ADD_TEMPLATE_ROW: "addTemplateRow",
					DELETE_TEMPLATE_ROW: "deleteTemplateRow"
				},

				typeGroupProperty: "dataType",
				templatesByTypeGroup: {},
				existsPropertyWithTemplate: false
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixMultiTemplateEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineMultiTemplateSubscriptions));
		},

		_mixMultiTemplateEventsAndActions: function () {

			lang.mixin(this.events, this.multiTemplateEvents);
			lang.mixin(this.actions, this.multiTemplateActions);

			delete this.multiTemplateEvents;
			delete this.multiTemplateActions;
		},

		_defineMultiTemplateSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("ADD_TEMPLATE"),
				callback: "_subAddTemplate"
			},{
				channel : this.getChannel("DELETE_TEMPLATE"),
				callback: "_subDeleteTemplate"
			});
		},

		_subAddTemplate: function(req) {

			this._addTemplate(req);
		},

		_addTemplate: function(obj) {

			var typeGroup = obj.typeGroup,
				template = obj.template;

			if (!typeGroup || !template) {
				return;
			}

			this.templatesByTypeGroup[typeGroup] = template;
		},

		_subDeleteTemplate: function(req) {

			this._deleteTemplate(req);
		},

		_deleteTemplate: function(obj) {

			var typeGroup = obj.typeGroup;

			if (!typeGroup || !this.templatesByTypeGroup[typeGroup]) {
				return;
			}

			delete this.templatesByTypeGroup[typeGroup];
		},

		_getTemplate: function(item) {

			var template;

			if (this.existsPropertyWithTemplate) {
				for (var key in this.templatesByTypeGroup) {
					if (item[key] !== undefined ||
						(item._meta && item._meta[key] !== undefined)) {
						template = this.templatesByTypeGroup[key];
						break;
					}
				}
			} else {
				var id = item[this.idProperty],
					typeGroup = item[this.typeGroupProperty] ||
						(item._meta && item._meta[this.typeGroupProperty]);

				template = typeGroup ? this.templatesByTypeGroup[typeGroup] : null;
			}

			return template || this.template;
		}
	});
});
