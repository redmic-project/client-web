define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "app/designs/details/_AddTitle"
	, "templates/DefaultDetailsTitle"
], function (
	declare
	, lang
	, aspect
	, _AddTitle
	, TemplateTitle
){
	return declare(_AddTitle, {
		//	summary:
		//		Extensión para añadir Title a detalles

		constructor: function(args) {

			this.configAddBasicTitle = {
				_titleRightButtonsList: []
			};

			lang.mixin(this, this.configAddBasicTitle, args);

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setAddBasicTitleConfigurations));
			aspect.before(this, "_refreshModules", lang.hitch(this, this._refreshModulesAddBasicTitle));
		},

		_setAddBasicTitleConfigurations: function() {

			this.titleWidgetConfig = this._merge([{
				template: TemplateTitle,
				target: this.getOwnChannel() + "DetailsTitle"
			}, this.titleWidgetConfig || {}]);
		},

		_refreshModulesAddBasicTitle: function() {

			this._emitEvt('INJECT_ITEM', {
				data: {
					title: this.title
				},
				target: this.getOwnChannel() + "DetailsTitle"
			});
		}
	});
});
