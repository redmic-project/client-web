define([
	"dojo/_base/declare"
	, "dijit/_WidgetBase"
	, "dijit/registry"
	, "dojo/_base/lang"
	, "dojo/Evented"
	, "put-selector/put"
	, "dojo/dom-construct"
	, "dojo/dom-geometry"
	, "dojo/i18n!./nls/translation"
	, "dojo/dom-attr"
	, "dojo/query"
	, "dojo/on"
], function(
	declare
	, _WidgetBase
	, registry
	, lang
	, Evented
	, put
	, domConstruct
	, domGeom
	, i18n
	, domAttr
	, query
	, on
) {
	var cleanSpace = function(text) {

		if (text && text.length > 0) {
			return text.trim();
		}

		return text;
	};

	return declare([_WidgetBase, Evented], {
		//	summary:
		//		Widget
		//
		// description:
		//

		"class": "containerTextSearch containerFilteringSelect",

		constructor: function(args){

			this.config = {
				idProperty: 'id',
				labelAttr: 'name',
				hiddenClass: 'hidden',
				innerButtonsContainerClass: 'innerButtons',
				removeTextButtonClass: 'clearTextButton',
				suggestionsContainerClass: 'suggestions',
				value: null,
				required: false,
				label: '',
				textRequest: null,
				disabled: false,
				focusIn: -1,
				count: 10,
				start: 0,
				total: 0,
				events: {
					CHANGED: "changed",
					REQUEST_FILTERING_DATA: "requestFilteringData",
					RECEIVED_RESULTS: "receivedResults",
					CLOSE: "close",
					RESET: "reset",
					SET_ITEM: "setItem",
					VALIDATE: "validate",
					ENABLED: "enabled",
					DISABLED: "disabled"
				}
			};

			lang.mixin(this, this.config, args);

			this.on(this.events.CHANGED, this._request);
			this.on(this.events.RECEIVED_RESULTS, this._addResults);

			this.on(this.events.CLOSE, this._closeResults);
			this.on(this.events.RESET, this._removeText);
			this.on(this.events.SET_ITEM, this._setItem);

			this.on(this.events.VALIDATE, this.validate);
			this.on(this.events.ENABLED, this.enabledFiltering);
			this.on(this.events.DISABLED, this.disabledFiltering);
		},

		postCreate: function() {

			this._createFilteringSelect();

			this._createButtonFiltering();

			if (this.disabled) {
				this.disabledFiltering();
			}

			if ((this.properties) && (this.properties[this.idProperty])) {
				this.set("value", this.properties[this.idProperty]);
				this._setterContent();
			} else if (this.placeHolder) {
				this.placeHolder = this.i18n[this.placeHolder] ? this.i18n[this.placeHolder] : this.placeHolder;
				this.inputAutocompleteNode.value = this.placeHolder;
			}

			if (!this.template) {
				this.template = this.labelAttr;
			}

			this.watch("value", function(name, oldValue, value) {

				if (value && this.properties && this.properties[this.idProperty] &&
					this.properties[this.idProperty] == value) {
					this._setterContent();
				}
			});

			this.inherited(arguments);
		},

		_setItem: function(/*Obj*/ item) {

			/* Callback de evento que permite desde fuera setear un item del filtering select*/
			/*TODO: refactorizar con lo que hay implementado */
			this.set("label", item[this.labelAttr]);
			this.set("value", item[this.idProperty]);
			this._setValueInput(this.label);
			this._activeRemoveText();
			this.inputAutocompleteNode.value = '';

			this.validate();
		},

		_setterContent: function() {

			var value = this._getLabelAttr(this.properties);

			this.label = value;
			this._setValueInput(value);
			this._activeRemoveText();
			this.inputAutocompleteNode.value = '';
		},

		_createFilteringSelect: function() {

			this.filteringSelectNode = put(this.domNode, "div.textSearch");

			this.inputAutocompleteNode = put(this.filteringSelectNode, "input[type=search].autocomplete");
			this.inputNode = put(this.filteringSelectNode, "input[type=search]");

			var innerButtonsContainer = put(this.filteringSelectNode, 'div.' + this.innerButtonsContainerClass);

			this.removeTextNode = put(innerButtonsContainer, 'i.' + this.removeTextButtonClass + '.' +
				this.hiddenClass + '[title=' + this.i18n.remove + ']');

			this.inputNode.onblur = lang.hitch(this, this._onInputBlur);

			this.inputNode.onkeyup = lang.hitch(this, this._eventChangeText);
			this.inputNode.onkeydown = lang.hitch(this, this._eventCloseOnKeyDown);

			this.removeTextNode.onclick = lang.hitch(this, this._removeText);

			this.domNode.onmouseleave = lang.hitch(this, this._startTimeOut, this._closeResults);
			this.domNode.onmouseenter = lang.hitch(this, this._stopTimeOut);

			this.inputAutocompleteNode.disabled = true;
		},

		_eventChangeText: function(e) {

			var keyCode = e.keyCode || e.which;

			var keyCodeBoolean = this._selectKeyCodeArrows(keyCode);

			if (!keyCodeBoolean) {
				this._selectCharCorrect(keyCode);
			}

			if (cleanSpace(this._getValueInput()).length !== 0) {
				this._activeRemoveText();
			} else if (!keyCodeBoolean) {
				this._closeResults();
				this._desactiveRemoveText();
				this.focusIn = -1;
			}
		},

		_eventCloseOnKeyDown: function(e) {

			var keyCode = e.keyCode || e.which;

			if (keyCode == 9) {
				this._closeResults();
			}
		},

		_removeText: function() {

			this._setValueInput('');
			this._closeResults();
			this._desactiveRemoveText();
			this.reset();
			this.label = '';
		},

		_startTimeOut: function(option) {

			this.timeOut = setTimeout(lang.hitch(this, option), 800);
		},

		_stopTimeOut: function() {

			clearTimeout(this.timeOut);
		},

		_closeResults: function() {

			this.focusIn = -1;
			this._deleteValueInputAutocomplete();

			if (this.boxResultsNode) {
				this._cleanChildrenNode(this.boxResultsNode);
			}

			if (this._getValueInput().length === 0) {
				this.inputAutocompleteNode.value = this.placeHolder;
				this._desactiveRemoveText();
			}

			this.validate();
		},

		_selectKeyCodeArrows: function(keyCode) {

			if (keyCode === 13) {
				this._selectResult();
			} else if (keyCode === 40) {
				if (this.boxResultsNode && this.boxResultsNode.children && this.boxResultsNode.children.length !== 0) {
					this._selectNodeFocus(1);
				} else {
					this._clickFiltering();
				}
			} else if (keyCode === 38) {
				this._selectNodeFocus(-1);
			} else if ((keyCode === 39) && (this.focusIn !== -1)) {
				this._selectResult();
			} else {
				return false;
			}

			return true;
		},

		_selectCharCorrect: function(keyCode) {

			patron = /[a-zA-Z0-9\s]/;
			charSeleccionado = String.fromCharCode(keyCode);

			if ((patron.test(charSeleccionado) && (keyCode !== 9)) || (keyCode === 46) || (keyCode === 8)) {
				this.focusIn = -1;
				this._deleteValueInputAutocomplete();
				this.label = cleanSpace(this._getValueInput());
				this.emit(this.events.CHANGED, cleanSpace(this._getValueInput()));
			}
		},

		_activeRemoveText: function() {

			put(this.removeTextNode, '!' + this.hiddenClass);
		},

		_desactiveRemoveText: function() {

			put(this.removeTextNode, '.' + this.hiddenClass);
		},

		_getValueInput: function() {

			return this.inputNode.value;
		},

		_setValueInput: function(text) {

			this.inputNode.value = cleanSpace(text);
		},

		_deleteValueInputAutocomplete: function() {

			this.inputAutocompleteNode.value = '';
		},

		_cleanChildrenNode: function(node) {

			domConstruct.destroy(node);
		},

		_selectResult: function() {

			if (this.focusIn !== -1) {
				var itemId = this.focusIn.getAttribute('data-redmic-id'),
					itemValue = isNaN(itemId) ? itemId : parseInt(itemId, 10);

				if (itemId) {
					this._activeRemoveText();
					this.set("value", itemValue);
					this.label = cleanSpace(this._labelFocus);
					this._setValueInput(this._labelFocus);
					this.validate();
					this._closeResults();
				} else {
					this.focusIn.onclick();
				}
			}
		},

		_selectNodeFocus: function(num) {

			if (this.boxResultsNode.children.length !== 0) {
				if ((this.focusIn === -1)) {
					num == 1 ? this.focusIn = this.boxResultsNode.firstChild : this.focusIn = this.boxResultsNode.lastChild;
				} else {
					this.focusIn.onblur();

					if ((num === 1) && (this.boxResultsNode.lastChild !== this.focusIn)) {
						this.focusIn = this.focusIn.nextSibling;
					} else if ((num === -1) && (this.boxResultsNode.firstChild !== this.focusIn)) {
						this.focusIn = this.focusIn.previousSibling;
					} else {
						this.focusIn = -1;
						this._setValueInput(this.label);
						this._selectAutocompleteNode();
					}
				}

				if (this.focusIn != -1) {
					this.focusIn.focus();
				}
			}
		},

		_selectAutocompleteNode: function() {

			this._updateInputAutocomplete('');
		},

		_updateInputAutocomplete: function(text) {

			text = cleanSpace(text);
			if ((this.boxResultsNode.children.length !== 0) && (this.textRequest)) {
				var spaceValue = '',
					i = 0;

				while (this._getValueInput().charAt(i) === ' ') {
					spaceValue += this._getValueInput().charAt(i);
					i++;
				}

				var tamValue = this._getValueInput().length - spaceValue.length;

				this.inputAutocompleteNode.value = this._getValueInput() + text.substring(tamValue, text.length);
			} else if ((!this.textRequest) && (this._getValueInput().length > 0)) {
				this.inputAutocompleteNode.value = '';
			} else {
				this.inputAutocompleteNode.value = this.placeHolder;
			}
		},

		_getValueInputAutocomplete: function() {

			return this.inputAutocompleteNode.value;
		},

		reset: function() {

			this.set("value", null);
			this.validate();
		},

		validate: function() {

			if (this.get("value") || (!this.required && (!this.label || this.label.length === 0))) {
				this._valid();
				return true;
			} else if ((this.label.length > 0) && (this.boxResultsNode && this.boxResultsNode.children.length === 0)) {
				this._notValid();
			} else if ((this.boxResultsNode && this.boxResultsNode.children.length === 0) || this.required) {
				this._notValid();
			} else {
				this._valid();
				return true;
			}

			return false;
		},

		validator: function() {

			return this.validate();
		},

		isValid: function() {

			return this.validate();
		},

		_notValid: function() {

			put(this.inputNode, ".notValid");
			put(this.buttonFilteringNode, ".notValid");
		},

		_valid: function() {

			put(this.inputNode, "!notValid");
			put(this.buttonFilteringNode, "!notValid");
		},

		_createButtonFiltering: function() {

			this.buttonFilteringNode = put(this.domNode, "div.buttonSearch");
			put(this.buttonFilteringNode, "i.fa.fa-caret-down");
			this.buttonFilteringNode.onclick = lang.hitch(this, this._clickFiltering);
		},

		_clickFiltering: function() {

			if (this.boxResultsNode && this.boxResultsNode.children.length === 0) {
				this._cleanChildrenNode(this.boxResultsNode);
				this._setValueInput(this._getValueInput());
				this._request(null);
			} else if (this.boxResultsNode && this.boxResultsNode.children.length !== 0) {
				this._setValueInput(this._getValueInput());
				this._closeResults();
			} else {
				this._setValueInput(this._getValueInput());
				this._request(null);
			}

			this.inputNode.focus();
		},

		_request: function(textValue, pagination) {

			if (!this.disabled) {
				if (textValue) {
					this.label = textValue;
					if (textValue.length === 0) {
						textValue = null;
					}
				}

				this.textRequest = textValue;

				this.emit(this.events.REQUEST_FILTERING_DATA, this._dataFilteringEmit(pagination));
			}
		},

		_dataFilteringEmit: function(pagination) {

			if (!pagination) {
				this.start = 0;
			}

			var json = {
				'text': this.textRequest,
				'start': this.start,
				'count': this.count
			};

			return json;
		},

		_addResults: function(/*JSON*/ Results) {

			this.total = Results.total;

			Results = Results.data;

			if (!this.dialogNode) {
				this.dialogNode = query("div.dijitDialogFocused", document.body);

				if (this.dialogNode.length !== 0){
					this.dialogNode = this.dialogNode[0];
					on(this.dialogNode.children[0], 'mousedown', lang.hitch(this, this._closeResults));
				}
			}

			this._cleanChildrenNode(this.boxResultsNode);
			this.boxResultsNode = put(document.body, 'div.' + this.suggestionsContainerClass + '.' + this.hiddenClass);

			var positionNode = domGeom.position(this.domNode);

			var obj = {top: (positionNode.y + positionNode.h) + 'px', left: positionNode.x + 'px', width: positionNode.w + 'px'};
			domAttr.set(this.boxResultsNode, "style", obj);

			this._openResults();

			var paginationNode;

			if (this.start !== 0) {
				paginationNode = this._insertPagination(i18n.aboveOptions);
				this._addEventsPagination(paginationNode, -this.count);
			}

			for (var i = 0; i < Results.length; i++){

				if (this.label === this._getLabelAttr(Results[i])) {
					this.set("value", Results[i][this.idProperty]);
					this.validate();
				}

				var node = this._createResults(Results[i]);

				if ((this.start === 0) && (i === 0)) {
					node.setAttribute('class', 'suggestion borderResult');
				}

				if ((this.count + this.start) >= this.total && (i + 1) === Results.length) {
					node.setAttribute('class', 'suggestion borderResult');
				}

				this._addEventsResult(node, this._getLabelAttr(Results[i]));
			}

			if ((this.count + this.start) < this.total) {
				paginationNode = this._insertPagination(i18n.moreOptions);
				this._addEventsPagination(paginationNode, +this.count);
			}

			if (this.boxResultsNode.children.length !== 0) {
				this._selectAutocompleteNode();
			} else if (this._getValueInput().length !== 0) {
				this.inputAutocompleteNode.value = '';
			} else {
				this.inputAutocompleteNode.value = this.placeHolder;
			}

			this.validate();
		},

		_onInputBlur: function() {

			this.validate();
		},

		_insertPagination: function(text) {

			var spanNode = put(this.boxResultsNode, "span.suggestion.spanPagination.borderResult");
			spanNode.innerHTML = text;
			return spanNode;
		},

		_createResults: function(item) {

			var spanNode = put(this.boxResultsNode, "span[data-redmic-id=$].suggestion", item[this.idProperty]);
			spanNode.innerHTML = this._getLabelValue(item);
			return spanNode;
		},

		_getLabelValue: function(item) {

			var content;

			if (typeof this.template === "function") {
				content = this.template(item);
			} else if (typeof this.template === "string") {
				if (this.template.indexOf("{") < 0) {
					content = item[this.template];
				} else {
					content = lang.replace(this.template, item);
				}
			}

			if (!content) {
				content = item.text;
			}

			if (content === undefined) {
				return '';
			}

			return content;
		},

		_getLabelAttr: function(item) {

			if (typeof this.labelAttr === "function") {
				return this.labelAttr(item);
			}

			if (typeof this.labelAttr === "string") {
				if (this.labelAttr.indexOf("{") < 0) {
					return item[this.labelAttr];
				}

				return lang.replace(this.labelAttr, item);
			}

			return item.text;
		},

		_addEventsPagination: function(spanNode, count) {

			spanNode.onclick = lang.hitch(this, this._selectPaginationClick, spanNode, count);
			spanNode.focus = lang.hitch(this, this._selectPaginationFocus, spanNode);
			spanNode.onblur = lang.hitch(this, this._deselectResultFocus, spanNode);
			spanNode.onmouseover = lang.hitch(this, this._selectPaginationFocus, spanNode);
			spanNode.onmouseout = lang.hitch(this, this._deselectResultFocus, spanNode);
		},

		_addEventsResult: function(spanNode, item) {

			spanNode.onclick = lang.hitch(this, this._selectResultClick, spanNode, item);
			spanNode.focus = lang.hitch(this, this._selectResultFocus, spanNode, item);
			spanNode.onblur = lang.hitch(this, this._deselectResultFocus, spanNode);
			spanNode.onmouseover = lang.hitch(this, this._selectResultFocus, spanNode, item);
			spanNode.onmouseout = lang.hitch(this, this._deselectResultFocus, spanNode);
		},

		_selectResultFocus: function(spanNode, item) {

			if (this.focusIn != -1) {
				this.focusIn.onblur();
			}

			this.focusIn = spanNode;
			this._labelFocus = item;
			put(spanNode, ".hover");
		},

		_deselectResultFocus: function(spanNode) {

			this._setValueInput(this.label);

			if (this.label && this.label.length === 0) {
				this.inputAutocompleteNode.value = this.placeHolder;
			}

			if (this.boxResultsNode.children.length !== 0) {
				this._selectAutocompleteNode();
			}

			put(spanNode, "!hover");
		},

		_selectResultClick: function(spanNode, item) {

			this._setValueInput(item);
			this.label = item;
			this._selectResult();
		},

		_selectPaginationClick: function(spanNode, count) {

			this.focusIn = -1;
			this.start += count;
			this._request(this.textRequest, true);
		},

		_selectPaginationFocus: function(spanNode) {

			if (this.focusIn != -1) {
				this.focusIn.onblur();
			}

			this.focusIn = spanNode;
			this._selectAutocompleteNode();
			put(spanNode, ".hover");
		},

		_openResults: function() {

			put(this.boxResultsNode, '!' + this.hiddenClass);
			this.boxResultsNode.onmouseleave = lang.hitch(this, this._startTimeOut, this._closeResults);
			this.boxResultsNode.onmouseenter = lang.hitch(this, this._stopTimeOut);
		},

		_reset: function() {

			this.emit(this.events.RESET);
			this._valid();
		},

		disabledFiltering: function() {

			this.inputNode.disabled = true;
			this.disabled = true;

			put(this.filteringSelectNode, ".disable");
			put(this.buttonFilteringNode, ".disable");

			this.removeTextNode.onclick = null;
		},

		enabledFiltering: function() {

			this.inputNode.disabled = false;
			this.disabled = false;

			put(this.filteringSelectNode, "!disable");
			put(this.buttonFilteringNode, "!disable");

			this.removeTextNode.onclick = lang.hitch(this, this._removeText);
		}
	});
});
