define([
	'app/designs/base/_Main'
	, 'app/designs/details/Controller'
	, 'app/designs/details/Layout'
	, 'app/designs/details/_AddWidgetSelector'
	, 'app/designs/details/_AddTitle'
	, 'dojo/_base/declare'
	, 'src/detail/_DetailWidgetDefinition'
], function(
	_Main
	, Controller
	, Layout
	, _AddWidgetSelector
	, _AddTitle
	, declare
	, _DetailWidgetDefinition
) {

	return declare([Layout, Controller, _Main, _AddTitle, _AddWidgetSelector, _DetailWidgetDefinition], {
		//	summary:
		//		Base común a todas las vistas de detalle.

		_afterSetConfigurations: function() {

			this.inherited(arguments);

			this.target = [this.target];

			if (this.templateTitle) {
				this.titleWidgetConfig = this._merge([this.titleWidgetConfig || {}, {
					template: this.templateTitle
				}]);
			}

			this._infoPrepareDetailWidget();
		},

		_infoPrepareDetailWidget: function() {

			const configProps = {
				template: this.templateInfo,
				target: this.infoTarget || this.target,
				associatedIds: [this.ownChannel],
				shownOption: this.shownOptionInfo
			};

			const info = this._merge([this._getInfoConfig(configProps), {
				width: 3,
				height: 'fitContent'
			}]);

			this.widgetConfigs = this._merge([this.widgetConfigs || {}, {info}]);
		},

		addTargetToArray: function(/*string*/ target) {

			if (!this.target) {
				this.target = [];
			}

			if (typeof this.target === 'string') {
				this.target = [this.target];
			}

			if (target?.length && this.target instanceof Array && !this.target.includes(target)) {
				this.target.push(target);
			}
		},

		_clearModules: function() {

			this._publish(this._getWidgetInstance('info').getChannel('CLEAR'));
		},

		_refreshModules: function() {

			this._checkPathVariableId();
			this._showWidgets();
			this._getMainTargetData();
		},

		_checkPathVariableId: function() {

			if (!this.pathVariableId) {
				this._goTo404();
			}
		},

		_showWidgets: function() {

			this._showWidget('info');
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
