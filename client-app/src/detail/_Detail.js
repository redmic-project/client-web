define([
	'app/designs/base/_Main'
	, 'app/designs/details/Controller'
	, 'app/designs/details/Layout'
	, 'app/designs/details/_AddWidgetSelector'
	, 'app/designs/details/_AddTitle'
	, 'dojo/_base/declare'
	, 'src/detail/_WidgetDefinition'
], function(
	_Main
	, Controller
	, Layout
	, _AddWidgetSelector
	, _AddTitle
	, declare
	, _WidgetDefinition
) {

	return declare([Layout, Controller, _Main, _AddTitle, _AddWidgetSelector, _WidgetDefinition], {
		//	summary:
		//		Base común a todas las vistas de detalle.

		_setMainConfigurations: function() {

			this.target = [this.target];

			if (this.templateTitle) {
				this.titleWidgetConfig = this._merge([{
					template: this.templateTitle
				}, this.titleWidgetConfig || {}]);
			}

			this.widgetConfigs = this._merge([{
				info: this._getInfoConfig({
					template: this.templateInfo,
					target: this.target[0]
				})
			}, this.widgetConfigs || {}]);
		},

		_clearModules: function() {

			this._publish(this._getWidgetInstance('info').getChannel('CLEAR'));
		},

		_refreshModules: function() {

			this._checkPathVariableId();
			this._getMainTargetData();
		},

		_checkPathVariableId: function() {

			if (!this.pathVariableId) {
				this._goTo404();
			}
		},

		_getMainTargetData: function() {

			this._emitEvt('GET', {
				target: this.target[0],
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});
		},

		_itemAvailable: function(res, resWrapper) {

			this.inherited(arguments);

			if (this.target instanceof Array && this.target[0] !== resWrapper.target) {
				return;
			}

			this._putMetaTags(res.data);
		},

		_putMetaTags: function(data) {

			if (!this.metaTags || !data) {
				return;
			}

			this._emitEvt('PUT_META_TAGS', {
				view: this.getOwnChannel(),
				data: data
			});
		}
	});
});
