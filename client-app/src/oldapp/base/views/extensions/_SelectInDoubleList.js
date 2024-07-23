define([
	"app/base/views/extensions/_LocalSelectionView"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/browser/_Select"
], function(
	_LocalSelectionView
	, declare
	, lang
	, aspect
	, _Select
){
	return declare(_LocalSelectionView, {
		//	summary:
		//		Extensión para las vistas de doble listado.
		//	description:
		//		Añade funcionalidad de marcar en el listado izquierdo lo añadido en el derecho

		constructor: function(args) {

			this.config = {

			};

			lang.mixin(this, this.config);

			aspect.before(this, "_afterSetConfigurations", this._setEditionFormListConfigurations);
			aspect.before(this, "_addItemInListRight", this._beforeAddItemInListRight);
			aspect.before(this, "_deleteItemInListRight", this._beforeDeleteItemInListRight);
			aspect.before(this, "_clearItemsInListRight", this._beforeClearItemsInListRight);
		},

		_setEditionFormListConfigurations: function() {

			this.browserLeftConfig = this._merge([{
				selectorChannel: this.getChannel(),
				selectionTarget: this.getChannel(),
				noSeeSelect: true,
				simpleSelection: false
			}, this.browserLeftConfig || {}]);

			this.leftConfig = this._merge([{
				browserExts: [_Select]
			}, this.leftConfig || {}]);
		},

		_beforeAddItemInListRight: function(id, data) {

			this._publish(this.getChannel("SELECTED"), {
				"success": true,
				"body": {
					"ids": [id],
					"selectionTarget": this.getChannel()
				}
			});
		},

		_beforeDeleteItemInListRight: function(id, data) {

			this._publish(this.getChannel("DESELECTED"), {
				"success": true,
				"body": {
					"ids": [id],
					"selectionTarget": this.getChannel()
				}
			});
		},

		_beforeClearItemsInListRight: function() {

			this._publish(this.getChannel("CLEAR_SELECTION"), {
				"success": true,
				"body": {
					"selectionTarget": this.getChannel()
				}
			});
		}
	});
});
