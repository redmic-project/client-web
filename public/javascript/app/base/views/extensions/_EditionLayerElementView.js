define([
	'alertify/alertify.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "RWidgets/Button"
], function(
	alertify
	, declare
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
						icon: "fa-refresh",
						btnId: "update",
						title: "update",
						option: "default",
						condition: "urlSource"
					},{
						icon: "fa-edit",
						btnId: "edit",
						title: "edit",
						href: this.viewPaths.serviceOGCEdit,
						option: "default",
						condition: "urlSource"
					},{
						icon: "fa-edit",
						btnId: "categoryEdit",
						title: "edit",
						returnItem: true,
						option: "default",
						condition: this._checkItemIsCategory
					},{
						icon: "fa-trash-o",
						btnId: "remove",
						title: "remove"
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
					title: this.i18n.add,
					onClick: lang.hitch(this, this._promptForUrl)
				}).placeAt(this.buttonsNode);
			}
		},

		_promptForUrl: function() {

			alertify.prompt(this.i18n.newLayerURL, "",
				lang.hitch(this, function(evt, value) {

					var regExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

					var obj = {
						'url': value
					};

					if (regExp.test(value)) {
						this._emitEvt('SAVE', this._getObjToSave(obj));
					} else {
						this._urlInvalid(obj);
					}
				}))
				.setHeader(this.i18n.addLayers)
				.set("labels", {
					ok: this.i18n.add,
					cancel: this.i18n.cancel
				});
		},

		_getObjToSave: function(data) {

			return {
				target: this._getTarget(),
				item: data,
				idProperty: this.idProperty
			};
		},

		_urlInvalid: function(obj) {

			alertify.alert(this.i18n.invalidURL, this.i18n.invalidURLMessage + obj.url);
		}
	});
});
