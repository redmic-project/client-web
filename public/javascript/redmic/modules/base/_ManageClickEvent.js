define([
	'dojo/_base/declare'
	, 'dojo/on'
], function(
	declare
	, on
) {

	return declare(null, {
		//	summary:
		//		Base de utilidades para gestionar los eventos de click recibidos por los módulos.

		_listenGlobalClicks: function(callback) {

			if (!callback) {
				console.error('Callback not provided to listen global clicks at module "%s"', this.getChannel());
				return;
			}

			this._listenGlobalClicksHandler = on.pausable(this.ownerDocumentBody, 'click', callback);

			return this._listenGlobalClicksHandler;
		},

		_getClickTargets: function(event) {

			var targetPath = event.path || (event.composedPath && event.composedPath()) || [],
				currTarget = event.currentTarget || event.target,
				targets = [
					currTarget.activeElement
				];

			if (!targetPath.length) {
				var currTargetParent = currTarget.parentElement;
				targetPath.push(currTarget, currTargetParent);
			}

			return targets.concat(targetPath);
		},

		_checkClickBelongsToNode: function(event, node) {

			var targets = this._getClickTargets(event);

			return targets.indexOf(node) !== -1;
		},

		_checkClickBelongsToNodeWithClass: function(event, className) {

			var targets = this._getClickTargets(event);

			for (var i = 0; i < targets.length; i++) {
				var target = targets[i];
				if (!target) {
					continue;
				}
				var targetClasses = target.classList;
				if (targetClasses && targetClasses.contains(className)) {
					return true;
				}
			}
			return false;
		}
	});
});
