define([
	'app/base/views/extensions/_CompositeSearchInTooltip'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'put-selector/put'
	, 'redmic/modules/components/Keypad/IconKeypadImpl'
], function(
	_CompositeSearchInTooltip
	, declare
	, lang
	, aspect
	, put
	, IconKeypadImpl
) {

	return declare(_CompositeSearchInTooltip, {
		//	summary:
		//		Muestra la instancia de CompositeImpl (Search) en tooltip, asociado a un botón.
		//	description:
		//		Instancia una botonera IconKeypadImpl (Keypad) que contiene un botón para desplegar el tooltip y mostrar
		//		así la búsqueda compuesta.
		//		Deja disponible la instancia en 'this.iconKeypadComposite' y su canal mediator en
		//		'this.iconKeypadChannel'. Espera que se implemente el método 'this.getIconKeypadNode()', y que devuelva
		//		el nodo donde se desea colocar la botonera (y si no, se coloca en 'this.topNode').

		constructor: function(args) {

			this.config = {
				compositeSearchInTooltipFromIconKeypadActions: {
					KEYPAD_INPUT: 'keypadInput'
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_mixEventsAndActions', lang.hitch(this,
				this._mixCompositeSearchInTooltipFromIconKeypadEventsAndActions));

			aspect.before(this, '_initialize', lang.hitch(this, this._initializeCompositeSearchInTooltipFromIconKeypad));
			aspect.after(this, '_defineSubscriptions', lang.hitch(this,
				this._defineCompositeSearchInTooltipFromIconKeypadSubcriptions));
		},

		_mixCompositeSearchInTooltipFromIconKeypadEventsAndActions: function () {

			lang.mixin(this.actions, this.compositeSearchInTooltipFromIconKeypadActions);

			delete this.compositeSearchInTooltipFromIconKeypadActions;
		},

		_initializeCompositeSearchInTooltipFromIconKeypad: function() {

			this.iconKeypadComposite = new IconKeypadImpl({
				parentChannel: this.getChannel(),
				items: {
					filters: {
						className: 'fa-filter',
						title: this.i18n.filterTitle
					}
				}
			});

			this.iconKeypadChannel = this.iconKeypadComposite.getChannel();
		},

		_defineCompositeSearchInTooltipFromIconKeypadSubcriptions: function () {

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.iconKeypadChannel, this.actions.KEYPAD_INPUT),
				callback: '_subKeypadInputComposite'
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			if (this.iconKeypadComposite) {
				this._showIconKeypadComposite(this.iconKeypadComposite);
			}
		},

		_showIconKeypadComposite: function(instance) {

			this.keypadZoneNode = put(this._getIconKeypadNode(), 'div.keypadZone');

			this._publish(instance.getChannel('SHOW'), {
				node: this.keypadZoneNode
			});
		},

		_subKeypadInputComposite: function(res) {

			if (res.inputKey !== 'filters' || this._compositeSearchInTooltipFromIconKeypadShowEventAdded) {
				return;
			}

			var sourceNode = res.node.firstChild;

			this._publish(this.composite.getChannel('ADD_EVT'), {
				sourceNode: sourceNode,
				initAction: 'hide'
			});

			this._publish(this.composite.getChannel('SHOW'), {
				node: sourceNode
			});

			this._compositeSearchInTooltipFromIconKeypadShowEventAdded = true;
		},

		_getIconKeypadNode: function() {

			if (this.getIconKeypadNode) {
				return this.getIconKeypadNode();
			}

			return this.topNode;
		}
	});
});
