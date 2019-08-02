define([
	"app/designs/textSearchList/main/Domain"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/CountryList"
], function(
	DomainMain
	, declare
	, lang
	, templateList
){
	return declare(DomainMain, {
		// summary:
		// 	Vista de Theme Inspire.
		// description:
		// 	Muestra la información.

		constructor: function(args) {

			this.config = {
				title: this.i18n.themeInspire,
				target: this.services.themeInspire,
				editionTarget: this.services.themeInspireEdition
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.formConfig = this._merge([{
				template: "maintenance/domains/geometry/views/templates/forms/InspireThemes"
			}, this.formConfig || {}]);

			this.browserConfig = this._merge([{
				template: templateList,
				orderConfig: {
					options: [
						{value: "code"}
					]
				}
			}, this.browserConfig || {}]);
		},

		_removeCallback: function(item) {

			this._emitEvt('REMOVE', {
				target: this.editionTarget,
				id: item.id
			});
		}
	});
});
