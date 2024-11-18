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
		// 	Vista de Country.
		// description:
		// 	Muestra la información.

		constructor: function(args) {

			this.config = {
				title: this.i18n.country,
				target: this.services.country
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.formConfig = this._merge([{
				template: 'src/maintenance/domain/form/Countries'
			}, this.formConfig || {}]);

			this.browserConfig = this._merge([{
				template: templateList,
				orderConfig: {
					options: [
						{value: "code"}
					]
				}
			}, this.browserConfig || {}]);
		}
	});
});
