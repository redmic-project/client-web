define([
	"app/designs/externalTextSearchList/main/PlaceNames"
	,"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/map/MapButton"
	, "src/component/base/_ShowInPopup"
], function(
	PlaceNames
	, declare
	, lang
	, aspect
	, MapButton
	, _ShowInPopup
){
	return declare(null, {
		//	summary:
		//		Extensión para placeNames.
		//	description:
		//		Proporciona la funcionalidad de tener el boton y listado de toponimos.

		//	config: Object
		//		Opciones y asignaciones por defecto.

		constructor: function(args) {

			this.config = {

			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_setConfigurations", lang.hitch(this, this._setPlaceNamesButtonConfigurations));
			aspect.after(this, "_initialize", lang.hitch(this, this._initializePlaceNamesButton));
		},

		_setPlaceNamesButtonConfigurations: function() {

			this.placeNamesButtonConfig = this._merge([{
				icon: "fa-map-marker",
				title: this.i18n.findPlacenames,
				activated: lang.hitch(this, this._showPlaceNames),
				deactivated: lang.hitch(this, this._hidePlaceNames)
			}, this.placeNamesButtonConfig || {}]);

			this.placeNamesConfig = this._merge([{
				mapChannel: this.getChannel(),
				parentChannel: this.getChannel(),
				ownChannel: "placeNames",
				title: this.i18n.placeNames,
				centerContent: this.placeNamesNode,
				width: 4,
				height: "sm",
				reposition: "n"
			}, this.placeNamesConfig || {}]);
		},

		_initializePlaceNamesButton: function() {

			this.placeNamesButtonConfig.addButtonChannel = this.getChannel("ADD_BUTTON");
			this.placeNamesButton = new MapButton(this.placeNamesButtonConfig);

			this.placeNamesConfig = this._merge([{
				popupConfig: {
					onCancel:  lang.hitch(this.placeNamesButton, this.placeNamesButton.deactivate)
				}
			}, this.placeNamesConfig]);

			this.placeNames = new declare(PlaceNames).extend(_ShowInPopup)(this.placeNamesConfig);
		},

		_showPlaceNames: function() {

			this._publish(this.placeNames.getChannel("SHOW"));

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: "showPlaceNames"
				}
			});
		},

		_hidePlaceNames: function() {

			this._publish(this.placeNames.getChannel("HIDE"));
		}
	});
});
