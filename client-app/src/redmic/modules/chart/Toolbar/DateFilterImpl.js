define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
	, "redmic/modules/base/_ShowInTooltip"
	, "redmic/modules/base/_ShowOnEvt"
	, "redmic/modules/form/input/DateRangeComplexImpl"
	, "put-selector/put"
	, "./Toolbar"
], function(
	declare
	, lang
	, aspect
	, Utilities
	, _ShowInTooltip
	, _ShowOnEvt
	, DateRangeComplexImpl
	, put
	, Toolbar
){
	return declare(Toolbar, {
		//	summary:
		//		Herramienta para aplicar filtro por fecha en las peticiones de datos.

		constructor: function(args) {

			this.config = {
				ownChannel: 'dateFilter',
				iconClass: 'fa-calendar',
				_closeOnValueSetTimeout: 800
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_defineSubscriptions', lang.hitch(this, this._defineDataFilterSubscriptions));
		},

		_setConfigurations: function() {

			this.dateRangeComplexConfig = this._merge([{
				parentChannel: this.getChannel(),
				classTooltip: 'tooltipButtonMenu',
				filterChannel: this.queryChannel
			}, this.dateRangeComplexConfig || {}]);
		},

		_initialize: function() {

			var definition = declare([DateRangeComplexImpl, _ShowOnEvt]).extend(_ShowInTooltip);

			this.dateRangeComplex = new definition(this.dateRangeComplexConfig);
		},

		_defineDataFilterSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.dateRangeComplex.getChannel('VALUE_CHANGED'),
				callback: '_subDateRangeValueChanged'
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			var classNames = '.icon.' + this._getIconClassNames(),
				title = this.title || this.i18n.dateFilter;

			this.sourceNode = put(this.domNode, 'i' + classNames + '[title=' + title + ']');

			this._publish(this.dateRangeComplex.getChannel('ADD_EVT'), {
				sourceNode: this.sourceNode
			});
		},

		_getIconClassNames: function() {

			var iconClassPrefix = this.iconClass.split('-')[0];

			return iconClassPrefix + '.' + this.iconClass;
		},

		_subDateRangeValueChanged: function(res) {

			setTimeout(lang.hitch(this, this._publish, this.dateRangeComplex.getChannel('HIDE')),
				this._closeOnValueSetTimeout);

			this._emitEvt('TOOL_ACTUATED', {
				value: res.value
			});
		}
	});
});
