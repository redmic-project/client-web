define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/form/FormContainerImpl"
	, 'src/component/form/_CreateInternalKeypad'
	, "src/component/form/_ListenModelHasChanged"
	, 'src/component/base/_ShowInPopup'
], function(
	declare
	, lang
	, aspect
	, FormContainerImpl
	, _CreateInternalKeypad
	, _ListenModelHasChanged
	, _ShowInPopup
) {

	return declare(null, {
		//	summary:
		//		Extensión para las vistas con formulario en un Dialog.
		//	description:
		//		Crea la instancia del tipo de formulario deseado.

		constructor: function(args) {

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setFormInDialogViewConfigurations));
			aspect.after(this, "_beforeInitialize", lang.hitch(this, this._initializeFormInDialogView));
		},

		_setFormInDialogViewConfigurations: function() {

			this.formConfig = this._merge([{
				modelTarget: this.editionTarget || this.target,
				modelSchema: this.modelSchema,
				idProperty: this.idProperty,
				lockBackground: true,
				parentChannel: this.getChannel(),
				buttonsConfig: {
					submit: {
						props: {
							label: this.i18n.save
						}
					}
				}
			}, this.formConfig || {}]);
		},

		_initializeFormInDialogView: function() {

			var FormDefinition = declare([
				FormContainerImpl, _ListenModelHasChanged, _CreateInternalKeypad
			]).extend(_ShowInPopup);

			this.editor = new FormDefinition(this.formConfig);
		},

		_afterSaved: function(results) {

			this.inherited(arguments);
			this._publish(this.editor.getChannel('HIDE'));
		}
	});
});
