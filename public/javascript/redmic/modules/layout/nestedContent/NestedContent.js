define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/base/_Store'
	, 'redmic/modules/layout/genericDisplayer/GenericWithTopbarDisplayerImpl'
	, 'RWidgets/Button'
], function (
	declare
	, lang
	, _Module
	, _Show
	, _Store
	, GenericWithTopbarDisplayerImpl
	, Button
) {

	return declare([_Module, _Show, _Store], {
		//	summary:
		//		Módulo para albergar a una pareja de componentes que manejan información con anidamiento, donde el
		//		primero representa los datos de nivel superior y el segundo muestra los datos anidados en el nivel
		//		superior seleccionado. El nivel superior se denomina primario y el anidado recibe el nombre de
		//		secundario. Se apoya en una barra superior para mostrar el título del contenido actual y un botón que
		//		permite volver desde el contenido secundario al primario.

		constructor: function(args) {

			this.config = {
				ownChannel: 'nestedContent',
				actions: {
					NEW_DATA: 'newData',
					CLEAR: 'clear',
					ADD_NEW_TEMPLATES: 'addNewTemplates'
				},

				'class': 'nestedContentContainer',
				additionalContentClasses: 'nestedContent',
				additionalTopbarContentClasses: 'compactContent',

				title: this.i18n.info
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this._createNestedInstance();
			this._createBackButton();
		},

		_createNestedInstance: function() {

			this._nestedContentWithTopbar = new GenericWithTopbarDisplayerImpl({
				parentChannel: this.getChannel(),
				content: this.browserWork,
				title: this.title,
				additionalContentClasses: this.additionalContentClasses
			});
		},

		_createBackButton: function() {

			this._backButton = new Button({
				label: this.i18n.back,
				'class': 'success',
				title: this.i18n.back,
				onClick: lang.hitch(this, this._changeToPrimary)
			});
		},

		postCreate: function() {

			this._publish(this._nestedContentWithTopbar.getChannel('SHOW'), {
				node: this.domNode
			});
		},

		_addBackButton: function() {

			if (this._backButtonAdded) {
				return;
			}

			this._publish(this._nestedContentWithTopbar.getChannel('ADD_TOPBAR_CONTENT'), {
				content: this._backButton.domNode,
				prependToTitle: true,
				additionalTopbarContentClasses: this.additionalTopbarContentClasses
			});

			this._backButtonAdded = true;
		},

		_removeBackButton: function() {

			if (!this._backButtonAdded) {
				return;
			}

			this._publish(this._nestedContentWithTopbar.getChannel('REMOVE_TOPBAR_CONTENT'), {
				content: this._backButton.domNode
			});

			this._backButtonAdded = false;
		},

		_setTitle: function(title) {

			this._publish(this._nestedContentWithTopbar.getChannel('SET_PROPS'), {
				title: title
			});
		},

		_changeToSecondary: function(args) {

			var title = args.title

			this._addBackButton();

			this._setTitle(title);

			this._showContent(this._secondaryContentInstance);
		},

		_changeToPrimary: function() {

			this._removeBackButton();

			this._setTitle(this.title);

			this._showContent(this._primaryContentInstance);
		},

		_showContent: function(contentModule, showArgs) {

			this._publish(this._nestedContentWithTopbar.getChannel('ADD_CONTENT'), {
				content: contentModule,
				showProps: showArgs || {}
			});
		}
	});
});
