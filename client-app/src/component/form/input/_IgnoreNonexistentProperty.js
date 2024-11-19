define([
	"dojo/_base/declare"
], function(
	declare
){
	return declare(null, {
		//	summary:
		//		Extensión para el input que comprueba si existe la propiedad en el modelo para crearse.

		_propertyInstance: function() {

			if (this.modelChannel) {
				this._emitEvt("GET_PROPERTY_INSTANCE", {
					key: this.propertyName,
					ignoreNonexistent: true
				});
			}
		},

		_subGotPropertyInstance: function(res) {

			if (res.instance)
				this.inherited(arguments);
			else
				this._noPropertyInstance();
		},

		_noPropertyInstance: function() {

			this.propertyPath = null;
			this.propertyName = null;

			this._noProperty = true;

			if (this._getShown()) {
				this._publish(this.getChannel("HIDE"));
				this._publish(this.getChannel("DISCONNECT"));
			}
		},

		_beforeShow: function(req) {

			if (this._noProperty) {
				this._publish(this.getChannel("DISCONNECT"));
			}

			this.inherited(arguments);
		}
	});
});