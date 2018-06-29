define([
	"dojo/has"
	, "dojo/sniff"
], function(
	has
){
	return {

		isSupported: function() {
			if ((this.ie() || this.chrome() || this.ff() || this.opera() || this.safari() || this.edge()) &&
				this._supportsHtml5Storage()) {
					return false;
			}

			return true;
		},

		ie: function() {
			return (has("trident") < 7);
		},

		chrome: function() {
			return (has("chrome") < 31);
		},

		ff: function() {
			return (has("ff") < 28);
		},

		opera: function() {
			return (has("opera") < 17);
		},

		safari: function() {
			return (has("safari") < 8);
		},

		edge: function() {
			return (has("edge") < 12);
		},

		_supportsHtml5Storage: function() {
			//	summary:
			//		Comprueba si el navegador usado soporta HTML5 Storage.
			//	tags:
			//		private
			//	returns:
			//		Devuelve si lo soporta o no.

			try {
				return 'localStorage' in window && window.localStorage !== null;	// return Boolean
			} catch (e) {
				return false;	// return Boolean
			}
		}
	};
});
