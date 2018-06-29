define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_Persistence"
	, "app/base/views/extensions/_Edition"
	, "RWidgets/Button"
], function(
	declare
	, lang
	, aspect
	, _Persistence
	, _Edition
	, Button
){
	return declare([_Persistence, _Edition], {
		//	summary:
		//		Extensión para las vistas de edición de datos.
		//	description:
		//		Añade funcionalidades de edición a la vista.
		//		Ha de declararse junto con una extensión que aporte un formulario.

		constructor: function(args) {

			this.config = {
				listButtonsEdition: [{
					groupId: "edition",
					icons:[{
						icon: "fa-trash-o",
						btnId: "remove",
						title: "remove",
						returnItem: true
					}]
				}],

				dataAddPath: {id: 'new'}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setOwnCallbacksForEvents", lang.hitch(this, this._setEditionWizardOwnCallbacksForEvents));
		},

		_setEditionWizardOwnCallbacksForEvents: function() {

			this._onEvt('SHOW', lang.hitch(this, this._shownEditionWizard));
		},

		_shownEditionWizard: function() {

			this.addNewButton && this.addNewButton.updateHref(lang.replace(this.addPath, this.dataAddPath));
		},

		_addEditionButtons: function() {

			if (this.buttonsNode && this.addPath) {
				this.addNewButton = new Button({
					iconClass: "fa fa-plus",
					'class': "success",
					'title': this.i18n.add,
					'href': lang.replace(this.addPath, this.dataAddPath)
				}).placeAt(this.buttonsNode);
			}
		}
	});
});
