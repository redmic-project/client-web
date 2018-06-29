define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/query"
	, "put-selector/put"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "RWidgets/Utilities"
], function (
	declare
	, lang
	, aspect
	, query
	, put
	, TemplateDisplayer
	, Utilities
){
	return declare(null, {
		//	summary:
		//		Extensión para añadir Title a detalles

		constructor: function(args) {

			this.configTitle = {
				_titleWidgetConfig: {
					parentChannel: this.getChannel(),
					ownChannel: "title",
					associatedIds: [this.ownChannel]
				},

				_titleLeftButtonsList: [],

				_titleRightButtonsList: [{
					icon: "fa-print",
					btnId: "report",
					title: this.i18n.print
				}],

				tabs: [],

				centerTitle: false,

				pathParent: null,

				_closeTitle: false,

				_idTitle: false,

				_close: {
					icon: "fa-close",
					title: this.i18n.close
				}
			};

			lang.mixin(this, this.configTitle, args);

			aspect.before(this, "_initialize", this._initializeTitle);
			aspect.after(this, "postCreate", this._postCreateTitle);
		},

		_initializeTitle: function() {

			lang.mixin(this._titleWidgetConfig, this.titleWidgetConfig);

			this.titleWidget = new TemplateDisplayer(this._titleWidgetConfig);

			aspect.after(this.titleWidget, "_dataAvailable", lang.hitch(this, this._dataInTitle));
			aspect.after(this.titleWidget, "_itemAvailable", lang.hitch(this, this._dataInTitle));
		},

		_postCreateTitle: function() {

			this._createContainerTitle();
		},

		_createContainerTitle: function() {

			this.topNode = put("div.infoTitle");

			this.titleNode = put(this.topNode, "div.infoTitle.infoTitleBackground.title");

			if (this.centerTitle) {
				put(this.titleNode, ".centerTitle");
			}

			put(this.containerNode.firstChild, "-", this.topNode);
		},

		_dataInTitle: function() {

			this._createTitle();

			this.data = this.titleWidget.data;

			if (this._idTitle) {
				this._addIdTitle();
			}

			if (this.pathParent && this.activeTitleParent) {
				this._addParentTitle();
			}

			var leftButtons = this._titleLeftButtonsList.concat(this.titleLeftButtonsList || []),
				rightButtons = this._titleRightButtonsList.concat(this.titleRightButtonsList || []);
			this._insertButtonsIcons(leftButtons.reverse(), rightButtons.reverse());

			if (this.tabs && this.tabs.length > 0) {
				this._insertTabs();
			}
		},

		_createTitle: function() {

			if (this._titleLeftNode) {
				return;
			}

			this._titleLeftNode = put(this.titleNode, "div.left");
			this._titleCenterNode = put(this.titleNode, "div.center");
			this._titleRightNode = put(this.titleNode, "div.right.hidden");
			put(this.titleNode, "div.rightSpace");

			this._publish(this.titleWidget.getChannel("SHOW"), {
				node: this._titleCenterNode
			});
		},

		_addIdTitle: function() {

			var nodeTitle = query("h1", this._titleCenterNode);

			if (nodeTitle.length !== 0) {
				nodeTitle = nodeTitle[0];
				nodeTitle.innerHTML = this.data.id + ' - ' + nodeTitle.innerHTML;
			}
		},

		_addParentTitle: function() {

			var nodeTitle = query("h1", this._titleCenterNode);

			if (nodeTitle.length !== 0) {
				nodeTitle = nodeTitle[0];
				var node = put(nodeTitle, "-a.titleParent");

				put(node, "span", this.i18n[this.pathParent.split("/")[1]]);

				node.setAttribute('href', this.pathParent);
				node.setAttribute('d-state-url', true);
			}
		},

		_insertTabs: function() {

			if (this._tabstitleNode) {
				this._tabstitleNode = put(this._tabstitleNode, "!");
			}

			this._tabstitleNode = put(this.titleNode, "div.tabs");

			for (var i = 0; i < this.tabs.length; i++) {
				this._insertTab(i);
			}
		},

		_insertTab: function(pos) {

			if (this.tabs[pos].select) {
				return;
			}

			if (this._insertTabByCondition(this.tabs[pos])) {
				var classTab = ".tab.tabSelect";

				/*if (this.tabs[pos].select) {
					classTab += ".tabSelect";
				}*/

				tabNode = put(this._tabstitleNode, "div" + classTab + " a",
					this.i18n[this.tabs[pos].title] ? this.i18n[this.tabs[pos].title] : this.tabs[pos].title);

				if (!this.tabs[pos].select && this.tabs[pos].href) {
					tabNode.setAttribute('href', lang.replace(this.tabs[pos].href, this.data));
					tabNode.setAttribute('d-state-url', true);
				}
			}
		},

		_insertTabByCondition: function(tab) {

			if (tab.condition) {
				return tab.condition(this.data);
			}

			var conditionHrefPath = tab.conditionHref,
				conditionValue = tab.conditionValue,
				conditionHref;

			if (!conditionHrefPath) {
				return true;
			}

			conditionHref = Utilities.getDeepProp(this.data, conditionHrefPath, this.pathSeparator);

			if (conditionValue) {
				if (conditionHref === conditionValue) {
					return true;
				}
			} else if (conditionHref) {
				return true;
			}

			return false;
		},

		_insertButtonsIcons: function(leftButtons, rightButtons) {

			var i;

			if (this._titleLeftNode.children.length === 0) {
				for (i = 0; i < leftButtons.length; i++) {
					this._preInsertIcon(leftButtons[i], this._titleLeftNode);
				}
			}

			if (this._titleRightNode.children.length === 0) {
				if (rightButtons.length !== 0) {
					this._titleRightNode.setAttribute("class", "right");
				}

				for (i = 0; i < rightButtons.length; i++) {
					this._preInsertIcon(rightButtons[i], this._titleRightNode);
				}
			}
		},

		_preInsertIcon: function(buttonProp, node) {

			if ((!buttonProp.condition) || (buttonProp.condition && this.data && this.data[buttonProp.condition])) {
				this._insertIcon(buttonProp, node);
			}
		}
	});
});
