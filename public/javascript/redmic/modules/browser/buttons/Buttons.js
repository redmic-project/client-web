define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/dom-class"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, 'RWidgets/Utilities'
	, "put-selector/put"
	, "./_ButtonsItfc"
], function(
	declare
	, lang
	, domClass
	, _Module
	, _Show
	, Utilities
	, put
	, _ButtonsItfc
){
	return declare([_Module, _ButtonsItfc, _Show], {
		//	summary:
		//		Todo lo necesario para trabajar con browser.
		//	description:
		//		Proporciona métodos y contenedor para el browser.

		constructor: function(args) {

			this.config = {
				events: {
					BUTTON_EVENT: "btnEvent"
				},
				actions: {
					BUTTON_EVENT: "btnEvent",
					CHANGE_ROW_BUTTON_TO_MAIN_CLASS: "changeRowButtonToMainClass",
					CHANGE_ROW_BUTTON_TO_ALT_CLASS: "changeRowButtonToAltClass"
				},

				listButton: [],

				_buttonsOccult: 0,
				_totalButtons: 0,

				"class": "containerButtons"
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("CHANGE_ROW_BUTTON_TO_MAIN_CLASS"),
				callback: "_subChangeRowButtonToMainClass"
			},{
				channel : this.getChannel("CHANGE_ROW_BUTTON_TO_ALT_CLASS"),
				callback: "_subChangeRowButtonToAltClass"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'BUTTON_EVENT',
				channel: this.getParentChannel('BUTTON_EVENT')
			});
		},

		postCreate: function() {

			this._createButtons();

			this.inherited(arguments);
		},

		_subChangeRowButtonToMainClass: function(req) {

			this.useButtonMainClass(req);
		},

		_subChangeRowButtonToAltClass: function(req) {

			this.useButtonAltClass(req);
		},

		_createButtons: function() {

			if (!this.listButton) {
				return;
			}

			this._totalButtons = 0;
			this._buttonsOccult = 0;

			for (var i = 0; i < this.listButton.length; i++) {
				this._createButton(this.listButton[i]);
				this._totalButtons++;
			}
		},

		_createButton: function(config) {

			this._addButton(config);
		},

		_addButton: function(config) {

			if (config.href) {
				this._addLinkButton(config);
			} else {
				this._addIconButton(config, this.domNode);
			}
		},

		_addLinkButton: function(config) {

			var linkButtonNode = put(this.domNode, 'a');

			this._addIconButton(config, linkButtonNode);
		},

		_addIconButton: function(config, parentNode) {

			var icon = config.icon,
				iconTitle = config.title,
				iconClass = '.' + icon.split('-')[0] + '.iconList.' + icon,
				iconAttr = '';

			if (config.classIcon) {
				iconClass += '.' + config.iconClass;
			}

			if (iconTitle) {
				iconAttr += '[title=' + iconTitle + ']';
			}

			put(parentNode, 'i' + iconClass + iconAttr);
		},

		_afterShow: function(obj) {

			this._updateItem(obj.data);

			if (this.noSpaceWhenNoButtons) {
				if (this._totalButtons === this._buttonsOccult)
					domNode.setAttribute("style", "display:none");
			}
		},

		_updateItem: function(item) {

			if (!this.listButton) {
				return;
			}

			for (var i = 0; i < this.listButton.length; i++) {

				this._buttonsOccult = 0;

				var config = this.listButton[i],
					node = this.domNode.children[i];

				this._updateButton(item, config, node);
			}
		},

		_updateButton: function(item, config, node) {

			this._conditionButton(item, config, node);
		},

		_conditionButton: function(item, config, node) {

			var condition = config.condition;

			if (condition !== undefined && !this._evaluateCondition(item, condition)) {
				this._buttonsOccult++;
				this._incorrectConditionButton(item, config, node);
			} else {
				this._correctConditionButton(item, config, node);
			}

			if (config.startup) {
				config.startup(node, item);
			}
		},

		_correctConditionButton: function(item, config, node) {

			var title = config.title,
				href = config.href;

			if (title && this.i18n[title]) {
				node.setAttribute('title', this.i18n[title]);
			}

			put(node, '!occult');

			if (href) {
				this._updateHref(item, config, node);
			}

			var event = config.event || 'onclick';
			node[event] = lang.hitch(this, this._eventClickButton, config, item, node);
		},

		_incorrectConditionButton: function(item, config, node) {

			put(node, '.occult');

			node.setAttribute('title', null);

			if (config.href) {
				node.removeAttribute("href");
			}
		},

		_updateHref: function(item, config, node) {

			var href = this._hrefIsMultiple(config, item),
				pathToItem = config.pathToItem,
				itemReplace = pathToItem ? Utilities.getDeepProp(item, pathToItem) : item;

			href = lang.replace(href, itemReplace);

			node.setAttribute('href', href);
			if (href.indexOf('#') !== 0) {
				node.setAttribute('d-state-url', true);
			}
		},

		_hrefIsMultiple: function(config, item) {

			var href = config.href;

			if (typeof href === 'object') {
				if (this._evaluateCondition(item, config.condition)) {
					return href[config.chooseHref(item)];
				} else {
					return "";
				}
			}

			return href;
		},

		_evaluateCondition: function(item, condition) {

			if (typeof condition === "function") {
				return condition(item);
			}

			return condition && !!item[condition];
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_eventClickButton: function(config, item, node) {

			if (this._proccesDelayNext(config, item, node)) {
				return;
			}

			this._updateIconClass(config, node);

			var obj = this._getClickButtonReturnObj(config, item, node);

			if (config.callback) {
				obj.callback = config.callback;
			}

			this._delayNextButton(config);

			this._emitEvt('BUTTON_EVENT', obj);
		},

		_delayNextButton: function(config) {

			var delayNext = config.delayNext;

			if (config.delayNext) {
				this._dateDelayNext = {
					date: Date.now(),
					delay: delayNext
				};
			}
		},

		_proccesDelayNext: function(config, item, node) {

			if (!this._dateDelayNext) {
				return false;
			}

			var date = Date.now(),
				value = this._dateDelayNext.date + this._dateDelayNext.delay;

			if (date < value) {
				setTimeout(lang.hitch(this, this._eventClickButton, config, item, node), value - date);

				this._emitEvt('LOADING', {
					global: true
				});

				return true;
			}

			this._emitEvt('LOADED');

			delete this._dateDelayNext;

			return false;
		},

		_updateIconClass: function(config, node) {

			if (config.altIcon) {
				domClass.toggle(node, config.altIcon);
				domClass.toggle(node, config.icon);
			}
		},

		_getClickButtonReturnObj: function(config, item, node) {

			var obj = {
				btnId: config.btnId
			};

			obj[this.idProperty] = item[this.idProperty];

			if (config.returnItem){

				obj.item = item;

				if (obj.item._meta) {
					delete obj.item._meta;
				}
			}

			if (config.node) {
				obj.iconNode = node;
			}

			if (config.state) {
				obj.state = domClass.contains(node, config.icon);
			}

			return obj;
		},

		useButtonMainClass: function(obj) {

			var btnId = obj.btnId,
				index = this._getButtonIndexByBtnId(btnId),
				config = this.listButton[index],
				node = this.domNode.children[index];

			if (!config) {
				return;
			}

			domClass.remove(node, config.altIcon);
			domClass.add(node, config.icon);
		},

		useButtonAltClass: function(obj) {

			var btnId = obj.btnId,
				index = this._getButtonIndexByBtnId(btnId),
				config = this.listButton[index],
				node = this.domNode.children[index];

			if (!config) {
				return;
			}

			domClass.add(node, config.altIcon);
			domClass.remove(node, config.icon);
		},

		_getButtonIndexByBtnId: function(btnId) {

			for (var i = 0; i < this.listButton.length; i++) {

				var config = this.listButton[i];

				if (config.btnId === btnId) {
					return i;
				}
			}

			return -1;
		}
	});
});
