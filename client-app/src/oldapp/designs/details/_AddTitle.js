define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/query"
	, 'put-selector'
	, "src/component/layout/templateDisplayer/TemplateDisplayer"
	, "templates/DefaultDetailsTitle"
], function (
	declare
	, lang
	, aspect
	, query
	, put
	, TemplateDisplayer
	, TemplateTitle
){
	return declare(null, {
		//	summary:
		//		Extensión para añadir Title a detalles

		constructor: function(args) {

			this.configTitle = {
				_titleLeftButtonsList: [],
				_titleRightButtonsList: [],
				tabs: [],
				hiddenClass: 'hidden',
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

			aspect.after(this, "_afterSetConfigurations", lang.hitch(this, this._setTitleConfigurations));
			aspect.before(this, "_initialize", this._initializeTitle);
			aspect.before(this, "_defineSubscriptions", this._defineTitleSubscriptions);
			aspect.after(this, "postCreate", this._postCreateTitle);
		},

		_setTitleConfigurations: function() {

			this._titleWidgetConfig = this._merge([{
				parentChannel: this.getChannel(),
				ownChannel: "title",
				associatedIds: [this.ownChannel],
				template: TemplateTitle,
				target: this.target instanceof Array ? this.target[0] : this.target
			}, this.titleWidgetConfig || {}]);
		},

		_initializeTitle: function() {

			this.titleWidget = new TemplateDisplayer(this._titleWidgetConfig);

			aspect.after(this.titleWidget, "_dataAvailable", lang.hitch(this, this._addDataInTitle));
			aspect.after(this.titleWidget, "_itemAvailable", lang.hitch(this, this._addDataInTitle));
		},

		_defineTitleSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.titleWidget.getChannel("UPDATED"),
				callback: "_subTitleUpdated"
			});
		},

		_subTitleUpdated: function(res) {

		},

		_postCreateTitle: function() {

			this._createContainerTitle();
		},

		_createContainerTitle: function() {

			this.topNode = put("div.infoTitle.infoTitleBackground");

			this.titleNode = put(this.topNode, "div.title");

			if (this.centerTitle) {
				put(this.titleNode, ".centerTitle");
			}

			put(this.domNode.firstChild, "-", this.topNode);
		},

		_addDataInTitle: function() {

			this._updateDataTitle();
			this._createTitle();
			this._addIconsAndTabs();
		},

		_updateDataTitle: function() {

			// TODO no setear a lo bruto, es un component!!
			this.data = this.titleWidget.data;
		},

		_addIconsAndTabs: function() {

			var leftButtons = this._titleLeftButtonsList.concat(this.titleLeftButtonsList || []),
				rightButtons = this._titleRightButtonsList.concat(this.titleRightButtonsList || []);

			var evaluateButton = lang.hitch(this, this._evaluateButton),
				filteredLeftButtons = leftButtons.filter(evaluateButton),
				filteredRightButtons = rightButtons.filter(evaluateButton);

			put(this._titleRightNode, (filteredRightButtons.length ? '!' : '.') + this.hiddenClass);

			this._insertButtonsIcons(filteredLeftButtons.reverse(), filteredRightButtons.reverse());
		},

		_createTitle: function() {

			this._createTitleNodes();

			this._publish(this.titleWidget.getChannel("SHOW"), {
				node: this._titleCenterNode
			});

			if (this._idTitle) {
				this._addIdTitle();
			}

			if (this.pathParent) {
				this._addCatalogButton();
			} else {
				this._hideCatalogButton();
			}
		},

		_createTitleNodes: function() {

			if (this._titleLeftNode || !this.titleNode) {
				return;
			}

			this._titleCenterNode = this.titleNode;

			this._titleButtonsNode = put(this.topNode, 'div.buttons');

			this._titleLeftNode = put(this._titleButtonsNode, "div.left");

			this._titleRightContainer = put(this._titleButtonsNode, "div.rightContainer");
			this._titleRightCatalogContainerNode = put(this._titleRightContainer, 'div.goToCatalogContainer');
			this._titleRightNode = put(this._titleRightContainer, "div.right." + this.hiddenClass);
		},

		_addIdTitle: function() {

			var nodeTitle = query("h1", this._titleCenterNode);

			if (nodeTitle.length !== 0) {
				nodeTitle = nodeTitle[0];
				nodeTitle.innerHTML = this.data.id + ' - ' + nodeTitle.innerHTML;
			}
		},

		_addCatalogButton: function() {

			if (!this._titleRightCatalogNode) {
				this._titleRightCatalogNode = put(this._titleRightCatalogContainerNode, 'a.goToCatalogButton',
					this.i18n.goToCatalog);
			}

			put(this._titleRightCatalogContainerNode, '!' + this.hiddenClass);
			this._titleRightCatalogNode.setAttribute('href', this.pathParent);
			this._titleRightCatalogNode.setAttribute('d-state-url', true);
		},

		_hideCatalogButton: function() {

			put(this._titleRightCatalogContainerNode, '.' + this.hiddenClass);
		},

		_insertButtonsIcons: function(leftButtons, rightButtons) {

			var getIconNode = lang.hitch(this, this._getIconNode),
				leftButtonsNodes = leftButtons.map(getIconNode),
				rightButtonsNodes = rightButtons.map(getIconNode);

			this._titleLeftNode.replaceChildren.apply(this._titleLeftNode, leftButtonsNodes);
			this._titleRightNode.replaceChildren.apply(this._titleRightNode, rightButtonsNodes);
		},

		_evaluateButton: function(config) {

			return this._evaluateCondition(config.condition);
		},

		_evaluateCondition: function(condition) {

			if (condition === undefined || condition === null) {
				return true;
			}

			if (typeof condition === 'boolean') {
				return !!condition;
			}

			if (this.data) {
				if (typeof condition === 'function') {
					return condition(this.data);
				}

				return condition && !!this.data[condition];
			}

			return true;
		},

		_getIconNode: function(config) {

			var iconNode = put((config.href ? 'a' : 'i') + ".iconList." + config.icon.split("-")[0] + "." + config.icon);

			if (config.title) {
				iconNode.setAttribute("title", config.title);
			}

			if (config.href) {
				iconNode.setAttribute('href', lang.replace(config.href, this.data));
				iconNode.setAttribute('d-state-url', true);
			}

			if (config.btnId) {
				var methodName = '_' + config.btnId + 'OnClick',
					callback = this[methodName];

				if (callback) {
					iconNode.onclick = lang.hitch(this, callback);
				}
			}

			return iconNode;
		}
	});
});
