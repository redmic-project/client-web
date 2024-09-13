define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
	, "RWidgets/DatePicker"
	, "./Search"
], function(
	declare
	, lang
	, aspect
	, put
	, DatePicker
	, Search
){
	return declare(Search, {
		//	summary:
		//		Todo lo necesario para trabajar con MapSearch.
		//	description:
		//		Proporciona métodos y contenedor para la búsqueda de tipo bbox.

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				propertyName: 'dateLimits',
				ownChannel: "dateRangeSearch"
			};

			lang.mixin(this, this.config, args);
			aspect.before(this, "_setConfigurations", lang.hitch(this, this._setDateRangeConfigurations));
		},

		_setDateRangeConfigurations: function() {

			this.datePickerConfig = this._merge([{

			}, this.datePickerConfig || {}]);
		},

		_initialize: function() {

			this.datePicker = new DatePicker(this.datePickerConfig);

			this.datePicker.on(this.datePicker.events.QUERYDATE, lang.hitch(this, this._onNewSearch));
		},

		_beforeShow: function(/*Object*/ obj) {

			this.datePicker.placeAt(this.domNode);
		},

		getNodeToShow: function() {

			return this.domNode;
		},

		_reset: function() {

			this.datePicker.emit(this.datePicker.events.RESET);
		},

		_onNewSearch: function(evt) {

			this._newSearch(evt);

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: "openDateFilter"
				}
			});
		}
	});
});
