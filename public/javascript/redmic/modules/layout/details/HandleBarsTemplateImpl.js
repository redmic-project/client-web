define([
	"dojo/_base/lang"
	, "dojo/_base/declare"
	, "dojo/query"
	, "put-selector/put"
	, "RWidgets/TemplateWidget"
	, "templates/LoadingEmpty"
	, "./Details"
], function(
	lang
	, declare
	, query
	, put
	, TemplateWidget
	, LoadingEmpty
	, Details
){
	return declare(Details, {
		//	summary:
		//		Se definen los métodos necesarios para usar un Details module
		//	description:
		//		Proporciona la interfaz de los métodos usados en Details.js.

		//	config: Object
		//		Opciones por defecto.

		_initialize: function() {

			this._createInstance();
		},

		_createInstance: function() {

			this.templateWidget = new TemplateWidget({
				template: this.template,
				postTemplate: this.postTemplate,
				parentChannel: this.getChannel(),
				noDataMessage: LoadingEmpty()
			});

			this._listenEvents();
		},

		_listenEvents: function() {

			this.templateWidget.on(this.templateWidget.events.SHOWN, lang.hitch(this, this._emitTemplateShown));
			this.templateWidget.on(this.templateWidget.events.ERROR, lang.hitch(this, this._emitError));
			this.templateWidget.on(this.templateWidget.events.HIDE, lang.hitch(this, this._hide));
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('NEXT', lang.hitch(this, this._next));
			this._onEvt('BACK', lang.hitch(this, this._back));
			this._onEvt('SELECTION', lang.hitch(this, this._selection));
		},

		_getNodeToShow: function() {

			this._render(this.currentData);
			this._setCheckedSelect();
			return this.templateWidget.domNode;
		},

		_render: function(item) {

			this.templateWidget.emit(this.templateWidget.events.RENDER, this.i18n, item);
		},

		_setCheckedSelect: function() {

			this._emitEvt('SET_CHECK_VALUE', this._isSelected());
		},

		_emitTemplateShown: function() {

			this._emitEvt('SHOW');
		},

		_emitError: function(/*Object*/ evt) {

			this._emitEvt('ERROR', evt);
		},

		_updateTemplate: function(templateData) {

			if(!templateData || !templateData.templateWidget || !templateData.i18n)
				return;

			this.template = templateData.templateWidget;
			this.i18n = templateData.i18n;
		},

		_isSelected: function() {

			return this.currentData && this.currentData[this.idProperty] in this.selection;
		},

		_selection: function(state) {

			var eventToEmit = state ? 'SELECT' : 'DESELECT',
				ids = this.currentData[this.idProperty];
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