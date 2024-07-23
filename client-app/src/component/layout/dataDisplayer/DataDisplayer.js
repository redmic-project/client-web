define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
], function(
	declare
	, lang
	, put
	, _Module
	, _Show
){
	return declare([_Module, _Show], {
		//	summary:
		//		Visualizador de datos y nodos.
		//	description:
		//		Recibe datos o nodos y los representa.

		constructor: function(args) {

			this.config = {
				ownChannel: 'dataDisplayer'
			};

			lang.mixin(this, this.config, args);
		},

		_setDataToDisplay: function(data) {

			if (!data) {
				return;
			}

			if (typeof data === 'object') {
				put(this.domNode, data);
			} else {
				this.domNode.innerHTML = data;
			}
		},

		_beforeShow: function(req) {

			var data = req.data || this.data;

			this._setDataToDisplay(data);
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_cleanOldDisplayedData: function(oldData) {

			if (!oldData) {
				return;
			}

			if (typeof oldData === 'object') {
				put(oldData, '!');
			} else {
				this.domNode.innerHTML = '';
			}
		},

		_onDataPropSet: function(propEvt) {

			this._cleanOldDisplayedData(propEvt.oldValue);
			this._setDataToDisplay(propEvt.value);
		}
	});
});
