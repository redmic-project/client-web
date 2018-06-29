define([
	"app/base/views/extensions/_LocalSelectionView"
	, "app/designs/textSearchList/Controller"
	, "app/designs/textSearchList/layout/BasicTopZone"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_ShowInPopup"
	, "redmic/modules/form/input/_SelectOnPopupImpl"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_HierarchicalSelect"
	, "redmic/modules/browser/HierarchicalImpl"
], function(
	_LocalSelectionView
	, Controller
	, Layout
	, declare
	, lang
	, _ShowInPopup
	, _SelectOnPopupImpl
	, _ButtonsInRow
	, _HierarchicalSelect
	, HierarchicalImpl
){
	return declare(_SelectOnPopupImpl, {
		//	summary:
		//		Implementación de input .

		constructor: function(args) {

			this.config = {
				ownChannel: "selectOnListPopup"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.contentPopupConfig = this._merge([{
				parentChannel: this.getChannel(),
				selectorChannel: this.getChannel(),
				target: this.target,
				title: this.i18n[this._inputProps.title] ? this.i18n[this._inputProps.title] : this._inputProps.title,
				idProperty: this.idProperty,
				initDataRefresh: true,
				browserBase: [HierarchicalImpl, _HierarchicalSelect, _ButtonsInRow],
				filterConfig: {
					requesterId: this.getOwnChannel(),
					initQuery: {
						size: null,
						from: null
					}
				},
				browserConfig: {
					initialDataSave: true,
					simpleSelection: true,
					template: this._inputProps.template,
					associatedIds: [this.getOwnChannel()]
				},
				width: 8,
				height: "md",
				textSearchConfig: {
					itemLabel: null
				}
			}, this._inputProps.contentPopupConfig || {}]);
		},

		_showContentInPopup: function() {

			if (!this.instanceContentPopup) {
				this.contentPopupConfig.target = this.target;
				this.instanceContentPopup = new declare([Layout, Controller, _LocalSelectionView]).
					extend(_ShowInPopup)(this.contentPopupConfig);

				this._subscribe(this.instanceContentPopup.getChannel("HIDDEN"), lang.hitch(this, this._subBrowserHidden));

				this._publish(this.instanceContentPopup.getChildChannel("filter", "REFRESH"));
			}

			this._cleanInstancePopup();

			this._publish(this.instanceContentPopup.getChannel("SHOW"));

			this._publish(this.instanceContentPopup.getChildChannel("browser", "REFRESH"), {
				initData: true
			});

			this._value && this._publish(this.instanceContentPopup.getChannel("SELECTED"), {
				"success": true,
				"body": {
					"ids": [this._value],
					"selectionTarget": this.target,
					"total": 1
				}
			});

			this._subscriptionOnceSelected = this._once(this.instanceContentPopup.getChannel("SELECTED"),
				lang.hitch(this, this._subSelectedBrowser));
		},

		_cleanInstancePopup: function() {

			this._publish(this.instanceContentPopup.getChannel("CLEAR_SELECTION"));

			this._publish(this.instanceContentPopup.getChildChannel("textSearch", "RESET"));

			this._publish(this.instanceContentPopup.getChildChannel("browser", "CLEAR"));
		},

		_subBrowserHidden: function(res) {

			this._subscriptionOnceSelected.channel && this._unsubscribe(this._subscriptionOnceSelected);
		},

		_subSelectedBrowser: function(res) {

			if (!res.body.ids) {
				return;
			}

			this._publish(this.instanceContentPopup.getChannel("HIDE"));

			this._setInput(res.body.ids[0]);
		},

		_setInput: function(value) {

			if (!value) {
				this._inputInstance && this._inputInstance.set(this.valuePropertyName, "");
				this._setValue("");
				return;
			}

			if (!this.instanceContentPopup) {
				return;
			}

			this._once(this.instanceContentPopup.getChildChannel("browser", "GOT_ITEM"), lang.hitch(this, this._subGotItem, value));

			this._publish(this.instanceContentPopup.getChildChannel("browser", "GET_ITEM"), {
				idProperty: value
			});
		},

		_subGotItem: function(value, res) {

			var item = res.item;

			if (item) {
				this._inputInstance && this._inputInstance.set(this.valuePropertyName, item[this._inputProps.labelAttr]);
				this._setValue(item[this.idProperty]);
			} else {
				this._inputInstance && this._inputInstance.set(this.valuePropertyName, value);
				this._setValue(value);
			}
		}
	});
});
