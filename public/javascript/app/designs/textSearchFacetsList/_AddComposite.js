define([
	"app/base/views/extensions/_CompositeInTooltipFromIconKeypad"
	, "dojo/_base/declare"
], function(
	_CompositeInTooltipFromIconKeypad
	, declare
){
	return declare(_CompositeInTooltipFromIconKeypad, {
		//	summary:
		//
		//	description:
		//

		_setCompositeConfigurations: function() {

			this.inherited(arguments);

			this.compositeConfig = this._merge([{
				formConfig: {
					dataTemplate: {
						formTitle: this.i18n.advancedSearch
					}
				}
			}, this.compositeConfig || {}]);
		},

		// TODO pisar/limpiar de manera más elegante
		_initializeAfterCompositeView: function() {},

		// TODO pisar/limpiar de manera más elegante
		_defineCompositeSubcriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.textSearch.getChannel('EXPAND_SEARCH'),
				callback: "_subTextSearchExpand"
			});
		},

		_subTextSearchExpand: function(res) {

			if (this._initFilters) {
				return;
			}

			this._publish(this.composite.getChannel("ADD_EVT"), {
				sourceNode: res.node,
				initAction: 'hide'
			});

			this._publish(this.composite.getChannel("SHOW"), {
				node: res.node
			});

			this._initFilters = true;
		}
	});
});
