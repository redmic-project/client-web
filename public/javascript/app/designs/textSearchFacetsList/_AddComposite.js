define([
	"app/base/views/extensions/_CompositeInTooltipFromIconKeypad"
	, "dojo/_base/declare"
], function(
	_CompositeInTooltipFromIconKeypad
	, declare
){
	return declare(_CompositeInTooltipFromIconKeypad, {
		//	summary:
		//
		//	description:
		//

		_setCompositeConfigurations: function() {

			this.inherited(arguments);

			this.buttonsComposite = this._merge([this.buttonsComposite || {}, {
				"filters": {
					className: "fa-binoculars",
					title: this.i18n.advancedSearch
				}
			}]);

			this.compositeConfig = this._merge([{
				formConfig: {
					dataTemplate: {
						formTitle: this.i18n.advancedSearch
					}
				}
			}, this.compositeConfig || {}]);
		},

		_getIconKeypadNode: function() {

			return this.topNode;
		}
	});
});
