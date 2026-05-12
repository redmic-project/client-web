define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
], function(
	declare
	, lang
) {

	return declare(null, {
		//	summary:
		//		Extensión para definir los predicados por defecto.
		//	description:
		//		Define los predicados básicos que decidirán si se entra a una suscripción o no.


		_chkActionCanBeTriggered: function() {

			var channel = arguments[arguments.length - 2]?.namespace,
				action = channel?.split(this.channelSeparator).pop();

			return this._chkModuleIsOn() && this._chkActionIsOn(action);
		},

		_chkModuleIsOn: function() {

			return !this._getPaused();
		},

		_chkActionIsOn: function(action) {

			return action?.length && !this.actionsPaused[action];
		},

		_chkTargetIsValid: function(obj) {

			// TODO eliminar cuando el server no responda con envoltorio body
			var data = obj.body || obj;

			var targetIsValid = data && data.target;

			if (!targetIsValid) {
				console.error('Received publication with invalid target at module "%s":', this.getChannel(), data);
			}

			return targetIsValid;
		},

		_chkTargetIsMine: function(res) {

			// TODO eliminar cuando el server no responda con envoltorio body
			var response = res.body || res;
			return this._chkTargetIsValid(res) && this._targetIsMine(response.target);
		},

		_targetIsMine: function(target, /*string?*/ customOwnTarget) {

			const cleanTarget = this._cleanTrailingSlash(target);

			if (target.length === cleanTarget.length) {
				target += '/';
			}

			const ownTarget = customOwnTarget ?? this.target;
			if (ownTarget instanceof Array) {
				return ownTarget.includes(target) || ownTarget.includes(cleanTarget);
			}

			return ownTarget && (ownTarget === target || ownTarget === cleanTarget);
		},

		_chkRequesterIsMe: function(res) {

			// TODO eliminar cuando el server no responda con envoltorio body
			var response = res.body || res;
			var requesterId = response && response.requesterId;

			return !requesterId || (requesterId === this.getOwnChannel() || requesterId === this.getChannel() ||
				this.associatedIds.indexOf(requesterId) !== -1);
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
		},

		_chkSuccessfulStatus: function(status) {

			return status >= 200 && status < 400;
		}
	});
});
