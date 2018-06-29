define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
], function(
	declare
	, lang
	, aspect
	, put
){
	return declare(null, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				"class": "containerList",
				frameWorkClass: "",
				frameworkEvents: {
					ADD_TOOLBAR_IN_FRAMEWORK: "addToolbarInFramework",
					REMOVE_TOOLBAR_IN_FRAMEWORK: "removeToolbarInFramework"
				},
				frameworkActions: {
					ADDED_TOOLBAR_IN_FRAMEWORK: "addedToolbarInFramework",
					ADD_TOOLBAR_IN_FRAMEWORK: "addToolbarInFramework",
					REMOVED_TOOLBAR_IN_FRAMEWORK: "removedToolbarInFramework",
					REMOVE_TOOLBAR_IN_FRAMEWORK: "removeToolbarInFramework"
				},

				_barsIntances: []
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixFrameworkEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineFrameworkSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineFrameworkPublications));
		},

		_mixFrameworkEventsAndActions: function () {

			lang.mixin(this.events, this.frameworkEvents);
			lang.mixin(this.actions, this.frameworkActions);

			delete this.frameworkEvents;
			delete this.frameworkActions;
		},

		_defineFrameworkSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("ADD_TOOLBAR_IN_FRAMEWORK"),
				callback: "_subAddToolbarInFramework"
			},{
				channel : this.getChannel("REMOVE_TOOLBAR_IN_FRAMEWORK"),
				callback: "_subRemoveToolbarInFramework"
			});
		},

		_defineFrameworkPublications: function() {

			this.publicationsConfig.push({
				event: 'ADD_TOOLBAR_IN_FRAMEWORK',
				channel: this.getChannel("ADDED_TOOLBAR_IN_FRAMEWORK")
			},{
				event: 'REMOVE_TOOLBAR_IN_FRAMEWORK',
				channel: this.getChannel("REMOVED_TOOLBAR_IN_FRAMEWORK")
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._createFrameworkContainer();
		},

		_createFrameworkContainer: function() {

			var contentClass = ".framework.bottomList" + this.frameWorkClass;

			this.bottomListNode = put(this.domNode, "div" + contentClass);

			this._addBars();
		},

		_addBars: function() {

			if (!this.bars) {
				return;
			}

			for (var i = 0; i < this.bars.length; i++) {
				var item = this.bars[i],
					instance = item.instance,
					config = item.config || {};

				if (typeof config === "string") {
					config = this[config] || {};
				}

				config = this._merge([{
					parentChannel: this.getChannel(),
					queryChannel: this.queryChannel,
					target: this._getTarget(),
					selectionTarget: this.selectionTarget,
					perms: this.perms,
					selectorChannel: this.selectorChannel,
					storeChannel: this.storeChannel,
					browserChannel: this.getChannel(),
					idProperty: this.idProperty
				}, config]);

				instance = new instance(config);

				this._addToolbarInFramework({
					instance: instance
				});
			}
		},

		_subAddToolbarInFramework: function(req) {

			this._addToolbarInFramework(req);
		},

		_addToolbarInFramework: function(req) {

			var instance = req.instance;

			this._publish(instance.getChannel("SHOW"), {
				node: this.bottomListNode
			});

			this._barsIntances.push(instance);

			this._emitEvt("ADD_TOOLBAR_IN_FRAMEWORK");
		},

		_subRemoveToolbarInFramework: function(req) {

			this._removeToolbarInFramework(req);
		},

		_removeToolbarInFramework: function(req) {

			var instance = req.instance;

			this._publish(instance.getChannel("HIDE"));

			this._emitEvt("REMOVE_TOOLBAR_IN_FRAMEWORK");
		},

		_updateTarget: function(obj) {

			for (var i = 0; i < this._barsIntances.length; i++) {
				this._publish(this._barsIntances[i].getChannel("UPDATE_TARGET"), obj);
			}
		}
	});
});
