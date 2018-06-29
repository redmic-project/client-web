define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	declare
	, lang
){
	return declare(null, {
		//	summary:
		//		Extensión para los elementos comunes en edición de datos.

		_cleanNotDesiredProps: function(item) {

			if (!this.propsToClean) {
				return;
			}

			for (var i = 0; i < this.propsToClean.length; i++) {
				this._cleanProp(item, this.propsToClean[i]);
			}
		},

		_cleanProp: function(item, prop) {

			var propSplitted = prop.split(".");

			if (propSplitted.length > 1) {
				this._cleanProp(item[propSplitted[0]], propSplitted[1]);
			} else {
				var cleanValue = null;

				if (typeof item[prop] === "object") {
					if (item[prop] instanceof Array) {
						cleanValue = [];
					} else {
						cleanValue = {};
					}
				}
				item[prop] = cleanValue;
			}
		}
	});
});
