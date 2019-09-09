define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_Store"
	, "redmic/modules/base/_Persistence"
	, "app/base/views/extensions/_Edition"
	, "RWidgets/Button"
], function(
	declare
	, lang
	, aspect
	, _Store
	, _Persistence
	, _Edition
	, Button
){
	return declare([_Store, _Persistence, _Edition], {
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
						icon: "fa-edit",
						btnId: "edit",
						title: "edit",
						option: "default"
					},{
						icon: "fa-trash-o",
						btnId: "remove",
						title: "remove"
					}]
				}],
				noAddButton: false
			};

			lang.mixin(this, this.config);

			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineEditionViewSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineEditionViewPublications));
		},

		_defineEditionViewSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.editor.getChannel("SUBMITTED"),
				callback: "_subSubmitted"
			});
		},

		_defineEditionViewPublications: function() {

			this.publicationsConfig.push({
				event: 'SAVED',
				channel: this.editor.getChannel("SAVED")
			});

			this.publicationsConfig.push({
				event: 'SHOW_FORM',
				channel: this.editor.getChannel("SHOW")
			});
		},

		_addEditionButtons: function() {

			if (this.buttonsNode && !this.noAddButton) {
				this.addNewButton = new Button({
					iconClass: "fa fa-plus",
					'class': "success",
					title: this.i18n.add,
					onClick: lang.hitch(this, this._addNewElementCallback)
				}).placeAt(this.buttonsNode);
			}
		},

		_subSubmitted: function(res) {

			if (res.error) {
				return;
			}

			this._emitEvt('LOADING', {
				global: true
			});

			this._emitEvt('SAVE', {
				data: res.data,
				target: this.target
			});
		},

		_afterSaved: function(result) {

			this._emitEvt('LOADED');
		},

		_getNodeForForm: function() {

			return this.domNode;
		},

		_addElement: function() {

			this._emitEvt('SHOW_FORM', {
				//data: null,
				node: this._getNodeForForm()
			});
		},

		_showEditForm: function (type, idProperty) {

			this.type = type;

			var obj = {
				target: this.target,
				requesterId: this.getOwnChannel(),
				id: idProperty
			};

			if (this.typeRequest) {
				obj.type = this.typeRequest;
			}

			this._emitEvt('GET', obj);
		},

		_itemAvailable: function(response) {

			this.inherited(arguments);

			var item = response.data;

			if (this.type === "copy") {
				this._cleanNotDesiredProps(item);
			}

			this._emitEvt('SHOW_FORM', {
				data: item,
				toInitValues: true,
				node: this._getNodeForForm()
			});
		}
	});
});
