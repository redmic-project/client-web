define([
	'dojo/_base/declare'
	, 'dojo/Deferred'
], function(
	declare
	, Deferred
) {

	return declare(null, {
		// summary:
		//   Base para vistas detalle personalizables con widgets provistos por el componente WidgetProvider.

		postMixInProperties: function() {

			const defaultConfig = {
				events: {
					GET_WIDGETS_CONFIG: 'getWidgetsConfig'
				},
				actions: {
				},
				_layoutWidgets: []
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._getWidgetsConfigHandler = this._onceEvt('GET_WIDGETS_CONFIG', obj => this._onGetWidgetsConfig(obj));
			this._onEvt('ME_OR_ANCESTOR_HIDDEN', () => this._onCustomLayoutHidden());
		},

		_initialize: function() {

			this.inherited(arguments);

			this._widgetProviderDfd = new Deferred();

			require(['src/component/layout/widgetProvider/WidgetProvider'],
				WidgetProvider => this._onWidgetProviderRequired(WidgetProvider));

			return this._widgetProviderDfd;
		},

		_onGetWidgetsConfig: function(obj) {

			if (this._widgetProviderDfd && !this._widgetProviderDfd.isFulfilled()) {
				this._widgetProviderDfd.then(() => this._emitEvt('GET_WIDGETS_CONFIG', obj));
				return;
			}

			console.error('WidgetProvider component not available, failed to get widgets configuration!');
		},

		_onWidgetProviderRequired: function(WidgetProvider) {

			this._widgetProvider = new WidgetProvider({
				parentChannel: this.getChannel()
			});

			this._setSubscription({
				channel: this._widgetProvider.getChannel('GOT_WIDGET_CONFIG'),
				callback: '_subGotWidgetConfig'
			});

			this._setPublication({
				event: 'GET_WIDGETS_CONFIG',
				channel: this._widgetProvider.getChannel('GET_WIDGETS_CONFIG')
			});

			this._getWidgetsConfigHandler?.remove();

			this._widgetProviderDfd.resolve();
		},

		_subGotWidgetConfig: function(res) {

			const widgetConfig = res.widgetConfig;

			this._addLayoutWidget(widgetConfig.key, widgetConfig.config);
		},

		_addLayoutWidget: function(key, config) {

			if (this._layoutWidgets.includes(key)) {
				console.error('Tried to add duplicated widget "%s" at component "%s"', key, this.getChannel());
				return;
			}

			this._layoutWidgets.push(key);
			this._addWidget(key, config);
		},

		_onCustomLayoutHidden: function() {

			this._removeLayoutWidgets();
		},

		_removeLayoutWidgets: function() {

			while (this._layoutWidgets.length) {
				const key = this._layoutWidgets.pop();
				this._destroyWidget(key);
			}
		}
	});
});
