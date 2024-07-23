define([
	'app/base/views/extensions/_CompositeSearchInTooltip'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
], function(
	_CompositeSearchInTooltip
	, declare
	, lang
	, aspect
) {

	return declare(_CompositeSearchInTooltip, {
		//	summary:
		//		Muestra la instancia de CompositeImpl (Search) en tooltip, asociado a una suscripción a TextImpl
		//		(Search).
		//	description:
		//		Escucha la publicación de "expandir búsqueda" desde una instancia de buscador de texto, para vincular
		//		al nodo recibido el despliegue del tooltip con la búsqueda compuesta.
		//		Da por hecho que la instancia del buscador de texto se encuentra en 'this.textSearch'.

		constructor: function(args) {

			aspect.after(this, '_defineSubscriptions', lang.hitch(this,
				this._defineAddCompositeSearchInTooltipSubcriptions));
		},

		_defineAddCompositeSearchInTooltipSubcriptions: function () {

			if (!this.textSearch) {
				return;
			}

			this.subscriptionsConfig.push({
				channel: this.textSearch.getChannel('EXPAND_SEARCH'),
				callback: '_subTextSearchExpand'
			});
		},

		_subTextSearchExpand: function(res) {

			if (this._addCompositeSearchInTooltipShowEventAdded) {
				return;
			}

			var sourceNode = res.node;

			this._publish(this.composite.getChannel('ADD_EVT'), {
				sourceNode: sourceNode,
				initAction: 'hide'
			});

			this._publish(this.composite.getChannel('SHOW'), {
				node: sourceNode
			});

			this._addCompositeSearchInTooltipShowEventAdded = true;
		}
	});
});
