define([
	'dojo/_base/declare'
	, 'put-selector'
	, 'src/component/form/input/SelectImpl'
], function (
	declare
	, put
	, SelectImpl
) {

	return declare(null, {
		// summary:
		//   Extensión para añadir un componente selector de widget a enfocar.

		postMixInProperties: function() {

			const defaultConfig = {
				widgetSelectorClass: 'detailWidgetSelector',
				_widgetSelector: null,
				_widgetsShown: {},
				_applyAnchorTimeout: 500
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_buildVisualization: function() {

			this._generateWidgetKeys();

			return this.inherited(arguments);
		},

		_showWidget: function(widgetKey) {

			const originalRet = this.inherited(arguments);

			this._addWidgetToSelector(widgetKey);

			return originalRet;
		},

		_hideWidget: function(widgetKey) {

			this.inherited(arguments);

			this._removeWidgetFromSelector(widgetKey);
		},

		_onWidgetHidden: function(widgetKey) {

			this.inherited(arguments);

			this._removeWidgetFromSelector(widgetKey);
		},

		_destroyWidget: function(widgetKey) {

			this.inherited(arguments);

			this._removeWidgetFromSelector(widgetKey);
		},

		_addDataInTitle: function() {

			this.inherited(arguments);

			this._showWidgetSelector();
		},

		_addWidget: function() {

			this.inherited(arguments);

			this._applyCurrentAnchorOnLayoutChange();
		},

		_onLayoutComplete: function() {

			this.inherited(arguments);

			this._applyCurrentAnchorOnLayoutChange();
		},

		_applyCurrentAnchorOnLayoutChange: function() {

			const hash = globalThis.location.hash;
			if (!hash || !this._widgetSelector) {
				return;
			}

			clearTimeout(this._applyAnchorTimeoutId);
			this._applyAnchorTimeoutId = setTimeout(() => this._applyAnchor(hash), this._applyAnchorTimeout);
		},

		_onControllerMeOrAncestorShown: function() {

			this.inherited(arguments);

			this._addWidgetsToSelector();
		},

		_applyHrefValueWithoutHistory: function(hrefValue) {

			globalThis.history.replaceState(null, null, hrefValue);
		},

		_getHrefWithoutHashValue: function() {

			const locationObj = globalThis.location;
			return locationObj.origin + locationObj.pathname + locationObj.search;
		},

		_applyAnchor: function(hash) {

			this._publish(this._widgetSelector.getChannel('SET_VALUE'), {
				name: hash.substring(1)
			});
		},

		_addWidgetsToSelector: function() {

			if (this._widgetSelector) {
				this._publish(this._widgetSelector.getChannel('DESTROY'));
			}

			this._widgetSelector = new SelectImpl({
				parentChannel: this.getChannel(),
				includeEmptyValue: true,
				emptyValueLabel: '<i>' + this.i18n.noFixedContent + '</i>'
			});

			this._setWidgetKeysAsSelectorOptions();

			this._setSubscription({
				channel: this._widgetSelector.getChannel('VALUE_CHANGED'),
				callback: '_subWidgetSelectorValueChanged'
			});

			if (this._getPreviouslyShown()) {
				this._showWidgetSelector();
			}
		},

		_generateWidgetKeys: function() {

			this._widgetKeys = Object.keys(this._widgets);

			this._widgetKeys.forEach(key => this._widgetsShown[key] = !this.widgetConfigs[key]?.hidden);
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

			if (!this._widgetKeys.includes(key)) {
				this._widgetKeys.push(key);
			}

			this._widgetsShown[key] = true;

			this._setWidgetKeysAsSelectorOptions();
		},

		_removeWidgetFromSelector: function(key) {

			if (!this._widgetKeys.includes(key)) {
				return;
			}

			this._widgetsShown[key] = false;

			this._setWidgetKeysAsSelectorOptions();
		},

		_setWidgetKeysAsSelectorOptions: function() {

			if (!this._widgetSelector) {
				return;
			}

			const options = this._widgetKeys
				.filter(key => this._widgetsShown[key])
				.map(key => this._getWidgetOptionObject(key));

			this._publish(this._widgetSelector.getChannel('SET_OPTIONS'), { options });
		},

		_getWidgetOptionObject: function(widgetKey) {

			const widgetInstance = this._getWidgetInstance(widgetKey),
				widgetLabel = widgetInstance?.get('windowTitle') ?? this.i18n[widgetKey] ?? widgetKey;

			return {
				value: widgetKey,
				label: widgetLabel
			};
		},

		_subWidgetSelectorValueChanged: function(res) {

			const value = res.value,
				newHref = this._getHrefWithoutHashValue();

			if (!value) {
				this._applyHrefValueWithoutHistory(newHref);
				return;
			}

			const newAnchor = `#${value}`;

			this._applyHrefValueWithoutHistory(newHref + newAnchor);
			this._findWidgetElement(newAnchor);
		},

		_findWidgetElement: function(anchor) {

			const contentSelectedElement = globalThis.document.querySelector(anchor);

			if (!contentSelectedElement) {
				console.warn('Tried to focus non-existant content:', anchor);
				return;
			}

			contentSelectedElement.scrollIntoView({
				behavior: 'smooth'
			});
		}
	});
});
