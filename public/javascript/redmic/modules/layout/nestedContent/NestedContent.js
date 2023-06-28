define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/layout/genericDisplayer/GenericWithTopbarDisplayerImpl'
	, 'RWidgets/Button'
], function (
	declare
	, lang
	, _Module
	, _Show
	, GenericWithTopbarDisplayerImpl
	, Button
) {

	return declare([_Module, _Show], {
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

				additionalContentClasses: 'nestedContent',
				additionalTopbarContentClasses: 'compactContent',
				primaryInClass: 'primaryIn',
				primaryOutClass: 'primaryOut',
				secondaryInClass: 'secondaryIn',
				secondaryOutClass: 'secondaryOut',

				title: this.i18n.info,
				primaryContentChannel: null,
				secondaryContentChannel: null
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this._nestedContentWithTopbar = new GenericWithTopbarDisplayerImpl({
				parentChannel: this.getChannel(),
				content: this.browserWork,
				title: this.title,
				additionalContentClasses: this.additionalContentClasses
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._createBackButton();
			this._addBackButton();

			if (!this.primaryContentChannel) {
				console.error('Primary content channel is not specified at module "%s"', this.getChannel());
			}
		},

		_createBackButton: function() {

			this._backButton = new Button({
				label: this.i18n.back,
				'class': 'success',
				title: this.i18n.back,
				onClick: lang.hitch(this, this._changeToPrimary)
			});
		},

		_addBackButton: function() {

			this._publish(this._nestedContentWithTopbar.getChannel('ADD_TOPBAR_CONTENT'), {
				content: this._backButton.domNode,
				prependToTitle: true,
				additionalTopbarContentClasses: this.additionalTopbarContentClasses
			});
		},

		_removeBackButton: function() {

			this._publish(this._nestedContentWithTopbar.getChannel('REMOVE_TOPBAR_CONTENT'), {
				content: this._backButton.domNode
			});
		},

		_setTitle: function(title) {

			this._publish(this._nestedContentWithTopbar.getChannel('SET_PROPS'), {
				title: title
			});
		},

		_changeToSecondary: function(args) {

			var primaryData = args.primaryData,
				title = args.title,
				showAnimation = this.secondaryInClass,
				hideAnimation = this.secondaryOutClass;

			var hiddenChannel = this._buildChannel(this.primaryContentChannel, this.actions.HIDDEN);

			this._once(hiddenChannel, lang.hitch(this, function(titleArg) {

				this._addBackButton();
				this._setTitle(titleArg);
			}, title));

			if (args.showAnimation !== undefined) {
				showAnimation = args.showAnimation;
			}

			if (args.hideAnimation !== undefined) {
				hideAnimation = args.hideAnimation;
			}

			this._showContent(this._secondaryContentInstance, {
				data: primaryData,
				showAnimation: showAnimation,
				hideAnimation: hideAnimation
			});
		},

		_changeToPrimary: function() {

			var hiddenChannel = this._buildChannel(this.secondaryContentChannel, this.actions.HIDDEN);

			this._once(hiddenChannel, lang.hitch(this, function() {

				this._setTitle(this.title);
			}));

			this._removeBackButton();

			this._showContent(this._primaryContentInstance, {
				showAnimation: this.primaryInClass,
				hideAnimation: this.primaryOutClass
			});
		},

		_showContent: function(contentModule, args) {

			var data = args.data,
				showAnimationClass = args.showAnimation,
				hideAnimationClass = args.hideAnimation;

			this._publish(this._nestedContentWithTopbar.getChannel('ADD_CONTENT'), {
				content: contentModule,
				showProps: {
					data: data,
					animation: {
						showAnimation: showAnimationClass,
						hideAnimation: hideAnimationClass
					}
				}
			});
		},

		_getNodeToShow: function() {

			return this._nestedContentWithTopbar._getNodeToShow();
		},

		_beforeShow: function() {

			this._removeBackButton();

			this._setTitle(this.title);
			this._showContent(this._primaryContentInstance, {
				hideAnimation: this.primaryOutClass
			});
		},

		_afterHide: function() {

			this._publish(this._nestedContentWithTopbar.getChannel('HIDE'), {
				omitAnimation: true
			});
		}
	});
});
