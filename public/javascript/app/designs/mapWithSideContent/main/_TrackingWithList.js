define([
	"app/redmicConfig"
	, "dijit/layout/BorderContainer"
	, "dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/_MultiTemplate"
	, "redmic/modules/browser/_Select"
	, "templates/ActivityList"
	, "templates/AnimalList"
	, "templates/TrackingPlatformList"
], function(
	redmicConfig
	, BorderContainer
	, ContentPane
	, declare
	, lang
	, aspect
	, ListImpl
	, _ButtonsInRow
	, _Framework
	, _MultiTemplate
	, _Select
	, templateActivityList
	, templateAnimalList
	, templatePlatformList
){
	return declare(null, {
		//	summary:
		//		Vista de Tracking.
		//	description:
		//		Permite visualizar seguimientos.

		constructor: function (args) {

			this.config = {
				pathSeparator: ".",
				targetBrowserWork: "browserWork",
				idProperty: 'id',

				_pathGenerate: 'pathGenerate',

				browserWorkExts: [_ButtonsInRow, _Select, _MultiTemplate],
				browserWorkBase: [ListImpl, _Framework]
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setTrackingWithListConfigurations));
			aspect.after(this, "_beforeInitialize", lang.hitch(this, this._initializeTrackingWithList));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineTrackingWithListSubscriptions));
		},

		_setTrackingWithListConfigurations: function() {

			this.browserWorkConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.targetBrowserWork,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-tint",
							btnId: "colorPicker",
							title: "color",
							condition: function(item) {
								return item.color;
							},
							startup: lang.hitch(this, this._startupColorIcon)
						},{
							icon: "fa-info-circle",
							btnId: "details",
							title: "info",
							href: [
								redmicConfig.viewPaths.activityCatalogDetails,
								redmicConfig.viewPaths.platformCatalogDetails
							],
							chooseHref: function(item) {

								if (item.activityType) {
									return 0;
								}

								if (item.platformType) {
									return 1;
								}
							},
							condition: function(item) {

								if (item.activityType || item.platformType) {
									return true;
								}
							}
						}]
					},
					selectionIdProperty: this._pathGenerate
				},
				idProperty: this._pathGenerate,
				existsPropertyWithTemplate: true,
				template: templateActivityList,
				templatesByTypeGroup: {
					activityType: templateActivityList,
					taxon: templateAnimalList,
					platformType: templatePlatformList
				}
			}, this.browserWorkConfig || {}], {
				arrayMergingStrategy: 'concatenate'
			});
		},

		_initializeTrackingWithList: function() {

			var exts = this.browserWorkBase.concat(this.browserWorkExts);

			this.browserWork = new declare(exts)(this.browserWorkConfig);
		},

		_defineTrackingWithListSubscriptions: function () {

			var options = {
				predicate: lang.hitch(this, this._chkSelectionTargetIsBrowserWork)
			};

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.selectorChannel, this.actions.SELECTED),
				options: options,
				callback: "_subBrowserWorkSelected"
			},{
				channel : this._buildChannel(this.selectorChannel, this.actions.DESELECTED),
				options: options,
				callback: "_subBrowserWorkDeselected"
			},{
				channel : this.getChannel("CLEAR"),
				callback: "_subClear"
			},{
				channel : this.browserWork.getChannel("BUTTON_EVENT"),
				callback: "_subListBtnEvent"
			});
		},

		_chkSelectionTargetIsBrowserWork: function(res) {

			if (!this._chkSuccessful(res)) {
				return false;
			}

			var body = res.body;
			if (body && body.selectionTarget && (body.selectionTarget !== this.targetBrowserWork)) {
				return false;
			}

			return true;
		},

		_fillSideContent: function() {

			this.inherited(arguments);

			var borderContainer = this._createBrowserWork();

			this.tabContainer.addChild(borderContainer, 0);

			this.tabContainer.selectChild(borderContainer);
		},

		_createBrowserWork: function() {

			var browserAndSearchContainer = new BorderContainer({
				title: this.i18n.Elements,
				'class': "marginedContainer noScrolledContainer"
			});

			this.browserWorkNode = new ContentPane({
				region: "center"
			});

			this._publish(this.browserWork.getChannel("SHOW"), {
				node: this.browserWorkNode.domNode
			});

			browserAndSearchContainer.addChild(this.browserWorkNode);

			return browserAndSearchContainer;
		},

		_cleanElementByActivity: function(activityId) {

			var items = [];

			for (var key in this._activityIdByUuid) {
				if (this._activityIdByUuid[key] === activityId) {
					items.push(this._generatePath(activityId, key));
				}
			}

			this._publish(this.browserWork.getChannel("DESELECT"), {
				items: items
			});
		},

		_generatePath: function(activityId, idProperty) {

			var pathGenerate = 'root.' + activityId;

			if (idProperty) {
				pathGenerate += this.pathSeparator + idProperty;
			}

			return pathGenerate;
		},

		_getIdFromPath: function(path) {

			return path.split(this.pathSeparator).pop();
		},

		_subBrowserWorkDeselected: function(res) {

			if (!res || !res.body || !res.body.ids) {
				return;
			}

			var items = res.body.ids;

			for (var i = 0; i < items.length; i++) {

				var pathGenerate = items[i],
					idProperty = pathGenerate.split(this.pathSeparator)[2];

				if (this._layerInstances[idProperty]) {

					this._injectItemInBrowserWork({
						color: null,
						pathGenerate: pathGenerate
					});

					this._removeDataLayer(idProperty);
				}
			}
		},

		_subBrowserWorkSelected: function(res) {

			if (!res || !res.body || !res.body.ids) {
				return;
			}

			var items = res.body.ids;

			for (var i = 0; i < items.length; i++) {

				var pathGenerate = items[i],
					item = {
						activityId: pathGenerate.split(this.pathSeparator)[1],
						pathGenerate: pathGenerate
					},
					idProperty = pathGenerate.split(this.pathSeparator)[2];

				if (!this._layerInstances[idProperty]) {
					this._once(this.browserWork.getChannel("GOT_ITEM"),
						lang.hitch(this, this._subBrowserWorkGotItem, idProperty, item));

					this._publish(this.browserWork.getChannel("GET_ITEM"), {
						idProperty: pathGenerate
					}, idProperty, item);
				}
			}
		},

		_subBrowserWorkGotItem: function(idProperty, item, obj) {

			var data = obj.item;

			if (data) {
				item = this._merge([item, data]);

				if (item) {
					this._addDataLayer(idProperty, item);
				}
			}
		},

		_getFreeColor: function(idProperty, item) {

			var ret = this.inherited(arguments);

			item.color = ret;

			if (item[this.idProperty]) {
				this._injectItemInBrowserWork(item);
			}

			return ret;
		},

		_startupColorIcon: function(nodeIcon, item) {

			if (item.color) {
				nodeIcon.setAttribute("style", "color:" + item.color + " !important; text-shadow: 0px 0px 3px white;");
			}
		},

		_injectItemInBrowserWork: function(item) {

			if (item.activityType) {
				item.leaves = 1;
			}

			this._emitEvt("INJECT_ITEM", {
				data: item,
				target: this.targetBrowserWork
			});
		},

		_subClear: function(response) {

			this._clear();
		},

		_clear: function(response) {

			this._publish(this.browserWork.getChannel("CLEAR"));

			for (var key in this._layerInstances) {
				this._removeDataLayer(key);
			}
		},

		_subListBtnEvent: function(evt) {

			var callback = "_" + evt.btnId + "Callback";
			this[callback] && this[callback](evt);
		}
	});
});
