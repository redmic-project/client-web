define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'redmic/modules/base/_ShowInTooltip'
	, 'redmic/modules/base/_ShowOnEvt'
	, 'redmic/modules/search/CompositeImpl'
	, 'redmic/modules/search/_HideFormByAction'
], function(
	declare
	, lang
	, aspect
	, _ShowInTooltip
	, _ShowOnEvt
	, CompositeImpl
	, _HideFormByAction
) {

	return declare(null, {
		//	summary:
		//		Permite crear una instancia de CompositeImpl (Search) mostrada mediante tooltip.
		//	description:
		//		Extensión que instancia una búsqueda compuesta para ser mostrada en tooltip, a determinar por la lógica
		//		de quien importe esta extensión.
		//		Se puede configurar añadiendo propiedades a 'this.compositeConfig' y la instancia creada se coloca en
		//		'this.composite'. Necesita tener disponible un canal de filtrado en 'this.queryChannel'.

		constructor: function(args) {

			aspect.before(this, '_afterSetConfigurations', lang.hitch(this,
				this._setCompositeSearchInTooltipConfigurations));

			aspect.before(this, '_initialize', lang.hitch(this, this._initializeCompositeSearchInTooltip));
		},

		_setCompositeSearchInTooltipConfigurations: function() {

			this.compositeConfig = this._merge([{
				parentChannel: this.getChannel(),
				timeClose: null,
				'class': 'compositeSearchInTooltip'
			}, this.compositeConfig || {}]);
		},

		_initializeCompositeSearchInTooltip: function() {

			this.compositeConfig.filterChannel = this.queryChannel;

			var Definition = declare([CompositeImpl, _HideFormByAction, _ShowOnEvt]).extend(_ShowInTooltip);
			this.composite = new Definition(this.compositeConfig);
		}
	});
});
