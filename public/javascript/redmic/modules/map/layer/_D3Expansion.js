define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
], function(
	declare
	, lang
){
	return declare(null, {
		//	summary:
		//		Extensión de capas basadas en D3, para ampliar su definición.
		//	description:
		//		Desde la capa en que se importe esta extensión, se debe llamar al método '_expandD3' pasándole la
		//		instancia de D3 que queremos ampliar.

		_expandD3: function(d3) {

			this._expandD3SelectionMethods(d3);
		},

		_expandD3SelectionMethods: function(d3) {

			d3.selection.prototype.moveToFront = this._d3SelectionMoveToFront;
			d3.selection.prototype.moveUp = this._d3SelectionMoveUp;
			d3.selection.prototype.moveDown = this._d3SelectionMoveDown;
		},

		_d3SelectionMoveToFront: function() {

			var func = function() {

				if (this.parentNode) {
					this.parentNode.appendChild(this);
				} else {
					this.each(func);
				}
			};

			return this.each(func);
		},

		_d3SelectionMoveUp: function() {

			var func = function() {

				if (this.parentNode) {
					var nextSibling = this.nextSibling;
					if (nextSibling) {
						this.parentNode.insertAfter(this, nextSibling);
					}
				} else {
					this.each(func);
				}
			};

			return this.each(func);
		},

		_d3SelectionMoveDown: function() {

			var func = function() {

				if (this.parentNode) {
					var prevSibling = this.previousSibling;
					if (prevSibling) {
						this.parentNode.insertBefore(this, prevSibling);
					}
				} else {
					this.each(func);
				}
			};

			return this.each(func);
		}
	});
});
