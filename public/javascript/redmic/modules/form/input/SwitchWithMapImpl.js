define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/on"
	, "redmic/modules/base/_ShowInTooltip"
	, "redmic/modules/form/input/Input"
	, "redmic/modules/search/GeographicImpl"
	, "RWidgets/Switch"
], function(
	declare
	, lang
	, on
	, _ShowInTooltip
	, Input
	, GeographicImpl
	, Switch
){
	return declare(Input, {
		//	summary:
		//		Extensión para añadir funcionalidades de filtrado a las vistas
		//	description:
		//

		constructor: function (args) {

			this.config = {
				ownChannel: "swithWithMap"
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			this.mapSearch = new declare([GeographicImpl]).extend(_ShowInTooltip)({
				ownChannel: "mapSearch",
				parentChannel: this.getChannel(),
				queryChannel: this.queryChannel,
				notIndicator: true,
				orient: ["below-centered"],
				classTooltip: "tooltipButtonMenu",
				newSearch: lang.hitch(this, this._setValue)
			});

			this.mapSwitch = new Switch({
				iconClass: "fa-globe.mapBotton"
			}).placeAt(this.containerInput);

			on(this.mapSwitch, this.mapSwitch.events.ACTIVE, lang.hitch(this, this._activeSwitch));
			on(this.mapSwitch, this.mapSwitch.events.DISABLE, lang.hitch(this, this._deactiveSwitch));

			return this.mapSwitch;
		},

		_activeSwitch: function() {

			this._showMap();
			this._showMap();
		},

		_deactiveSwitch: function() {

			this._setValue(null);
			this._hideMap();
		},

		_showMap: function() {

			this._publish(this.mapSearch.getChannel("SHOW"), {
				node: this.mapSwitch.domNode
			});
		},

		_hideMap: function() {

			this._publish(this.mapSearch.getChannel("HIDE"));
		},

		_disable: function() {

			this._inputInstance && this._inputInstance.disable();
			this._hideMap();
		},

		_enable: function() {

			this._inputInstance && this._inputInstance.enable();
		},

		_valueChanged: function(res) {

			if (res[this.propertyName]) {
				this.mapSwitch.changeMode(true, false);
			} else {
				this.mapSwitch.changeMode(false, false);
			}

			this.inherited(arguments);
		}
	});
});
