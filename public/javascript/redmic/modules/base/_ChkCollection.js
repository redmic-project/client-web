define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
], function(
	declare
	, lang
){
	return declare(null, {
		//	summary:
		//		Extensión para definir los predicados por defecto.
		//	description:
		//		Define los predicados básicos que decidirán si se entra a una suscripción o no.


		_chkActionCanBeTriggered: function() {

			var channel = arguments[arguments.length - 1].namespace,
				action = channel.split(this.channelSeparator).pop();

			return this._chkModuleIsOn() && this._chkActionIsOn(action);
		},

		_chkModuleIsOn: function() {

			return !this._getPaused();
		},

		_chkActionIsOn: function(action) {

			return !this.actionsPaused[action];
		},

		_chkSuccessful: function(response) {

			if (response && (response.success === undefined || response.success)) {
				return true;
			}

			return false;
		},

		_chkTargetIsMine: function(response) {

			if (!this._chkSuccessful(response)) {
				return false;
			}

			var body = response.body;
			if (body && body.target && !this._targetIsMine(body.target)) {
				return false;
			}

			return true;
		},

		_chkErrorTargetIsMine: function(response) {

			if (this._chkSuccessful(response)) {
				return false;
			}

			var error = response.error;
			if (error && error.target && !this._targetIsMine(error.target)) {
				return false;
			}

			return true;
		},

		_targetIsMine: function(target) {

			var cleanTarget = this._cleanTrailingSlash(target);

			if (target.length === cleanTarget.length) {
				target += '/';
			}

			if (this.target instanceof Array) {
				return (this.target.indexOf(target) !== -1 || this.target.indexOf(cleanTarget) !== -1);
			}

			return (this.target === target || this.target === cleanTarget);
		},

		_chkRequesterIsMe: function(response) {

			if (!this._chkSuccessful(response)) {
				return false;
			}

			var body = response.body;
			if (body && body.requesterId && ((body.requesterId !== this.getOwnChannel()) &&
				(this.associatedIds.indexOf(body.requesterId) < 0))) {
				return false;
			}

			return true;
		},

		_chkErrorRequesterIsMe: function(response) {

			if (this._chkSuccessful(response)) {
				return false;
			}

			var error = response.error;
			if (error && error.requesterId && ((error.requesterId !== this.getOwnChannel()) &&
				(this.associatedIds.indexOf(error.requesterId) < 0))) {
				return false;
			}

			return true;
		},

		_chkTargetAndRequester: function(response) {

			if (this._chkTargetIsMine(response) && this._chkRequesterIsMe(response)) {
				return true;
			}

			return false;
		},

		_chkErrorTargetAndRequester: function(response) {

			if (this._chkErrorTargetIsMine(response) && this._chkErrorRequesterIsMe(response)) {
				return true;
			}

			return false;
		},

		_chkPublicationIsForMe: function(res) {

			if (!res.id || res.id === this.getOwnChannel()) {
				return true;
			}
		},

		_cleanTrailingSlash: function(target) {

			if (target && target[target.length - 1] === '/') {
				return target.slice(0, -1);
			}

			return target;
		},

		_chkChildActionMustBeListened: function(res, channelInfo) {

			if (!res || !channelInfo) {
				return false;
			}

			var currentChannel = this.getChannel(),
				currentChannelDepth = this._getChannelDepth(currentChannel),
				triggeredChannel = channelInfo.namespace,
				triggeredChannelDepth = this._getChannelDepth(triggeredChannel);

			if (triggeredChannelDepth !== currentChannelDepth + 2) {
				return false;
			}

			var triggeredAction = this._getActionFromChannel(triggeredChannel),
				allowedActionsMapped = this._childrenActionsAllowedToListen.map(lang.hitch(this, function(item) {

					return this.actions[item];
				}));

			return allowedActionsMapped.indexOf(triggeredAction) !== -1;
		}
	});
});
