define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "app/designs/details/_AddTitle"
], function (
	declare
	, lang
	, aspect
	, _AddTitle
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
			aspect.before(this, "_refreshModules", lang.hitch(this, this._beforeRefreshModulesAddBasicTitle));
		},

		_setAddBasicTitleConfigurations: function() {

			this.titleWidgetConfig = this._merge([{
				target: this.getOwnChannel() + "DetailsTitle"
			}, this.titleWidgetConfig || {}]);
		},

		_beforeRefreshModulesAddBasicTitle: function() {

			this._updateTitle();
		},

		_updateTitle: function() {

			this._emitEvt('INJECT_ITEM', {
				data: {
					title: this.title
				},
				target: this.getOwnChannel() + "DetailsTitle"
			});
		}
	});
});
