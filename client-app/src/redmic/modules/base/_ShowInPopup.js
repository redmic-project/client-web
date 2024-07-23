define([
	'dijit/layout/ContentPane'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/promise/all'
	, 'RWidgets/layout/DialogComplex'
	, 'RWidgets/layout/DialogSimple'
	, 'put-selector/put'
], function(
	ContentPane
	, lang
	, Deferred
	, all
	, DialogComplex
	, DialogSimple
	, put
) {

	return {
		//	summary:
		//		Extensión de módulos mostrables para que lo hagan dentro de un popup.

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('ANCESTOR_HIDE', lang.hitch(this, this._onModuleHide));
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this.popupConfig = this._merge([{
				width: this.width || 6,
				height: this.height || 'lg',
				reposition: this.reposition,
				title: this.title || this.ownChannel,
				onCancel: lang.hitch(this, this._publish, this.getChannel('HIDE'))
			}, this.popupConfig || {}]);
		},

		postCreate: function() {

			this.inherited(arguments);

			var definition = this.lockBackground ? DialogComplex : DialogSimple;
			this._popupInstance = new definition(this.popupConfig);

			this._popupInstance.on('resize', lang.hitch(this, this._groupEventArgs, 'RESIZE'));

			this._createContainer();
		},

		_createContainer: function() {

			this.popupBody = new ContentPane();

			this._moduleParentNode = this.popupBody.domNode;
			put(this.popupBody.domNode, '.flex');
		},

		_getCurrentParentNode: function(req) {

			return this._moduleParentNode;
		},

		_beforeShow: function(req) {

			if (!this._getShown()) {
				return this.inherited(arguments);
			}

			var hiddenDfd = new Deferred(),
				originalDfd = this.inherited(arguments) || true,
				returnDfd = all(hiddenDfd, originalDfd);

			this._onceEvt('HIDE', lang.hitch(hiddenDfd, hiddenDfd.resolve));

			this._publish(this.getChannel('HIDE'));

			return returnDfd;
		},

		_afterShow: function(req) {

			var afterOriginalDfd = function(innerReturnDfd) {

				var dfdPopup = this._popupInstance.show();

				dfdPopup.then(lang.hitch(this, function(innerInnerReturnDfd) {

					this._popupInstance.set('centerContent', this.popupBody);
					innerInnerReturnDfd.resolve();
				}, innerReturnDfd));
			};

			var dfd = this.inherited(arguments),
				returnDfd = new Deferred(),
				cbk = lang.hitch(this, afterOriginalDfd, returnDfd);

			if (dfd && dfd.then) {
				dfd.then(cbk);
			} else {
				cbk();
			}

			return returnDfd;
		},

		_resize: function(evt) {

			this.inherited(arguments);

			if (!this._popupInstance || !this._popupInstance.open) {
				return;
			}

			var node = evt.target,
				size = {
					width: node.innerWidth,
					height: node.innerHeight
				};

			this._popupInstance.resizeContainer(size);
		},

		_onModuleHide: function() {

			this.inherited(arguments);

			this._popupInstance.hide();

			if (this.lockBackground && this.popupBody._beingDestroyed) {
				this._createContainer();
			}
		}
	};
});
