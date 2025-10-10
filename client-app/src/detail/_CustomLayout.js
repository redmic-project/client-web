define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/layout/widgetProvider/WidgetProvider'
], function(
	declare
	, lang
	, WidgetProvider
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

			this._onEvt('ME_OR_ANCESTOR_HIDDEN', lang.hitch(this, this._onCustomLayoutHidden));
		},

		_initialize: function() {

			this.inherited(arguments);

			this._widgetProvider = new WidgetProvider({
				parentChannel: this.getChannel()
			});
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel: this._widgetProvider.getChannel('GOT_WIDGET_CONFIG'),
				callback: '_subGotWidgetConfig'
			});
		},

		_definePublications: function() {

			this.inherited(arguments);

			this.publicationsConfig.push({
				event: 'GET_WIDGETS_CONFIG',
				channel: this._widgetProvider.getChannel('GET_WIDGETS_CONFIG')
			});
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
