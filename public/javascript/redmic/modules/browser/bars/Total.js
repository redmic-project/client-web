define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "redmic/modules/base/_Store"
], function(
	declare
	, lang
	, aspect
	, put
	, _Module
	, _Show
	, _Store
){
	return declare([_Module, _Show, _Store], {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				'class': 'totalResult',
				total: 0,

				actions: {
					DATA_REMOVED: "dataRemoved",
					GET_DATA: "getData",
					GOT_DATA: "gotData",
					CLEAR: "clear",
					SET_TOTAL: "setTotal"
				}
			};

			lang.mixin(this, this.config);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.getChannel("SET_TOTAL"),
				callback: "_subSetTotal"
			},{
				channel: this._buildChannel(this.browserChannel, this.actions.CLEAR),
				callback: "_subClearBrowser"
			},{
				channel: this._buildChannel(this.browserChannel, this.actions.DATA_REMOVED),
				callback: "_subDataRemovedBrowser"
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._addStructure();
		},

		_addStructure: function() {

			put(this.domNode, "span", this.i18n.total + ": ");
			this.totalNode = put(this.domNode, "span", this.total);
		},

		_subSetTotal: function(req) {

			this._setTotal(req.value || 0);
		},

		_setTotal: function(/*int*/ total) {

			if (total < 0) {
				return;
			}

			this.total = total;

			this.totalNode.innerHTML = total;
		},

		_subClearBrowser: function() {

			this._setTotal(0);
		},

		_subDataRemovedBrowser: function() {

			this._setTotal(this.total - 1);
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_dataAvailable: function(response) {

			var data = response.data;
				total = (data.total >= 0) ? data.total : response.total;

			if (total === undefined || total === null) {
				if (data.data) {
					total = data.data.total;
				} else {
					total = data.length;
				}
			}

			this._setTotal(total);
		},

		_itemAvailable: function(response) {

			this._once(this._buildChannel(this.browserChannel, this.actions.GOT_DATA),
				lang.hitch(this, this._subBrowserGotData));

			this._publish(this._buildChannel(this.browserChannel, this.actions.GET_DATA));
		},

		_subBrowserGotData: function(req) {

			this._setTotal(req.data.length);
		}
	});
});
