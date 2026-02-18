define([
	"dojo/_base/declare"
	, "dijit/_WidgetBase"
	, "dojo/_base/lang"
	, "dojo/Evented"
	, 'put-selector'
	, "dojo/dom-attr"
	, "dojo/dom-geometry"
], function(
	declare
	, _WidgetBase
	, lang
	, Evented
	, put
	, domAttr
	, domGeom
) {

	return declare([_WidgetBase, Evented], {

		"class": "containerTextSearch",

		constructor: function(args){

			this.config = {
				itemLabel: null,
				focusIn: -1,
				lastSearch: '',
				originalValue: '',
				suggestFields: null,
				sizeSuggets: null,
				hiddenClass: 'hidden',
				innerButtonsContainerClass: 'innerButtons',
				outerButtonsContainerClass: 'outerButtons',
				removeTextButtonClass: 'clearTextButton',
				expandSearchButtonClass: 'expandSearchButton',
				searchButtonClass: 'searchButton',
				suggestionsShownClass: 'suggestionsShown',
				showExpandIcon: false,
				events: {
					SEARCH_CHANGED: "searchChanged",
					NEW_SEARCH: "newSearch",
					CHANGE_SEARCH_PARAMS: "changeSearchParams",
					REQUEST: "request",
					REQUEST_SUGGESTS: "requestSuggests",
					RECEIVED_SUGGESTS: "receivedSuggests",
					CLOSE: "close",
					CLOSED: "closed",
					RESET: "reset",
					SET_DEFAULT: "setDefault",
					EXECUTE: "execute",
					REFRESH: "refresh",
					EXPAND_SEARCH: 'expandSearch'
				}
			};

			lang.mixin(this, this.config, args);

			this.on(this.events.SEARCH_CHANGED, this._requestSuggestions);
			this.on(this.events.RECEIVED_SUGGESTS, this._addSuggestions);
			this.on(this.events.CLOSE, this._closeSuggestion);
			this.on(this.events.RESET, this._reset);
			this.on(this.events.SET_DEFAULT, this.setValue);
			this.on(this.events.EXECUTE, this._execute);
			this.on(this.events.REFRESH, this._refresh);
		},

		postCreate: function() {

			this.domNode.removeAttribute('widgetId');

			this.inherited(arguments);

			if (this.optionActive) {
				this._createOption();
			}

			this._createTextSearch();
			this._createInnerButtons();
			this._createOuterButtons();
		},

		_createTextSearch: function() {

			this.textSearchNode = put(this.domNode, "div.textSearch");
			this.inputNode = put(this.textSearchNode, "input[type=search]");

			this.inputNode.onkeyup = lang.hitch(this, this._eventChangeText);
		},

		_createInnerButtons: function() {

			var innerButtonsContainer = put(this.textSearchNode, 'div.' + this.innerButtonsContainerClass);

			this.removeTextNode = put(innerButtonsContainer, 'i.' + this.removeTextButtonClass + '.' +
				this.hiddenClass + '[title=' + this.i18n.remove + ']');

			this.removeTextNode.onclick = lang.hitch(this, this._removeText);
		},

		_createOuterButtons: function() {

			var outerButtonsContainer = put(this.domNode, 'div.' + this.outerButtonsContainerClass),
				searchButton = put(outerButtonsContainer, 'i.' + this.searchButtonClass +
					'[title=' + this.i18n.search + ']');

			searchButton.onclick = lang.hitch(this, this._onClickSearch);

			if (this.showExpandIcon) {
				this.expandSearchNode = put(outerButtonsContainer, 'i.' + this.expandSearchButtonClass + '[title=' +
					this.i18n.advancedSearch + ']');

				this.expandSearchNode.onclick = lang.hitch(this, this._expandSearch);
			}
		},

		_inputNodeNoFocus: function() {

			setTimeout(lang.hitch(this, this._restartLastValueInput), 300);
		},

		_eventChangeText: function(e) {

			var keyCode = e.keyCode || e.which;

			if (!this._selectKeyCodeArrows(keyCode)) {
				this._selectCharCorrect(keyCode);
			}

			if (this.getValueInput().length) {
				this._activeRemoveText();
			} else {
				this._closeSuggestion();
				this._desactiveRemoveText();
				this.focusIn = -1;
			}
		},

		_selectKeyCodeArrows: function(keyCode) {

			if (keyCode === 13) {
				this._search();
			} else if (keyCode === 40) {
				this._selectNodeFocus(1);
			} else if (keyCode === 38) {
				this._selectNodeFocus(-1);
			} else {
				return false;
			}

			return true;
		},

		_selectCharCorrect: function(keyCode) {

			var patron = /[a-zA-Z0-9\s]/;
			var charSeleccionado = String.fromCharCode(keyCode);

			if ((patron.test(charSeleccionado)) || (keyCode === 46) || (keyCode === 8)) {
				this.focusIn = -1;

				clearTimeout(this.searchChangedTimeout);
				this.searchChangedTimeout = setTimeout(lang.hitch(this, this.emit,
					this.events.SEARCH_CHANGED, this.getValueInput()), 200);
			}
		},

		_removeText: function() {

			this._reset();
			this.emit(this.events.NEW_SEARCH, this.getValueInput());
		},

		_expandSearch: function() {

			if (!this.showExpandIcon) {
				return;
			}

			this.emit(this.events.EXPAND_SEARCH, {
				node: this.expandSearchNode
			});
		},

		_activeRemoveText: function() {

			put(this.removeTextNode, '!' + this.hiddenClass);
		},

		_desactiveRemoveText: function() {

			put(this.removeTextNode, '.' + this.hiddenClass);
		},

		_onClickSearch: function() {

			this._closeSuggestion();
			this._newSearch(true);
		},

		_execute: function() {

			this.lastSearch = null;

			this._search();
		},

		_search: function() {

			this._closeSuggestion();
			this._newSearch(false);
		},

		_newSearch: function(newSearch) {

			var value = this.getValueInput();

			if (newSearch || this.lastSearch !== value) {
				if (!value || value.length > 1) {
					this.lastSearch = value;
					this.emit(this.events.NEW_SEARCH, value);
				}
			}
		},

		_selectNodeFocus: function(num) {

			if (this.boxSuggestionsNode.children.length !== 0) {
				if (this.focusIn === -1) {
					this.focusIn = num === 1 ? this.boxSuggestionsNode.firstChild : this.boxSuggestionsNode.lastChild;
				} else {
					this.focusIn.onblur();

					if (num === 1 && this.boxSuggestionsNode.lastChild !== this.focusIn) {
						this.focusIn = this.focusIn.nextSibling;
					} else if (num === -1 && this.boxSuggestionsNode.firstChild != this.focusIn) {
						this.focusIn = this.focusIn.previousSibling;
					} else {
						this.focusIn = -1;
						this.setValueInput(this.originalValue);
					}
				}

				if (this.focusIn != -1) {
					this.focusIn.focus();
				}
			}
		},

		_requestSuggestions: function(textValue) {

			this.originalValue = textValue;

			if (textValue.length > 1) {
				this.emit(this.events.REQUEST_SUGGESTS, this._createQuery(textValue, this.suggestFields));
			}
		},

		_createQuery: function(text, fields) {

			var queryObj = {
				'text': text
			};

			if (fields) {
				queryObj.fields = fields;
			}

			if (this.sizeSuggets) {
				queryObj.size = this.sizeSuggets;
			}

			return queryObj;
		},

		_addSuggestions: function(/*Array*/ suggestions) {

			if (!suggestions?.length) {
				return;
			}

			this._openSuggestions();

			suggestions.forEach(suggestion => {
				const node = this._createSuggest(suggestion);
				this._listenSuggestionEvents(node);
			});
		},

		_createSuggest: function(item) {

			var spanNode = put(this.boxSuggestionsNode, "span.suggestion");
			spanNode.innerHTML = this._getLabelValue(item);
			return spanNode;
		},

		_getLabelValue: function(item) {

			if (typeof this.itemLabel === "function") {
				return this.itemLabel(item);
			}

			if (typeof this.itemLabel === "string") {
				if (this.itemLabel.indexOf("{") < 0) {
					return item[this.itemLabel];
				}

				return lang.replace(this.itemLabel, item);
			}

			return item;
		},

		_listenSuggestionEvents: function(node) {

			node.onclick = lang.hitch(this, this._selectSuggestion, node);
			node.focus = lang.hitch(this, this._selectSuggetFocus, node, true);
			node.onblur = lang.hitch(this, this._deselectSuggetFocus, node, true);
			node.onmouseover = lang.hitch(this, this._selectSuggetFocus, node, false);
			node.onmouseout = lang.hitch(this, this._deselectSuggetFocus, node, false);
		},

		_selectSuggetFocus: function(spanNode, change) {

			if (this.focusIn != -1) {
				this.focusIn.onblur();
			}

			this.focusIn = spanNode;

			if (change) {
				this.setValueInput(spanNode.textContent);
			}
		},

		_deselectSuggetFocus: function(spanNode, change) {

			if (change) {
				this.setValueInput(this.originalValue);
			}
		},

		_selectSuggestion: function(spanNode) {

			var value = spanNode.textContent;
			this.setValueInput(value);
			this.originalValue = value;
			this._closeSuggestion();

			this.emit(this.events.NEW_SEARCH, value);
		},

		_closeSuggestion: function() {

			this.focusIn = -1;
			this._hideSuggestions();

			this.emit(this.events.CLOSED);
		},

		_openSuggestions: function() {

			this._createSuggestions();

			const positionNode = domGeom.position(this.domNode);

			domAttr.set(this.boxSuggestionsNode, 'style', {
				top: (positionNode.y + positionNode.h) + 'px',
				left: positionNode.x + 'px',
				width: positionNode.w + 'px'
			});

			this._showSuggestions();
		},

		_createSuggestions: function() {

			if (this.boxSuggestionsNode) {
				this.boxSuggestionsNode.replaceChildren();
				return;
			}

			const suggestionsContainerClass = `suggestions.${this.hiddenClass}`;
			this.boxSuggestionsNode = put(this.ownerDocumentBody, `div.${suggestionsContainerClass}`);
		},

		_showSuggestions: function() {

			this.boxSuggestionsNode && put(this.boxSuggestionsNode, `!${this.hiddenClass}`);
		},

		_hideSuggestions: function() {

			this.boxSuggestionsNode && put(this.boxSuggestionsNode, `.${this.hiddenClass}`);
		},

		getValueInput: function() {

			return this.inputNode.value?.trim();
		},

		setValueInput: function(text) {

			this.inputNode.value = text;

			text = text.replace(/\"/g , '&#34;');
			text = text.replace(/\'/g , '&#39;');

			put(this.inputNode, '[value="' + text + '"]');
		},

		setValue: function(value) {

			this.setValueInput(value);
			this.lastSearch = value;
			this._closeSuggestion();

			if (!value) {
				this._desactiveRemoveText();
			}
		},

		_reset: function() {

			this.setValueInput('');
			this.lastSearch = '';
			this._closeSuggestion();
			this._desactiveRemoveText();
		},

		_refresh: function() {

			this.emit(this.events.NEW_SEARCH, this.getValueInput());
		}
	});
});
