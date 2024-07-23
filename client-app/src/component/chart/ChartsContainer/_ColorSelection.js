define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
	, "./_ColorSelectionItfc"

	, 'colorjs/color'
], function(
	declare
	, lang
	, aspect
	, Utilities
	, _ColorSelectionItfc
) {
	return declare(_ColorSelectionItfc, {
		//	summary:
		//		Base de extensiones para gestionar colores.

		constructor: function(args) {

			this.config = {
				colorjs: net.brehaut.Color,
				_colors: [],
				_colorUsage: {}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_initialize",
				lang.hitch(this, this._initializeColorSelection));
		},

		_initializeColorSelection: function() {

			this._colors = this._getAvailableColors() || this._colors;
			this._originalColorCount = this._colors.length;
			this._colorExpansionCount = 0;
		},

		_getFreeColor: function(id, count) {

			var retColor = count ? [] : null;

			for (var i = 0; i < this._colors.length; i++) {

				var colorIsUsed = this._checkIfColorIsUsed(i);

				if (!colorIsUsed) {

					// Si buscamos un único color
					if (!retColor) {
						retColor = [this._selectSingleColor(id, i)];
						break;

					// Si buscamos un conjunto de colores
					} else {
						retColor = this._selectComponentColor(id, i, retColor);

						if (retColor.length === count) {

							break;
						}
					}
				}

				if (i === this._colors.length - 1) {

					this._expandColorSet();
				}
			}

			return retColor;
		},

		_checkIfColorIsUsed: function(i) {

			for (var key in this._colorUsage) {

				if (this._colorUsage[key] instanceof Array) {

					if (this._colorUsage[key].indexOf(i) !== -1) {

						return true;
					}
				} else if (this._colorUsage[key] === i) {

					return true;
				}
			}
		},

		_selectSingleColor: function(id, i) {

			this._colorUsage[id] = i;

			return this._colors[i];
		},

		_selectComponentColor: function(id, i, colors) {

			if (!this._colorUsage[id]) {

				this._colorUsage[id] = [];
			}

			this._colorUsage[id].push(i);
			colors.push(this._colors[i]);

			return colors;
		},

		_expandColorSet: function() {

			this._colorExpansionCount++;

			var rounds = this._colorExpansionCount,
				expansion = this._colors.slice(0, this._originalColorCount);

			for (var i = 0; i < this._originalColorCount; i++) {

				var originalColor = expansion[i],
					generatedColor = this._generateNewColor(originalColor, rounds);

				expansion[i] = generatedColor;
			}

			this._colors = this._colors.concat(expansion);
		},

		_generateNewColor: function(originalColor, i) {

			var delta = i * 0.06,
				parity = i % 2 === 0,
				oldColor = this.colorjs(originalColor),
				newColor = oldColor[parity ? "darkenByAmount" : "lightenByAmount"](delta);

			return newColor.toCSS();
		},

		_getColor: function(id) {

			return this._colors[id];
		},

		_removeColorUsage: function(id, index) {

			if (Utilities.isValidNumber(index)) {

				this._colorUsage[id][index] = null;
			} else {

				delete this._colorUsage[id];
			}
		},

		_getColorUsage: function(id) {

			return id ? this._colorUsage[id] : this._colorUsage;
		}
	});
});
