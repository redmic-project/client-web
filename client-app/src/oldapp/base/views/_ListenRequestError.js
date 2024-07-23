define([
	"dojo/_base/declare"
],
function(
	declare
){
	return declare(null, {
		//	summary:
		//		Gestiona los errores de los request
		//	description:
		//		Permite gestionar los errores de las peticiones a la API

		_errorAvailable: function(error, status) {

			if (status === 404) {
				this._goTo404();
			} /*else if (status === 500) {
				this._goTo500();
			}*/
		}
	});
});
