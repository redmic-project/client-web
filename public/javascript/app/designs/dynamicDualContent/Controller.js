define([
	"app/base/views/_View"
	, "app/designs/base/_Controller"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "dojo/promise/all"
], function (
	_View
	, _Controller
	, declare
	, lang
	, Deferred
	, all
){
	return declare([_Controller, _View], {
		//	summary:
		//		Controlador de diseño con contenido dual y dinámico.

		constructor: function(args) {

			this.config = {
				ownChannel: "dynamicDualContent",
				controllerEvents: {
					PRIMARY_CONTENT_SET: "primaryContentSet",
					SECONDARY_CONTENT_SET: "secondaryContentSet"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_initializeController: function() {

			this._primaryContentSetDfd = new Deferred();
			this._secondaryContentSetDfd = new Deferred();
		},

		_setControllerOwnCallbacksForEvents: function() {

			this._onEvt('PRIMARY_CONTENT_SET', lang.hitch(this, this._onPrimaryContentSet));
			this._onEvt('SECONDARY_CONTENT_SET', lang.hitch(this, this._onSecondaryContentSet));
		},

		//	TODO al definirlo así, cualquiera que herede de este controller y defina su propio '_afterShow' va a pisar
		//	este. No se hace un before o after porque necesitamos devolver en el original un dfd, pensar (quizá con un
		//	aspect.around??)
		_afterShow: function() {

			return all([this._primaryContentSetDfd, this._secondaryContentSetDfd]);
		},

		_onPrimaryContentSet: function(changeObj) {

			if (this._primaryContentSetDfd.isFulfilled()) {
				this._primaryContentSetDfd = new Deferred();
			}

			this._hideOldContent(changeObj.oldValue);

			this._once(this.primaryContent.getChannel("SHOWN"), lang.hitch(this, function() {

				if (!this._primaryContentSetDfd.isFulfilled()) {
					this._primaryContentSetDfd.resolve();
				}
				this._emitEvt("RESIZE");
			}));

			this._publish(this.primaryContent.getChannel("SHOW"), {
				node: this._getPrimaryNode()
			});
		},

		_onSecondaryContentSet: function(changeObj) {

			if (this._secondaryContentSetDfd.isFulfilled()) {
				this._secondaryContentSetDfd = new Deferred();
			}

			this._hideOldContent(changeObj.oldValue);

			this._once(this.secondaryContent.getChannel("SHOWN"), lang.hitch(this, function() {

				if (!this._secondaryContentSetDfd.isFulfilled()) {
					this._secondaryContentSetDfd.resolve();
				}
				this._emitEvt("RESIZE");
			}));

			this._publish(this.secondaryContent.getChannel("SHOW"), {
				node: this._getSecondaryNode()
			});
		},

		_hideOldContent: function(oldContent) {

			if (oldContent) {
				this._publish(oldContent.getChannel("HIDE"));
			}
		},

		_getPrimaryNode: function() {

			return this.primaryNode;
		},

		_getSecondaryNode: function() {

			return this.secondaryNode;
		}
	});
});
