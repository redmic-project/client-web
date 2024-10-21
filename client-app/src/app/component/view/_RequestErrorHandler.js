define([
	'dojo/_base/declare'
],
function(
	declare
) {

	return declare(null, {
		//	summary:
		//		Gestiona los errores de los request hacia la API

		_errorAvailable: function(error, status) {

			if (status === 404) {
				this._goTo404();
			} /*else if (status === 500) {
				this._goTo500();
			}*/
		},

		_goTo404: function() {

			globalThis.location.href = '/404';
		}
	});
});
