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

			var propSplitted = prop.split('.');

			if (propSplitted.length > 1) {
				var currentPropertyKey = propSplitted[0],
					nextPropertyKeys = propSplitted.slice(1).join('.');

				if (currentPropertyKey === '{i}') {
					for (var i = 0; i < item.length; i++) {
						var currentPropertyValue = item[i];
						this._cleanProp(currentPropertyValue, nextPropertyKeys);
					}
				} else {
					var currentPropertyValue = item[currentPropertyKey];
					this._cleanProp(currentPropertyValue, nextPropertyKeys);
				}
			} else {
				var cleanValue = null;

				if (typeof item[prop] === "object" && item[prop] !== null) {
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
