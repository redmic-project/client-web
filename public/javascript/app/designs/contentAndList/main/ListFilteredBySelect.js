define([
	"app/base/views/extensions/_AddSelectInput"
	, "app/designs/base/_Main"
	, "app/designs/contentAndList/Controller"
	, "app/designs/contentAndList/Layout"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/browser/_Select"
	, "templates/LoadingCustom"
], function (
	_AddSelectInput
	, _Main
	, Controller
	, Layout
	, declare
	, lang
	, aspect
	, _Filter
	, _Select
	, TemplateCustom
){
	return declare([Layout, Controller, _Main, _Filter, _AddSelectInput], {
		//	summary:
		//

		constructor: function(args) {

			this.config = {
				events: {
					CHANGE_BROWSER_NO_DATA_MESSAGE: "changeBrowserNoDataMessage"
				},

				// General params
				idProperty: "path",

				ownChannel: "ListFilteredBySelect"
			};

			lang.mixin(this, this.config);

			aspect.after(this, "_beforeShow", lang.hitch(this, this._beforeListFilteredBySelectShow));
		},

		_setMainConfigurations: function() {

			this.browserConfig = this._merge([{
				browserExts: [_Select],
				browserConfig: {
					noDataMessage: TemplateCustom({
						message: this.i18n.noAssociatedData,
						iconClass: "fr fr-no-data"
					}),
					instructionDataMessage: TemplateCustom({
						message: this.i18n.selectFilter,
						iconClass: "fr fr-crab"
					})
				}
			}, this.browserConfig || {}]);

			this.browserNoDataMessage = this.browserConfig.browserConfig.noDataMessage;
			this.browserInstructionDataMessage = this.browserConfig.browserConfig.instructionDataMessage;

			this.browserConfig.browserConfig.noDataMessage = this.browserInstructionDataMessage;

			this.selectInputConfig = this._merge([{
				parentChannel: this.getChannel(),
				idProperty: this.idProperty,
				target: this.target,
				_inputProps: {
					labelAttr: "name",
					idProperty: "path"
				},
				associatedIds: [this.getOwnChannel()]
			}, this.selectInputConfig || {}]);

			this.filterConfig = this._merge([{
				refreshToInit: true,
				requesterId: this.getOwnChannel()
			}, this.filterConfig || {}]);
		},

		_defineMainPublications: function () {

			this.publicationsConfig.push({
				event: 'CHANGE_BROWSER_NO_DATA_MESSAGE',
				channel: this.browser.getChildChannel("browser", "UPDATE_NO_DATA_TEMPLATE")
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.browser.getChildChannel('filter', 'SET_PROPS'), {
				requesterId: this.browser.browser.getOwnChannel()
			});

			this._publish(this.selectInput.getChannel("SHOW"), {
				node: this.topNode.domNode
			});
		},

		_beforeListFilteredBySelectShow: function() {

			this._emitEvt('CLEAR_SELECTION');
		},

		_onSelectInputChange: function(obj) {

			this._emitEvt('CLEAR_SELECTION');

			var value = obj.value;

			if (value && (!this._lastValue || this._lastValue !== value)) {

				this._lastValue = value;

				this._emitEvt('CHANGE_BROWSER_NO_DATA_MESSAGE', {
					template: this.browserNoDataMessage
				});

				this.changedInputValue && this.changedInputValue(value);
			} else {
				delete this._lastValue;

				this._emitEvt('CHANGE_BROWSER_NO_DATA_MESSAGE', {
					template: this.browserInstructionDataMessage
				});

				this._publish(this.browser.getChildChannel("browser", "CLEAR"));
			}
		}
	});
});
