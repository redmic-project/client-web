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
		//		Permite gestionar los errores de las peticiónes a la API

		_errorAvailable: function(res) {

			var error = res.error,
				status = error.response && error.response.status;

			if (status === 404) {
				this._goTo404();
			} /*else if (status === 500) {
				this._goTo500();
			}*/
		}
	});
});
