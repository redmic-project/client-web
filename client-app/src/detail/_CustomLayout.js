define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
], function(
	declare
	, lang
	, Deferred
) {

	return declare(null, {
		//	summary:
		//		Aplicación de componentes adicionales para la vista detalle de Activity, en función del tipo de layout
		//		establecido según su identificador. Si no está establecido, se decide según su categoría.

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

			this._getWidgetsConfigHandler = this._onceEvt('GET_WIDGETS_CONFIG', (obj) => this._onGetWidgetsConfig(obj));
			this._onEvt('ME_OR_ANCESTOR_HIDDEN', lang.hitch(this, this._onCustomLayoutHidden));
		},

		_initialize: function() {

			this.inherited(arguments);

			const dfd = new Deferred();

			require(['src/component/layout/widgetProvider/WidgetProvider'],
				(WidgetProvider) => this._onWidgetProviderRequired(WidgetProvider, dfd));

			this._widgetProviderDfd = dfd;

			return dfd;
		},

		_onGetWidgetsConfig: function(obj) {

			if (this._widgetProviderDfd && !this._widgetProviderDfd.isFulfilled()) {
				this._widgetProviderDfd.then(() => this._emitEvt('GET_WIDGETS_CONFIG', obj));
				return;
			}

			console.error('WidgetProvider component not available, failed to get widgets configuration!');
		},

		_onWidgetProviderRequired: function(WidgetProvider, dfd) {

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

			this._getWidgetsConfigHandler?.remove?.();

			dfd.resolve();
		},

		_subGotWidgetConfig: function(res) {

			const widgetConfig = res.widgetConfig;

			this._addLayoutWidget(widgetConfig.key, widgetConfig.config);
		},

		_addLayoutWidget: function(key, config) {

			if (this._layoutWidgets?.includes(key)) {
				console.error('Tried to add duplicated widget "%s" at component "%s"', key, this.getChannel());
				return;
			}

			this._addWidget(key, config);
			this._layoutWidgets.push(key);
		},

		_onCustomLayoutHidden: function() {

			this._removeLayoutWidgets();
		},

		_removeLayoutWidgets: function() {

			if (!this._layoutWidgets) {
				return;
			}

			while (this._layoutWidgets.length) {
				const key = this._layoutWidgets.pop();
				this._destroyWidget(key);
			}
		}
	});
});
