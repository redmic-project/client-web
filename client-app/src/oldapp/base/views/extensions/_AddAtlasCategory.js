define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, "src/component/base/_Persistence"
	, 'src/component/form/FormContainerImpl'
	, 'src/component/form/_CreateInternalKeypad'
	, "src/component/form/_ListenModelHasChanged"
	, 'src/component/form/_PublicateChanges'
	, 'src/component/base/_ShowInPopup'
], function(
	declare
	, lang
	, aspect
	, _Persistence
	, FormContainerImpl
	, _CreateInternalKeypad
	, _ListenModelHasChanged
	, _PublicateChanges
	, _ShowInPopup
) {

	return declare(_Persistence, {
		//	summary:
		//		Extensión que añade input de texto y botón, para buscar contenido

		constructor: function(args) {

			this.config = {};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_afterSetConfigurations', lang.hitch(this, this._setAddAtlasCategoryConfigurations));
			aspect.after(this, '_beforeInitialize', lang.hitch(this, this._initializeAddAtlasCategory));
			aspect.after(this, '_defineSubscriptions', lang.hitch(this, this._defineAddAtlasCategorySubscriptions));
		},

		_setAddAtlasCategoryConfigurations: function() {

			this.formConfig = this._merge([{
				formContainerConfig: {
					onAddCategory: lang.hitch(this, this._onAddCategory)
				}
			}, this.formConfig || {}]);

			this.categoryFormConfig = this._merge([{
				parentChannel: this.getChannel(),
				template: 'maintenance/views/templates/forms/CategoryLayer',
				modelTarget: this.editionTarget,
				lockBackground: true
			}, this.categoryFormConfig || {}]);
		},

		_initializeAddAtlasCategory: function() {

			var FormDefinition = declare([
				FormContainerImpl, _ListenModelHasChanged, _CreateInternalKeypad
			]).extend(_ShowInPopup);

			this._categoryForm = new FormDefinition(this.categoryFormConfig);
		},

		_defineAddAtlasCategorySubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this._categoryForm.getChannel("SUBMITTED"),
				callback: "_subCategoryFormSubmitted"
			});
		},

		_onAddCategory: function() {

			this._editCategory();
		},

		_editCategory: function(category) {

			this._publish(this._categoryForm.getChannel('SHOW'), {
				data: category,
				node: this.domNode
			});
		},

		_subCategoryFormSubmitted: function(res) {

			if (res.error) {
				return;
			}

			this._emitEvt('LOADING', {
				global: true
			});

			this._emitEvt('SAVE', {
				target: this.editionTarget,
				data: res.data
			});
		},

		_afterSaved: function(res) {

			this._publish(this._categoryForm.getChannel('HIDE'));
			this._emitEvt('LOADED');
		}
	});
});
