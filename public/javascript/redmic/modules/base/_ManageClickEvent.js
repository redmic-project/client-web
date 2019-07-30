define([
	'dojo/_base/declare'
], function(
	declare
) {

	return declare(null, {
		//	summary:
		//		Base de utilidades para gestionar los eventos de click recibidos por los módulos.

		_getClickTargets: function(event) {

			var targetPath = event.path || (event.composedPath && event.composedPath()) || [],
				targets = [
					event.currentTarget.activeElement
				];

			if (!targetPath.length) {
				var eventTarget = event.target || event.srcElement,
					eventTargetParent = eventTarget.parentElement;

				targetPath.push(eventTarget, eventTargetParent);
			}

			return targets.concat(targetPath);
		}
	});
});
