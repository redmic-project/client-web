define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'put-selector'
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
				widgetSelectorClass: 'detailWidgetSelector',
				_restoreTransitionWithSelectorTimeout: 2000
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_addWidget', lang.hitch(this, this._afterAddWidgetUpdateSelector));
			aspect.after(this, '_removeWidgetNode', lang.hitch(this, this._afterRemoveWidgetNodeUpdateSelector));
			aspect.after(this, '_addDataInTitle', lang.hitch(this, this._afterAddDataInTitleShowSelector));
			aspect.after(this, '_onLayoutComplete', lang.hitch(this, this._afterLayoutCompleteApplyAnchor));
			aspect.before(this, '_prepareRestorePackeryTransitionDuration',
				lang.hitch(this, this._beforePrepareRestoreTransitionUpdateTimeout));
			aspect.after(this, '_onControllerMeOrAncestorShown',
				lang.hitch(this, this._afterControllerOrAncestorShownUpdateSelectorInstance));
		},

		_afterAddWidgetUpdateSelector: function(retValue, params) {

			this._addWidgetToSelector(params[0]);
		},

		_afterRemoveWidgetNodeUpdateSelector: function(retValue, params) {

			this._removeWidgetFromSelector(params[0]);
		},

		_afterAddDataInTitleShowSelector: function() {

			this._showWidgetSelector();
		},

		_beforePrepareRestoreTransitionUpdateTimeout: function() {

			if (!globalThis.location.hash || this._restoreTransitionTimeoutUpdated) {
				return;
			}

			this._restoreTransitionTimeout = this._restoreTransitionWithSelectorTimeout;
			this._restoreTransitionTimeoutUpdated = true;
		},

		_afterLayoutCompleteApplyAnchor: function() {

			this._applyCurrentAnchor();
		},

		_afterControllerOrAncestorShownUpdateSelectorInstance: function() {

			this._addWidgetsToSelector();
		},

		_applyHrefValueWithoutHistory: function(hrefValue) {

			globalThis.history.replaceState(null, null, hrefValue);
		},

		_getHrefWithoutHashValue: function() {

			return globalThis.location.origin + globalThis.location.pathname + globalThis.location.search;
		},

		_applyCurrentAnchor: function() {

			var hash = globalThis.location.hash;

			if (!hash || !this._widgetSelector) {
				return;
			}

			this._publish(this._widgetSelector.getChannel('SET_VALUE'), {
				name: hash.substring(1)
			});
		},

		_addWidgetsToSelector: function() {

			if (this._widgetSelector) {
				this._publish(this._widgetSelector.getChannel('DESTROY'));
			}

			this._widgetKeys = Object.keys(this._widgets);

			this._widgetSelector = new SelectImpl({
				parentChannel: this.getChannel(),
				includeEmptyValue: true,
				emptyValueLabel: '<i>' + this.i18n.noFixedContent + '</i>'
			});

			this._setWidgetKeysAsSelectorOptions();

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

			this._setWidgetKeysAsSelectorOptions();
		},

		_removeWidgetFromSelector: function(key) {

			var keyIndex = this._widgetKeys.indexOf(key);
			this._widgetKeys.splice(keyIndex, 1);

			this._setWidgetKeysAsSelectorOptions();
		},

		_setWidgetKeysAsSelectorOptions: function() {

			var selectorOptions = this._widgetKeys.map(lang.hitch(this, this._getWidgetOptionObject));

			this._publish(this._widgetSelector.getChannel('SET_OPTIONS'), {
				options: selectorOptions
			});
		},

		_getWidgetOptionObject: function(widgetKey) {

			var widgetInstance = this._getWidgetInstance(widgetKey),
				widgetLabel = (widgetInstance && widgetInstance.get('windowTitle')) || this.i18n[widgetKey];

			return {
				value: widgetKey,
				label: widgetLabel || widgetKey
			};
		},

		_onWidgetSelectorValueChanged: function(res) {

			var value = res.value,
				newHref = this._getHrefWithoutHashValue();

			if (!value) {
				this._applyHrefValueWithoutHistory(newHref);
				return;
			}

			var newAnchor = '#' + value;

			this._applyHrefValueWithoutHistory(newHref + newAnchor);

			var contentSelectedElement = globalThis.document.querySelector(newAnchor);

			if (!contentSelectedElement) {
				console.warn('Tried to focus non-existant content:', newAnchor);
				return;
			}

			contentSelectedElement.scrollIntoView({
				behavior: 'smooth'
			});
		}
	});
});
