define([
	"dojo/_base/declare"
	, "dijit/_WidgetBase"
	, "dojo/_base/lang"
	, "dojo/Evented"
	, "put-selector/put"
	, "dojo/dom-attr"
	, "dojo/dom-construct"
	, "dojo/dom-geometry"
	, "dojo/query"
], function(
	declare
	, _WidgetBase
	, lang
	, Evented
	, put
	, domAttr
	, domConstruct
	, domGeom
	, query
) {
	var cleanSpace = function(text) {
		return text && text.trim();
	};

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
				suggestionsContainerClass: 'suggestions',
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
				},
				createQuery: function(text, fields) {

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

		_createSuggestions: function() {

			var suggestionsNodeExists = query('div.' + this.suggestionsContainerClass, this.ownerDocumentBody);

			if (suggestionsNodeExists.length !== 0) {
				this.boxSuggestionsNode = suggestionsNodeExists[0];
			} else {
				this.boxSuggestionsNode = put(this.ownerDocumentBody, 'div.' + this.suggestionsContainerClass);
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

			if (cleanSpace(this.getValueInput()).length !== 0) {
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
					this.events.SEARCH_CHANGED, cleanSpace(this.getValueInput())), 200);
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

			var value = this.getValueInput().trim();

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
			//Solicitar las sugerencias

			if (textValue.length > 1) {
				this.emit(this.events.REQUEST_SUGGESTS, this.createQuery(textValue, this.suggestFields));
			}
		},

		_addSuggestions: function(/*JSON*/ suggestions) {

			this._openSuggestion();

			var tamSuggets = suggestions.length;
			for (var i = 0; i < tamSuggets; i++){
				var node = this._createSuggest(suggestions[i]);
				this._addEventsSugget(node);
			}

			if (tamSuggets === 0) {
				this._closeSuggestion();
			}
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

		_addEventsSugget: function(spanNode) {

			spanNode.onclick = lang.hitch(this, this._selectSuggestion, spanNode);
			spanNode.focus = lang.hitch(this, this._selectSuggetFocus, spanNode, true);
			spanNode.onblur = lang.hitch(this, this._deselectSuggetFocus, spanNode, true);
			spanNode.onmouseover = lang.hitch(this, this._selectSuggetFocus, spanNode, false);
			spanNode.onmouseout = lang.hitch(this, this._deselectSuggetFocus, spanNode, false);
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

		_cleanChildrenNode: function(node) {

			domConstruct.destroy(node);
		},

		_closeSuggestion: function() {

			this.focusIn = -1;
			this._cleanChildrenNode(this.boxSuggestionsNode);
			put(this.domNode, '!' + this.suggestionsShownClass);

			this.emit(this.events.CLOSED);
		},

		_openSuggestion: function() {

			this._cleanChildrenNode(this.boxSuggestionsNode);
			this._createSuggestions();

			var positionNode = domGeom.position(this.domNode);
			var obj = {
				top: (positionNode.y + positionNode.h) + 'px',
				left: positionNode.x + 'px',
				width: positionNode.w + 'px'
			};
			domAttr.set(this.boxSuggestionsNode, 'style', obj);

			put(this.domNode, '.' + this.suggestionsShownClass);
		},

		getValueInput: function() {

			return this.inputNode.value;
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

		setI18n: function(i18n){

			this.i18n = i18n;
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
