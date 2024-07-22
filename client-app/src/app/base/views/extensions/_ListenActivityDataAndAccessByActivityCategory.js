define([
	"app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	redmicConfig
	, declare
	, lang
	, aspect
){
	return declare(null, {
		//	summary:
		//		Extensión para las vistas que dependen de una categoría de actividad
		//	description:
		//		La vista pide los datos de la actividad, los escuchamos y realizamos la acción por la categoría.

		constructor: function(args) {

			this.config = {
				activityTarget: redmicConfig.services.activity
			};

			lang.mixin(this, this.config);

			aspect.before(this, "_itemAvailable", lang.hitch(this, this._itemActivityAvailable));
		},

		_itemActivityAvailable: function(res, resWrapper) {

			var target = resWrapper.target,
				data = res.data;

			if (this.activityTarget === target) {
				this._accessByActivityCategory(data.activityCategory);
			}
		},

		_accessByActivityCategory: function(activityCategory) {

			if (!activityCategory || this.activityCategory.indexOf(activityCategory) === -1) {
				this._goTo404();
			}
		}
	});
});
