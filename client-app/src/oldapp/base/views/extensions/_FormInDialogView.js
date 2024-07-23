define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/form/FormContainerImpl"
	, "src/component/form/_ListenModelHasChanged"
	, "src/component/form/_ShowInDialog"
], function(
	declare
	, lang
	, aspect
	, FormContainerImpl
	, _ListenModelHasChanged
	, _ShowInDialog
){
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

			var formDef = declare([FormContainerImpl, _ListenModelHasChanged, _ShowInDialog]);
			this.editor = new formDef(this.formConfig);
		},

		_afterSaved: function(results) {

			this.inherited(arguments);
			this._publish(this.editor.getChannel('HIDE'));
		}
	});
});
