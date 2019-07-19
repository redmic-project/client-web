define([
	'app/designs/base/_Layout'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
], function(
	_Layout
	, declare
	, lang
	, put
) {

	return declare(_Layout, {
		//	summary:
		//		Layout de doble contenido primario y secundario, con barra de título y vuelta hacia atrás.

		constructor: function(args) {

			this.config = {};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			var topNode = put(this.domNode, 'div.topZone'),
				buttonsNode = put(topNode, 'div.buttonZone'),
				centerNode = put(this.domNode, 'div.dualCenterZone');

			this._backButtonNode = put(buttonsNode, 'div');

			this._titleNode = put(topNode, 'div.widthLimitTitleZone.titleZone');

			this._setTitle(this.title);

			this._primaryContentNode = put(centerNode, 'div.dualListZone.noBorderList');
			this._secondaryContentNode = put(centerNode, 'div.dualListZone.noBorderList');
		}
	});
});
