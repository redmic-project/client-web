define([
	'dijit/layout/ContentPane'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
], function(
	ContentPane
	, declare
	, lang
	, put
){

	return declare(ContentPane, {
		//	summary:
		//		Layout de doble contenido primario y secundario, con barra de título y vuelta hacia atrás.

		constructor: function(args) {

			this.config = {};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			var topNode = put(this.containerNode, 'div.topZone'),
				buttonsNode = put(topNode, 'div.buttonZone'),
				centerNode = put(this.containerNode, 'div.dualCenterZone');

			this._backButtonNode = put(buttonsNode, 'div');

			this._titleNode = put(topNode, 'div.widthLimitTitleZone.titleZone'),

			this._setTitle(this.title);

			this._primaryContentNode = put(centerNode, 'div.dualListZone.noBorderList');
			this._secondaryContentNode = put(centerNode, 'div.dualListZone.noBorderList');
		},

		_getNodeToShow: function() {

			return this.containerNode;
		}
	});
});
