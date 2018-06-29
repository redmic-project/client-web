define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	declare
	, lang
){
	return declare(null, {
		//	summary:
		//		Base para todas las interfaces de módulos.
		//	description:
		//		Genera los métodos no definidos por el módulo (o por su implementación, bases, extensiones, etc.) pero
		//		si presentes en su interfaz, para que estén definidos.

		constructor: function(args) {

			this.config = {
				debug: window.env ? window.env.debug : false
			};

			lang.mixin(this, this.config, args);

			this._generateUndefinedMethods();
		},

		_generateUndefinedMethods: function() {

			var methodsToImplement = this._getMethodsToImplement ? this._getMethodsToImplement() : null;

			if (!methodsToImplement) {
				return;
			}

			for (var methodName in methodsToImplement) {
				if (!this[methodName]) {
					this[methodName] = lang.hitch(this, this._onNotImplementedMethod, methodName,
						methodsToImplement[methodName]);
				}
			}
		},

		_onNotImplementedMethod: function(method, props) {

			this.debug && this._showNotImplementedMethodWarning(method, props);
		},

		_showNotImplementedMethodWarning: function(method, props) {

			console.warn("Not implemented method '%s' at module '%s' with this definition: %O", method,
				this.getChannel(), props);
		}
	});
});
