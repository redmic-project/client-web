define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'put-selector/put'
	, 'src/component/form/input/SelectImpl'
], function (
	declare
	, lang
	, aspect
	, put
	, SelectImpl
) {

	return declare(null, {
		//	summary:
		//		Extensión para añadir un componente selector de widget a enfocar

		constructor: function(args) {

			this.config = {
				_widgetSelector: null,
				widgetSelectorClass: 'detailWidgetSelector'
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_generateWidgets', lang.hitch(this, this._afterGenerateWidgetsAddSelector));
			aspect.after(this, '_addWidget', lang.hitch(this, this._afterAddWidgetUpdateSelector));
			aspect.after(this, '_addDataInTitle', lang.hitch(this, this._afterAddDataInTitleShowSelector));
			aspect.after(this, '_onLayoutComplete', lang.hitch(this, this._afterLayoutCompleteApplyAnchor));
			aspect.after(this, '_onControllerMeOrAncestorShown',
				lang.hitch(this, this._afterControllerOrAncestorShownUpdateSelectorInstance));
		},

		_afterGenerateWidgetsAddSelector: function() {

			this._addWidgetsToSelector();
		},

		_afterAddWidgetUpdateSelector: function(retValue, params) {

			this._addWidgetToSelector(params[0]);
		},

		_afterAddDataInTitleShowSelector: function() {

			this._showWidgetSelector();
		},

		_afterLayoutCompleteApplyAnchor: function() {

			this._applyCurrentAnchor();
		},

		_afterControllerOrAncestorShownUpdateSelectorInstance: function() {

			this._addWidgetsToSelector();
		},

		_applyCurrentAnchor: function() {

			if (!location.hash) {
				return;
			}

			var hash = location.hash;
			location.hash = '';
			location.hash = hash;
		},

		_addWidgetsToSelector: function() {

			if (this._widgetSelector) {
				this._publish(this._widgetSelector.getChannel('DESTROY'));
			}

			this._widgetKeys = Object.keys(this._widgets);

			this._widgetSelector = new SelectImpl({
				parentChannel: this.getChannel(),
				includeEmptyValue: false,
				_inputProps: {
					options: this._widgetKeys
				}
			});

			this._setSubscription({
				channel: this._widgetSelector.getChannel('VALUE_CHANGED'),
				callback: lang.hitch(this, this._onWidgetSelectorValueChanged)
			});

			if (this._getPreviouslyShown()) {
				this._showWidgetSelector();
			}
		},

		_showWidgetSelector: function() {

			if (!this._titleLeftNode) {
				return;
			}

			if (!this._widgetSelectorNode) {
				this._widgetSelectorNode = put('div.' + this.widgetSelectorClass);
			}

			put(this._titleLeftNode, this._widgetSelectorNode);

			this._publish(this._widgetSelector.getChannel('SHOW'), {
				node: this._widgetSelectorNode
			});
		},

		_addWidgetToSelector: function(key) {

			this._widgetKeys.push(key);

			this._publish(this._widgetSelector.getChannel('SET_OPTIONS'), {
				options: this._widgetKeys
			});
		},

		_onWidgetSelectorValueChanged: function(res) {

			var value = res.value || '';

			location.href = '#' + value;
		}
	});
});
