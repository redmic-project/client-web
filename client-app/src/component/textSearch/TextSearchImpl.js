define([
	'dojo/_base/declare'
	, 'dojo/dom-class'
	, 'put-selector'
	, 'src/component/textSearch/_Request'
	, 'src/component/textSearch/_Suggestions'
	, 'src/component/textSearch/TextSearch'
], function(
	declare
	, domClass
	, put
	, _Request
	, _Suggestions
	, TextSearch
) {

	return declare(TextSearch, {
		// summary:
		//   Implementación de buscador por texto.

		postMixInProperties: function() {

			const defaultConfig = {
				class: 'containerTextSearch',
				textSearchClass: 'textSearch',
				innerButtonsContainerClass: 'innerButtons',
				outerButtonsContainerClass: 'outerButtons',
				removeTextButtonClass: 'clearTextButton',
				searchButtonClass: 'searchButton',
				hiddenClass: 'invisible'
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_initialize: function() {

			this.inherited(arguments);

			const textSearchDefinition = `div.${this.textSearchClass}`;
			this._textSearchNode = put(this.domNode, textSearchDefinition);

			this._createTextSearchInput();
			this._createInnerButtons();
			this._createOuterButtons();
		},

		_createTextSearchInput: function() {

			const textSearchInputDefinition = `input[type=search][id=${this.getOwnChannel()}]`;
			this._textSearchInput = put(this._textSearchNode, textSearchInputDefinition);
			this._textSearchInput.onkeyup = evt => this._onTextSearchKeyUp(evt);
		},

		_createInnerButtons: function() {

			const innerButtonsContainer = put(this._textSearchNode, `div.${this.innerButtonsContainerClass}`);
			this._populateInnerButtons(innerButtonsContainer);
		},

		_populateInnerButtons: function(innerButtonsContainer) {

			const removeTextDefinition = `i.${this.removeTextButtonClass}.${this.hiddenClass}
				[title=${this.i18n.remove}]`;

			this._removeTextNode = put(innerButtonsContainer, removeTextDefinition);
			this._removeTextNode.onclick = () => this._onRemoveTextClick();
		},

		_createOuterButtons: function() {

			const outerButtonsContainer = put(this.domNode, `div.${this.outerButtonsContainerClass}`);
			this._populateOuterButtons(outerButtonsContainer);
		},

		_populateOuterButtons: function(outerButtonsContainer) {

			this.inherited(arguments);

			const searchDefinition = `i.${this.searchButtonClass}[title=${this.i18n.search}]`;
			this._searchNode = put(outerButtonsContainer, searchDefinition);
			this._searchNode.onclick = evt => this._onSearchClick(evt);
		},

		_onSearchClick: function(evt) {

			this.inherited(arguments);

			this._emitSearchEvent(this._getTextSearchInputValue());
		},

		_onTextSearchKeyUp: function(evt) {

			this.inherited(arguments);

			const evtCode = evt.code,
				inputValue = this._getTextSearchInputValue(evt);

			if (evtCode === 'Enter') {
				this._emitSearchEvent(inputValue);
				return;
			}

			if (inputValue.length) {
				this._showRemoveTextNode();
			} else {
				this._hideRemoveTextNode();
			}
		},

		_onRemoveTextClick: function() {

			this._reset();
		},

		_getTextSearchInputValue: function(/*Event?*/ evt) {

			const input = evt ? evt.target : this._textSearchInput;
			return input?.value?.trim() ?? '';
		},

		_setTextSearchInputValue: function(value) {

			this._textSearchInput.value = value;
		},

		_showRemoveTextNode: function() {

			domClass.remove(this._removeTextNode, this.hiddenClass);
		},

		_hideRemoveTextNode: function() {

			domClass.add(this._removeTextNode, this.hiddenClass);
		},

		_emitSearchEvent: function(value) {

			if (this._lastSearchInputValue === value || (!value?.length && !this._lastSearchInputValue)) {
				return;
			}

			this._lastSearchInputValue = value;

			this._emitEvt('SEARCH', {value});
		},

		_refresh: function() {

			this.inherited(arguments);

			this._emitSearchEvent(this._getTextSearchInputValue());
		},

		_reset: function() {

			this.inherited(arguments);

			this._setTextSearchInputValue('');

			this._hideRemoveTextNode();
			this._emitSearchEvent('');
		}
	});
});
