define([
	"app/designs/mapWithSideContent/Controller"
	, "app/designs/mapWithSideContent/layout/MapAndContent"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/map/_LeafletDraw"
], function(
	Controller
	, Layout
	, declare
	, lang
	, _LeafletDraw
) {

	return declare([Layout, Controller], {
		//	summary:
		//		Vista base para añadir geometría.
		//	description:
		//		Permite mostrar y editar datos geográficos.

		constructor: function (args) {

			this.config = {
				label: this.i18n.addGeomSite,
				mapExts: [_LeafletDraw]
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._loadForm();
		},

		_instanceDataToResult: function(data) {

			this._publish(this.viewForm.getChannel("DATA_TO_RESULT"), {
				data: data
			});
		},

		_doFlush: function() {

			this._publish(this.viewForm.getChannel("SUBMIT"));
		},

		_subSubmitted: function(res) {

			var obj = {
				step: this.stepId,
				results: null,
				status: true
			};

			if (res.data) {
				this._results = res.data;
				obj.results = this.getStepResults().geometry;
			} else if (res.error) {
				obj.status = false;
				obj.error = res.error;
			}

			this._emitEvt('FLUSH', obj);
		},

		_loadForm: function() {

			if (!this.type) {
				return;
			}

			this._emitEvt("LOADING", {
				global: true
			});

			this._createForm(this.type);

			this._once(this.viewForm.getChannel("SHOWN"), lang.hitch(this, this._onceFormShown));

			this._publish(this.viewForm.getChannel("SHOW"), {
				node: this.contentNode
			});
		},

		_onceFormShown: function() {

			this._emitEvt("LOADED");
		},

		_createForm: function(type) {

			this._deleteForm();

			this.viewForm = new type({
				parentChannel: this.getChannel(),
				mapChannel: this.map.getChannel(),
				modelChannel: this.modelChannel
			});

			this._formSubscriptions = this._setSubscriptions([{
				channel: this.viewForm.getChannel("FORM_STATUS"),
				callback: "_subFormStatus"
			},{
				channel: this.viewForm.getChannel("SUBMITTED"),
				callback: "_subSubmitted"
			}]);
		},

		_deleteForm: function() {

			if (!this.viewForm) {
				return;
			}

			this._publish(this.viewForm.getChannel("HIDE"));

			this._removeSubscriptions(this._formSubscriptions);

			delete this.viewForm;
		},

		_subFormStatus: function(res) {

			this._isCompleted = res._isCompleted;

			this._results = true;

			this._emitEvt('REFRESH_STATUS');
		},

		_clearStep: function() {

			this._publish(this.viewForm.getChannel("CLEAR"));
		},

		_resetStep: function() {

			this._publish(this.viewForm.getChannel("RESET"));
		}
	});
});
