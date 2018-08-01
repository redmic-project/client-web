define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/form/input/Input"
	, "redmic/modules/search/GeographicImpl"
], function(
	declare
	, lang
	, Input
	, GeographicImpl
){
	return declare(Input, {
		//	summary:
		//		Extensión para añadir funcionalidades de filtrado a las vistas
		//	description:
		//

		constructor: function (args) {

			this.config = {
				ownChannel: "mapSearch"
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			this._inputDisabled = true;

			return false;
		},

		_createMapInstance: function() {

			this.mapSearch = new declare(GeographicImpl)({
				ownChannel: "mapSearch",
				parentChannel: this.getChannel(),
				queryChannel: this.queryChannel,
				newSearch: lang.hitch(this, this._setValue)
			});
		},

		_showMap: function() {

			if (!this.mapSearch) {
				this._createMapInstance();
			}

			this._publish(this.mapSearch.getChannel("SHOW"), {
				node: this.containerInput
			});
		},

		_hideMap: function() {

			this.mapSearch && this._publish(this.mapSearch.getChannel("HIDE"));
		},

		_disable: function() {

			this._hideMap();
		},

		_enable: function() {

			this._showMap();
		}
	});
});
