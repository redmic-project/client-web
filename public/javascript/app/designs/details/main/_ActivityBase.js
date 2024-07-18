define([
	"app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddTitle"
	, "dojo/_base/declare"
	, "dojo/_base/lang"

], function(
	_Main
	, Controller
	, Layout
	, _AddTitle
	, declare
	, lang
){
	return declare([Layout, Controller, _Main, _AddTitle], {
		//	summary:
		//		Base de vistas detalle de la rama de actividades.

		constructor: function(args) {

			this.config = {
				_titleRightButtonsList: [{
					icon: "fa-print",
					btnId: "report",
					title: this.i18n.printToPdf
				}],

				documentTarget: "documents",
				contactTarget: "contacts",
				organisationTarget: "organisations",
				platformTarget: "platforms"
			};

			lang.mixin(this, this.config, args);
		},

		_clearModules: function() {

			this._publish(this._getWidgetInstance('info').getChannel('CLEAR'));
			this._publish(this._getWidgetInstance('organisationList').getChannel('CLEAR'));
			this._publish(this._getWidgetInstance('contactList').getChannel('CLEAR'));
			this._publish(this._getWidgetInstance('platformList').getChannel('CLEAR'));
			this._publish(this._getWidgetInstance('documentList').getChannel('CLEAR'));
		},

		_refreshModules: function() {

			this._checkPathVariableId();

			this._emitEvt('GET', {
				target: this.target,
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});

			this._targetListRank && this._refreshChildrenDataModules();
		},

		_refreshChildrenDataModules: function() {

			var target = lang.replace(this._targetListRank, {
					id: this.pathVariableId
				}),
				widgetInstance = this._getWidgetInstance('childActivitiesOrProjects');

			this._publish(widgetInstance.getChannel("UPDATE_TARGET"), {
				target: target
			});

			this._publish(widgetInstance.getChildChannel("filter", "REFRESH"));
		},

		_itemAvailable: function(res) {

			var documents = res.data.documents;
			if (documents && documents.length) {
				for (var i = 0; i < documents.length; i++) {
					this._emitEvt('INJECT_ITEM', {
						data: documents[i].document,
						target: this.documentTarget
					});
				}
			}

			var contacts = res.data.contacts;
			if (contacts && contacts.length) {
				this._emitEvt('INJECT_DATA', {
					data: contacts,
					target: this.contactTarget
				});
			}

			var platforms = res.data.platforms;
			if (platforms && platforms.length) {
				this._emitEvt('INJECT_DATA', {
					data: platforms,
					target: this.platformTarget
				});
			}

			var organisations = res.data.organisations;
			if (organisations && organisations.length) {
				this._emitEvt('INJECT_DATA', {
					data: organisations,
					target: this.organisationTarget
				});
			}
		}
	});
});
