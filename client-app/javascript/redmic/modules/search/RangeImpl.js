define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
	, "redmic/modules/form/input/NumberTextBoxImpl"
	, "./Search"
], function(
	declare
	, lang
	, aspect
	, put
	, NumberTextBoxImpl
	, Search
){
	return declare(Search, {
		//	summary:
		//		Todo lo necesario para trabajar con MapSearch.
		//	description:
		//		Proporciona métodos y contenedor para la búsqueda de tipo bbox.

		//	config: Object
		//		Opciones por defecto.

		'class': 'rangeSearch',

		constructor: function(args) {

			this.config = {
				ownChannel: "rangeSearch"
			};

			lang.mixin(this, this.config, args);
			aspect.before(this, "_setConfigurations", lang.hitch(this, this._setRangeConfigurations));
		},

		_setRangeConfigurations: function() {

			this.minInputConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.minInputConfig || {}]);

			this.maxInputConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.maxInputConfig || {}]);
		},

		_initialize: function() {

			this.minInput = new NumberTextBoxImpl(this.minInputConfig);
			this.maxInput = new NumberTextBoxImpl(this.maxInputConfig);
		},

		postCreate: function() {

			this.inherited(arguments);

			var minNode = put(this.domNode, 'div'),
				maxNode = put(this.domNode, 'div');

			put(minNode, 'span', this.i18n.min + ':');
			put(maxNode, 'span', this.i18n.max + ':');

			this.minInputNode = put(minNode, 'div');
			this.maxInputNode = put(maxNode, 'div');
		},

		_beforeShow: function(/*Object*/ obj) {

			this._publish(this.minInput.getChannel('SHOW'), {
				node: this.minInputNode
			});

			this._publish(this.maxInput.getChannel('SHOW'), {
				node: this.maxInputNode
			});
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_reset: function() {

			this._publish(this.minInput.getChannel('RESET'));

			this._publish(this.maxInput.getChannel('RESET'));
		}
	});
});
