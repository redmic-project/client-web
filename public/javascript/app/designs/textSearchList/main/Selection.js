define([
	'alertify/alertify.min'
	, "app/base/views/extensions/_OnShownAndRefresh"
	, "app/designs/base/_Main"
	, "app/designs/textSearchList/Controller"
	, "app/designs/textSearchList/layout/BasicTopZone"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Store"
	, "redmic/modules/base/_Persistence"
	, "templates/SelectionList"
], function(
	alertify
	, _OnShownAndRefresh
	, _Main
	, Controller
	, Layout
	, declare
	, lang
	, _Store
	, _Persistence
	, TemplateList
) {

	return declare([Layout, Controller, _Main, _Store, _Persistence, _OnShownAndRefresh], {
		//	summary:
		//		Extensión para establecer la vista de selección para cargar selecciones guardadas
		//

		constructor: function(args) {

			this.config = {
				omitLoading: true,
				mainActions: {
					UPDATE_DATA: "updateData"
				},
				mainEvents: {
					UPDATE_DATA: "updateData"
				},

				title: this.i18n.restoreSelection,

				ownChannel: "loadSelection"
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.browserConfig = this._merge([{
				template: TemplateList,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-download",
							btnId: "load",
							returnItem: true
						},{
							icon: "fa-trash-o",
							btnId: "remove",
							returnItem: true
						}]
					}
				}
			}, this.browserConfig || {}]);
		},

		_defineMainSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getChannel("UPDATE_TARGET"),
				callback: "_subUpdateTarget"
			});
		},

		_defineMainPublications: function() {

			this.publicationsConfig.push({
				event: 'UPDATE_DATA',
				channel: this.getChannel("UPDATE_DATA")
			});
		},

		_subUpdateTarget: function(res) {

			this.target = res.target;

			this._emitEvt('UPDATE_TARGET', res);
		},

		_loadCallback: function(data) {

			if (!data || !data.item) {
				return;
			}

			this._emitEvt('UPDATE_DATA', {
				data: data.item,
				target: this.target
			});
		},

		_removeCallback: function(data) {

			if (!data || !data.id) {
				return;
			}

			alertify.confirm(this.i18n.deleteConfirmationTitle,
				this.i18n.deleteConfirmationMessage,
				lang.hitch(this, function(id) {

					this._emitEvt('REMOVE', {
						target: this.target,
						id: id
					});
				}, data.id),
				lang.hitch(this, function(id) {

					this._emitEvt('COMMUNICATION', {
						description: this.i18n.cancelledAlert
					});
				}, data.id)).set("labels", {
					ok: this.i18n.ok,
					cancel: this.i18n.cancel
				});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('REFRESH');
		}
	});
});
