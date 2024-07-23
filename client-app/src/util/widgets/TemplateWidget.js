define([
	"dojo/_base/declare"
	, "dijit/_WidgetBase"
	, "dojo/_base/lang"
	, "dojo/Evented"
	, 'leaflet/leaflet'
	, "dojo/query"
	, "dojo/on"
	, "put-selector/put"
], function(
	declare
	, _WidgetBase
	, lang
	, Evented
	, leaflet
	, query
	, on
	, put
) {

	return declare([_WidgetBase, Evented], {

		//  summary:
		//      Widget
		//
		// description:
		//

		"class": "containerDetails",

		constructor: function(args){

			this.config = {
				template: null,
				noDataMessage: null,
				listButton: [],
				events: {
					RENDER: "render",
					CONFIG: "config",
					HIDE: "hide",
					SHOWN: "shown",
					CLEARNODE: "clear",
					ERROR: "error"
				}
			};

			lang.mixin(this, this.config, args);

			this.on(this.events.RENDER, lang.hitch(this, this._render));
			this.on(this.events.CLEARNODE, lang.hitch(this, this._cleanChildrenNode));
			this.on(this.events.CONFIG, lang.hitch(this, this._setConfig));

		},

		postCreate: function() {

		},

		_setConfig: function(config) {

			lang.mixin(this, config);
		},

		_render: function(i18n, data) {

			this.emit(this.events.CLEARNODE, this.domNode);

			if ((data == null) || (data.length == 0))
				this._noDataFound();
			else {

				if (this.template) {
					this.domNode.innerHTML = this.template({i18n: i18n, data: data, listButton: this.listButton});
				}

				var node = query('div.header div.left i.fa.fa-chevron-left.iconList', this.domNode);

				if (node.length != 0)
					on(node, 'click', lang.hitch(this, this._eventClickButton, {'event': this.events.HIDE}));

				this._createEventButton();

				this.emit(this.events.SHOWN);
			}
		},

		_cleanChildrenNode: function(node) {

			while (node.firstChild) node.removeChild(node.firstChild);
		},

		_noDataFound: function() {

			if (this.noDataMessage)
				this.domNode.innerHTML = this.noDataMessage;
			else
				put(this.domNode, "div.notDataFound span", "No datos!!");
			this.emit(this.events.ERROR, "No datos!!");
		},

		_createEventButton: function() {

			for (var n in this.listButton) {
				if ((Object.keys(this.listButton[n]).indexOf('event') != -1) && (this.listButton[n].event != ''))
					on(query('div.header div.right i.' + this.listButton[n].icon, this.domNode),
						'click', lang.hitch(this, this._eventClickButton, this.listButton[n]));
			}
		},

		_eventClickButton: function(item) {

			this.emit(item.event);
		}
	});
});