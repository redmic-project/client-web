define([
	"app/designs/base/_Main"
	, "app/designs/externalTextSearchList/Controller"
	, "app/designs/externalTextSearchList/Layout"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/browser/bars/Total"
	, "src/component/base/_Persistence"
	, "templates/WormsList"
], function (
	_Main
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, aspect
	, Total
	, _Persistence
	, TemplateList
){
	return declare([Layout, Controller, _Persistence, _Main], {
		//	summary:
		//		main Worms.


		constructor: function (args) {

			this.config = {
				actions: {
					UPDATE_DATA: "updateData"
				},
				events: {
					UPDATE_DATA: "updateData"
				},
				ownChannel: "worms",
				// WizardStep params
				label : this.i18n.worms,
				// General params
				baseTarget: redmicConfig.services.worms,
				target: redmicConfig.services.worms,
				toRedmicTarget: redmicConfig.services.wormsToRedmic,
				idProperty: "AphiaID",
				title: this.i18n.worms
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_beforeShow", this._beforeShowMain);
		},

		_setMainConfigurations: function() {

			this.browserConfig = this._merge([{
				template: TemplateList,
				bars: [{
					instance: Total
				}],
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-download",
							btnId: "update",
							returnItem: true
						}]
					}
				}
			}, this.browserConfig || {}]);

			this.textSearchConfig = this._merge([{
				target: this.target,
				itemLabel: this.itemLabel
			}, this.textSearchConfig || {}]);
		},

		_defineMainPublications: function() {

			this.publicationsConfig.push({
				event: 'UPDATE_DATA',
				channel: this.getChannel("UPDATE_DATA")
			});
		},

		_setMainOwnCallbacksForEvents: function() {

			this._onEvt('HIDE', lang.hitch(this, this._onHideStep));
		},

		_beforeShowMain: function(request) {

			var data = request.data,
				obj = {
					data: data ? data.toString() : ""
				};

			if (request.editionMode) {
				this.editionMode = true;
			} else {
				delete this.editionMode;
			}

			if (obj.data) {
				obj.execute = true;
			}

			this._publish(this.textSearch.getChannel("SET_DEFAULT"), obj);
		},

		_onHideStep: function(evt) {

			this._publish(this.browser.getChannel("CLEAR"));
			this._publish(this.textSearch.getChannel("RESET"));
		},

		_newSearch: function(obj) {

			if (obj && obj.suggest) {
				return;
			}

			var value = obj.text,
				target = this.baseTarget;

			if (!value.length) {
				this._publish(this.browser.getChannel("CLEAR"));
				return;
			}

			if (value == parseInt(value, 10)) {
				target += "/" + value;
			} else {
				target += "/?scientificname=" + value;
			}

			this.target = target;

			this._emitEvt('REQUEST', this._getRequestObj({}));
		},

		_getRequestObj: function(request) {

			return lang.mixin(request, {
				target: this.target,
				requesterId: this.getOwnChannel()
			});
		},

		_dataAvailable: function(response, resWrapper) {

			if (!response.data.length && (Object.keys(response.data).length > 0)) {
				response.data = [response.data];
				response.total = 1;
			}

			this._emitEvt('SEND_DATA', {
				res: response,
				target: this.baseTarget
			});
		},

		_chkTargetIsMine: function(response) {

			return response.target.indexOf(this.baseTarget) >= 0;
		},

		_errorAvailable: function(error) {

		},

		_updateCallback: function(data) {

			if (!data || !data.item) {
				return;
			}

			this._emitEvt('LOADING', {
				global: true
			});

			this._emitEvt('SAVE', {
				target: this.toRedmicTarget,
				id: data.item.AphiaID,
				data: {}
			});
		},

		_afterSaved: function(result) {

			this._emitEvt('LOADED');

			this._emitEvt('UPDATE_DATA', {
				data: result.data
			});
		}
	});
});
