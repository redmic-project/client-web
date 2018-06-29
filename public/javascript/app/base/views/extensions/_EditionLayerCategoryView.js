define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "RWidgets/Button"
], function(
	declare
	, lang
	, Button
){
	return declare(null, {
		//	summary:
		//		Extensión para las vistas de edición de datos relativos a capas.
		//	description:
		//		Añade funcionalidades de edición a la vista.
		//		Ha de declararse junto con una extensión que aporte los métodos
		//		en los que se apoya.


		constructor: function(args) {

			this.config = {
				listButtonsEdition: [{
					groupId: "edition",
					icons:[{
						icon: "fa-edit",
						btnId: "categoryEdit",
						title: "edit",
						returnItem: true,
						option: "default",
						condition: this._checkItemIsCategory
					},{
						icon: "fa-trash-o",
						btnId: "remove",
						title: "remove",
						condition: this._checkItemIsCategory
					}]
				}]
			};

			lang.mixin(this, this.config);
		},

		_addEditionButtons: function() {

			if (this.buttonsNode) {
				this.addNewButton = new Button({
					iconClass: "fa fa-plus",
					'class': "success",
					title: this.i18n.addLayersCategory,
					onClick: lang.hitch(this, this._addNewLayersCategoryCallback)
				}).placeAt(this.buttonsNode);
			}
		},

		_addNewLayersCategoryCallback: function(evt) {

			this._emitEvt('SHOW_FORM', {
				//data: null,
				node: this._getNodeForForm()
			});
		}
	});
});
