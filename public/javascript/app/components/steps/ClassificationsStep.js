define([
	"app/designs/list/_AddFilter"
	, "app/designs/list/Controller"
	, "app/designs/list/layout/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/browser/_Select"
	, "redmic/modules/browser/bars/Pagination"
	, "redmic/modules/layout/wizard/_CompleteBySelection"
	, "templates/DomainList"
], function(
	_AddFilter
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, _Select
	, Pagination
	, _CompleteBySelection
	, templateList
){
	return declare([Layout, Controller, _AddFilter, _CompleteBySelection], {
		//	summary:
		//		Step para las clasificaciones de los objectTypes.

		constructor: function(args) {

			this.config = {
				idProperty: "path",
				browserExts: [_Select],
				title: this.i18n.objectGroup,
				target: redmicConfig.services.objectType
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				template: templateList,
				associatedIds: [this.getOwnChannel()],
				bars: [{
					instance: Pagination
				}]
			}, this.browserConfig || {}]);

			this.filterConfig = this._merge([{
				requesterId: this.getOwnChannel()
			}, this.filterConfig || {}]);
		},

		_onNewResults: function(res) {

			var results = res.results,
				objectGroup;

			if (!results) {
				return;
			}

			objectGroup = results.objectGroup;

			if (objectGroup && this._lastData !== objectGroup) {
				this.noEditable = false;
				this._lastData = objectGroup;

				this._once(this.browser.getChannel('REFRESHED'), lang.hitch(this, this._subRefreshedBrowser));

				this._emitEvt('ADD_TO_QUERY', {
					query: {
						terms: {
							parentPath: objectGroup,
							children: false
						}
					},
					refresh: true
				});
			}
		},

		_subRefreshedBrowser: function(res) {

			if (res.total === 0) {

				this._emitEvt("CLEAR_SELECTION");
				this._emitEvt("SELECT", [this._wizardResults.objectGroup]);

				this.noEditable = true;

				this.statusFlags.shown && this._emitEvt('GO_FORWARD');
			} else {

				this._totalSelected = 0;
				this._results = [];

				this._emitChangeResults();
			}
		}
	});
});
