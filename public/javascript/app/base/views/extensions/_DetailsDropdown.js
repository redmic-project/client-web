define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/query"
	, "redmic/modules/layout/details/HandleBarsTemplateImpl"
], function(
	declare
	, lang
	, aspect
	, query
	, HandleBarsTemplateImpl
){
	return declare(null, {
		//	summary:
		//		Extensión para las vistas con detalles desplegables.

		constructor: function(args){

			aspect.after(this, "_initialize", lang.hitch(this, this._initializeDetailsDropdown));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineDetailsDropdownSubscriptions));
		},

		_defineDetailsDropdownSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.selectorChannel, this.browser.actions.SELECTED),
				callback: "_subItemSelected"
			});
		},

		_initializeDetailsDropdown: function() {

			var detailsConfig = {
				parentChannel: this.getChannel(),
				target: this.target,
				idProperty: this.idProperty,
				i18n: this.i18n,
				template: this.detailsTemplate
			};

			lang.mixin(detailsConfig, this.detailsConfig);

			this.details = new HandleBarsTemplateImpl(detailsConfig);
		},

		_subAvailable: function(request) {

			this.idDetails = null;
		},

		_subItemSelected: function() {

			this._publish(this.details.getChannel("HIDE"));
		},

		_subListBtnEvent: function(evt) {

			if (evt.btnId === "details") {
				if (this.idDetails) {
					this._publish(this.details.getChannel("HIDE"));

					if (this.idDetails === evt.id)
						this.idDetails = null;
					else {
						this.idDetails = null;
						this._subListBtnEvent(evt);
					}
				} else {
					this.rowNode = query("[data-redmic-id='" + evt.id + "']", this.listNode)[0].parentNode.parentNode.lastChild;
					this.idDetails = evt.id;

					this._once(this._buildChannel(this.storeChannel, this.actions.ITEM_AVAILABLE),
						lang.hitch(this, function(item) {
						this._publish(this.details.getChannel("SHOW"), {
							data: item.body.data,
							node: this.rowNode
						});
					}));

					this._publish(this._buildChannel(this.storeChannel, this.actions.GET), {
						id: evt.id,
						options: {},
						target: this.target,
						requesterId: this.getOwnChannel()
					});
				}
			}
		}
	});
});
