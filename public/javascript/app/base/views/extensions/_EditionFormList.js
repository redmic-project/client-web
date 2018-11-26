define([
	"app/base/views/extensions/_Edition"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_Store"
], function(
	_Edition
	, declare
	, lang
	, aspect
	, _Store
){
	return declare([_Store, _Edition], {
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
						callback: "_removeItem",
						title: "remove"
					}]
				}]
			};

			lang.mixin(this, this.config);

			aspect.before(this, "_createFormSubscriptions", this._addEditionFormSubscriptions);
		},

		_addEditionFormSubscriptions: function() {

			if (this._formEditionSubscriptions) {
				this._removeSubscriptions(this._formEditionSubscriptions);
			}

			this._formEditionSubscriptions = this._setSubscriptions([{
				channel : this.form.getChannel("SAVED"),
				callback: "_subFormSaved"
			},{
				channel : this.form.getChannel("CLEARED"),
				callback: "_subFormCleared"
			}]);
		},

		_getBrowserConfig: function() {

			return this.browserConfig.browserConfig;
		},

		_setBrowserConfig: function(browserConfig) {

			this.browserConfig.browserConfig = browserConfig;
		},

		_getNodeForForm: function() {

			return this.domNode;
		},

		_addElement: function() {

		},

		_showEditForm: function (type, idProperty) {

			this.type = type;

			var item = this._results[this._resultsByIdProperty[idProperty]];

			if (item) {
				this._itemAvailable({
					target: this.target,
					data: item
				});
			} else {
				this._emitEvt('GET', {
					target: this.target,
					requesterId: this.getOwnChannel(),
					id: idProperty
				});
			}
		},

		_itemAvailable: function(response) {

			if (response.target == this.target) {
				var item = lang.clone(response.data);

				if (this.type === "copy") {
					this._cleanNotDesiredProps(item);
				}

				this._emitEvt('SHOW_FORM', {
					data: item
				});
			} else {
				this.inherited(arguments);
			}
		},

		_removeElement: function(idProperty) {

		},

		_subFormSaved: function(res) {

			this._clearSelectionList();
		},

		_subFormCleared: function(res) {

			this._clearSelectionList();
		},

		_clearSelectionList: function() {

			if (this.type === "edit") {

				this.type = null;

				this._publish(this.getChannel("CLEAR_SELECTION"));
			}
		}
	});
});
