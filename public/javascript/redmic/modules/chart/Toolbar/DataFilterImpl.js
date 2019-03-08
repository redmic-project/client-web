define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
	, "redmic/modules/base/_ShowInTooltip"
	, "redmic/modules/base/_ShowOnEvt"
	, "redmic/modules/form/input/DateRangeTextBoxImpl"
	, "put-selector/put"
	, "./Toolbar"
], function(
	declare
	, lang
	, aspect
	, Utilities
	, _ShowInTooltip
	, _ShowOnEvt
	, DateRangeTextBoxImpl
	, put
	, Toolbar
){
	return declare(Toolbar, {
		//	summary:
		//		Herramienta para aplicar filtros en las peticiones de datos.

		constructor: function(args) {

			this.config = {
				ownChannel: 'dataFilter',
				iconClass: 'fa-filter',
				_closeOnValueSetTimeout: 800
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_defineSubscriptions', lang.hitch(this, this._defineDataFilterSubscriptions));
		},

		_setConfigurations: function() {

			this.dateRangeTextBoxConfig = this._merge([{
				parentChannel: this.getChannel(),
				orient: ['below-alt'],
				classTooltip: 'tooltipButtonMenu',
				filterChannel: this.queryChannel
			}, this.dateRangeTextBoxConfig || {}]);
		},

		_initialize: function() {

			this.dateRangeTextBox = new declare([DateRangeTextBoxImpl, _ShowOnEvt])
				.extend(_ShowInTooltip)(this.dateRangeTextBoxConfig);
		},

		_defineDataFilterSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.dateRangeTextBox.getChannel('VALUE_CHANGED'),
				callback: '_subDateRangeTextBoxValueChanged'
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			var classNames = '.icon.' + this._getIconClassNames(),
				title = this.title || this.i18n.dataFilter;

			this.sourceNode = put(this.domNode, 'i' + classNames + '[title=' + title + ']');

			this._publish(this.dateRangeTextBox.getChannel('ADD_EVT'), {
				sourceNode: this.sourceNode
			});
		},

		_getIconClassNames: function() {

			var iconClassPrefix = this.iconClass.split('-')[0];

			return iconClassPrefix + '.' + this.iconClass;
		},

		_subDateRangeTextBoxValueChanged: function(res) {

			setTimeout(lang.hitch(this, this._publish, this.dateRangeTextBox.getChannel('HIDE')),
				this._closeOnValueSetTimeout);

			this._emitEvt('TOOL_ACTUATED', {
				value: res.value
			});
		}
	});
});
