define([
	"dijit/_TemplatedMixin"
	, "dijit/_WidgetsInTemplateMixin"
	, "dijit/layout/ContentPane"
	, "dojo/_base/lang"
	, "dojo/_base/declare"
	, "./Details"
], function(
	_TemplatedMixin
	, _WidgetsInTemplateMixin
	, ContentPane
	, lang
	, declare
	, Details
){
	return declare(Details, {
		//	summary:
		//		Se definen los métodos necesarios para usar un Details module
		//	description:
		//		Proporciona la interfaz de los métodos usados en Details.js.

		//	config: Object
		//		Opciones por defecto.

		_setImplementationCallbacksForEvents: function() {

			this._onEvt('NEXT', lang.hitch(this, this._next));
			this._onEvt('BACK', lang.hitch(this, this._back));
			this._onEvt('SELECTION', lang.hitch(this, this._selection));
		},

		_showDetails: function(/*Object*/ request) {

			if(!request.body || !request.body.data)
				return;

			this.currentItem = request.body.data;

			var content = {
				bottomContent: this._getBottomContent && this._getBottomContent(),
				centerContent: this._render(request.body)
			};

			this._showContent(content, this.events.SHOW);

			this._setCheckedSelect();
		},

		_render: function(/*Object*/ item) {

			item.i18n = this.i18n;
			return new declare([ContentPane, _TemplatedMixin, _WidgetsInTemplateMixin])({
				region: "center",
				templateString: lang.replace(this.template, item)
			});
		},

		_showContent: function(/*Object*/ content, /*String*/ evt) {

			// No funciona (solo para el caso de que no esté en un dialog) Se le debe pasar un nodo y hacer un put.
			//TODO: meter this.bottomContent + el resultado del _render en un contenerdor y hacer el put de eso;
			console.warn("Warn: Método no implementado para cuando no está contenido en un dialog");
		},

		_setCheckedSelect: function() {

			this._emitEvt('SET_CHECK_VALUE', this._isSelected());
		},

		_hideContent: function(evt) {

			// No funciona (solo para el caso de que no esté en un dialog) Se le debe eliminar el nodo y emitir el evento pasado
			console.warn("Warn: Método no implementado para cuando no está contenido en un dialog");
		},

		_isSelected: function() {

			return this.currentItem && this.currentItem[this.idProperty] in this.selection;
		},

		_selection: function(state) {

			var eventToEmit = state ? 'SELECT' : 'DESELECT',
				ids = this.currentItem[this.idProperty];
			state ? this._select(ids) : this._deselect(ids);
			this._emitEvt(eventToEmit, {target: this.target, ids: ids});
		},

		_deselect: function(idProperty) {

			delete this.selection[idProperty];
		},

		_select: function(idProperty) {

			this.selection[idProperty] = true;
		},

		_clearSelection: function() {

			this.selection = {};
		},

		_getSelection: function() {

			return this.selection;
		},

		_back: function(/*Object*/ evt) {

			console.debug("dentro de back");
			this._setCheckedSelect();
		},

		_next: function(/*Object*/ evt) {

			console.debug("dentro de next");
			this._setCheckedSelect();
		}
	});
});