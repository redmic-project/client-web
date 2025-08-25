define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, 'put-selector'
	, "src/component/base/_Module"
	, "src/component/base/_Show"
	, "src/component/base/_Store"
	, 'src/component/browser/bars/_BarCommons'
], function(
	declare
	, lang
	, put
	, _Module
	, _Show
	, _Store
	, _BarCommons
) {

	return declare([_Module, _Show, _Store, _BarCommons], {
		//	summary:
		//		Componente que aporta un contador del total de elementos disponibles.

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
				channel: this._buildChannel(this.browserChannel, 'CLEAR'),
				callback: "_subClearBrowser"
			},{
				channel: this._buildChannel(this.browserChannel, 'DATA_REMOVED'),
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

		_dataAvailable: function(response) {

			const total = this._getTotalValueFromResponse(response);
			this._setTotal(total);
		},

		_itemAvailable: function(response) {

			this._once(this._buildChannel(this.browserChannel, 'GOT_DATA'),
				lang.hitch(this, this._subBrowserGotData));

			this._publish(this._buildChannel(this.browserChannel, 'GET_DATA'));
		},

		_subBrowserGotData: function(req) {

			this._setTotal(req.data.length);
		}
	});
});
