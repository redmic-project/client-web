define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/dom-attr'
	, 'dojo/dom-class'
	, 'put-selector'
	, 'src/component/base/_Store'
], function(
	declare
	, lang
	, domAttr
	, domClass
	, put
	, _Store
) {

	return declare(_Store, {
		// summary:
		//   Extensión de buscador por texto para gestionar la lógica y representación de sugerencias.

		postMixInProperties: function() {

			const defaultConfig = {
				suggestionsContainerClass: 'suggestions',
				suggestionItemClass: 'suggestion',
				suggestionHighlightedClass: 'highlighted',

				suggestionsRequestMethod: 'GET',
				suggestionsTargetSuffix: 'suggestions',

				itemLabel: null,
				requestSuggestionsTimeout: 300
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._textSearchInput.onfocus = evt => this._onTextSearchFocus(evt);
		},

		_onTextSearchKeyUp: function(evt) {

			this.inherited(arguments);

			const evtCode = evt.code;
			if (evtCode === 'ArrowDown') {
				this._highlightNextSuggestion();
				return;
			} else if (evtCode === 'ArrowUp') {
				this._highlightPrevSuggestion();
				return;
			} else if (evtCode === 'Enter') {
				this._closeSuggestionsContainer();
				return;
			}

			const inputValue = this._getTextSearchInputValue(evt),
				valueHasChanged = this._lastSuggestionsInputValue !== inputValue;

			this._lastSuggestionsInputValue = inputValue;

			if (inputValue.length < 2) {
				this._closeSuggestionsContainer();
				this._clearSuggestionsContainer();
				return;
			}

			if (!valueHasChanged) {
				return;
			}

			this._prepareSuggestionsRequest(inputValue);
		},

		_highlightNextSuggestion: function() {

			const defaultSibling = 'firstChild',
				desiredSibling = 'nextSibling';

			this._highlightOnDesiredSuggestion(defaultSibling, desiredSibling);
		},

		_highlightPrevSuggestion: function() {

			const defaultSibling = 'lastChild',
				desiredSibling = 'previousSibling';

			this._highlightOnDesiredSuggestion(defaultSibling, desiredSibling);
		},

		_highlightOnDesiredSuggestion: function(/*String*/ defaultSibling, /*String*/ desiredSibling) {

			if (!this._suggestionsContainer.hasChildNodes()) {
				return;
			}

			if (!this._lastSuggestionHighlighted) {
				this._lastSuggestionHighlighted = this._suggestionsContainer[defaultSibling];
			} else {
				this._unhighlightSuggestion(this._lastSuggestionHighlighted);

				const limitSibling = defaultSibling === 'firstChild' ? 'lastChild' : 'firstChild';
				if (this._lastSuggestionHighlighted !== this._suggestionsContainer[limitSibling]) {
					this._lastSuggestionHighlighted = this._lastSuggestionHighlighted[desiredSibling];
				} else {
					this._lastSuggestionHighlighted = null;
					this._setTextSearchInputValue(this._originalValue);
				}
			}

			this._highlightSuggestion(this._lastSuggestionHighlighted);
		},

		_prepareSuggestionsRequest: function(/*String*/ value) {

			clearTimeout(this._requestSuggestionsTimeoutHandler);
			this._requestSuggestionsTimeoutHandler = setTimeout(() => this._requestSuggestions(value),
				this.requestSuggestionsTimeout);
		},

		_requestSuggestions: function(/*String*/ value) {

			this._originalValue = value;

			this._emitEvt('REQUEST', {
				method: this.suggestionsRequestMethod,
				target: `${this._getTarget()}/${this.suggestionsTargetSuffix}`,
				requesterId: this.getOwnChannel(),
				params: this._createSuggestionsRequestParams(value)
			});
		},

		_createSuggestionsRequestParams: function(value) {

			const path = {
				id: this.id
			};

			const query = {
				text: value,
				fields: this.suggestFields,
				highlightFields: this.highlightField
			};

			return {path, query};
		},

		_targetIsMine: function(target) {

			return this.inherited(arguments) || this._suggestionsTargetIsMine(target);
		},

		_suggestionsTargetIsMine: function(target) {

			return `${this._getTarget()}/${this.suggestionsTargetSuffix}` === target;
		},

		_dataAvailable: function(res, resWrapper) {

			if (resWrapper.requesterId !== this.getOwnChannel()) {
				return;
			}

			this._addReceivedSuggestions(res.data);
		},

		_addReceivedSuggestions: function(/*Array*/ suggestions) {

			if (!suggestions?.length) {
				this._closeSuggestionsContainer();
				return;
			}

			this._prepareSuggestionsContainer();

			suggestions.forEach(suggestion => this._createSuggestionNode(suggestion));

			this._showSuggestionsContainer();
		},

		_prepareSuggestionsContainer: function() {

			this._createSuggestionsContainer();
			this._placeSuggestionsContainer();
		},

		_createSuggestionsContainer: function() {

			if (this._suggestionsContainer) {
				this._clearSuggestionsContainer();
				this._globalClicksHandler.resume();
				this._enableGlobalScrollListener();
				return;
			}

			const suggestionsContainerDefinition = `div.${this.suggestionsContainerClass}.${this.hiddenClass}`;
			this._suggestionsContainer = put(this.ownerDocumentBody, suggestionsContainerDefinition);

			this._globalClicksHandler = this._listenGlobalClicks(evt => this._onGlobalClickEvent(evt));
			this._enableGlobalScrollListener();
		},

		_clearSuggestionsContainer: function() {

			this._suggestionsContainer?.replaceChildren();
			clearTimeout(this._requestSuggestionsTimeoutHandler);
		},

		_enableGlobalScrollListener: function() {

			!this._globalScrollListenerEnabled && this._setGlobalScrollListener(true);
		},

		_disableGlobalScrollListener: function() {

			this._globalScrollListenerEnabled && this._setGlobalScrollListener(false);
		},

		_setGlobalScrollListener: function(/*Boolean?*/ enable) {

			if (!this._suggestionsScrollCallback) {
				this._suggestionsScrollCallback = evt => this._onGlobalScrollEvent(evt);
			}

			const listenerMethod = enable ? 'addEventListener' : 'removeEventListener';
			this.ownerDocumentBody[listenerMethod]('scroll', this._suggestionsScrollCallback, {
				passive: true,
				capture: true
			});

			this._globalScrollListenerEnabled = enable;
		},

		_placeSuggestionsContainer: function() {

			const referenceBounds = this.domNode.getBoundingClientRect(),
				top = `${referenceBounds.bottom}px`,
				left = `${referenceBounds.left}px`,
				width = `${referenceBounds.width}px`;

			domAttr.set(this._suggestionsContainer, 'style', {top, left, width});
		},

		_createSuggestionNode: function(item) {

			const suggestionNode = put(this._suggestionsContainer, `span.${this.suggestionItemClass}`);

			suggestionNode.innerHTML = this._getSuggestionLabel(item);
			suggestionNode.onclick = evt => this._onSuggestionSelected(evt);
		},

		_getSuggestionLabel: function(item) {

			if (typeof this.itemLabel === 'function') {
				return this.itemLabel(item);
			}

			if (typeof this.itemLabel !== 'string') {
				return item;
			}

			if (this.itemLabel.includes('{')) {
				return lang.replace(this.itemLabel, item);
			}

			return item[this.itemLabel];
		},

		_highlightSuggestion: function(suggestionNode) {

			if (!suggestionNode) {
				return;
			}

			domClass.add(suggestionNode, this.suggestionHighlightedClass);

			this._setTextSearchInputValue(suggestionNode.textContent);
		},

		_unhighlightSuggestion: function(suggestionNode) {

			if (!suggestionNode) {
				return;
			}

			domClass.remove(suggestionNode, this.suggestionHighlightedClass);

			this._setTextSearchInputValue(this._originalValue);
		},

		_openSuggestionsContainer: function() {

			if (!this._suggestionsContainer) {
				return;
			}

			this._globalClicksHandler.resume();
			this._enableGlobalScrollListener();
			this._placeSuggestionsContainer();
			this._showSuggestionsContainer();
		},

		_closeSuggestionsContainer: function() {

			if (!this._suggestionsContainer) {
				return;
			}

			this._hideSuggestionsContainer();
			this._globalClicksHandler.pause();
			this._disableGlobalScrollListener();
			this._lastSuggestionHighlighted = null;
		},

		_showSuggestionsContainer: function() {

			domClass.remove(this._suggestionsContainer, this.hiddenClass);
		},

		_hideSuggestionsContainer: function() {

			domClass.add(this._suggestionsContainer, this.hiddenClass);
		},

		_onGlobalClickEvent: function(evt) {

			const clickedOnTextSearch = this._checkClickBelongsToNode(evt, this.domNode);
			const clickedOnSuggestions = this._checkClickBelongsToNode(evt, this._suggestionsContainer);

			if (clickedOnTextSearch || clickedOnSuggestions) {
				return;
			}

			this._closeSuggestionsContainer();
		},

		_onGlobalScrollEvent: function(evt) {

			this._closeSuggestionsContainer();
		},

		_onTextSearchFocus: function(evt) {

			this._openSuggestionsContainer();
		},

		_onSearchClick: function() {

			this.inherited(arguments);

			this._closeSuggestionsContainer();
		},

		_onSuggestionSelected: function(evt) {

			const suggestionValue = evt.target.textContent;

			this._setTextSearchInputValue(suggestionValue);
			this._originalValue = suggestionValue;
			this._closeSuggestionsContainer();

			this._emitSearchEvent(suggestionValue);
		},

		_reset: function() {

			this.inherited(arguments);

			this._closeSuggestionsContainer();
			this._clearSuggestionsContainer();
		}
	});
});
