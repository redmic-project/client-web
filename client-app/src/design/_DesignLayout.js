define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
], function (
	declare
	, lang
) {

	return declare(null, {
		// summary:
		//   Base común para las maquetaciones de diseño.
		// description:
		//   Reúne funciones básicas usadas por todas las maquetaciones de diseño. Se acopla al ciclo de vida de los
		//   widgets Dijit de Dojo, aprovechando algunas fases. Las fases disponibles son:
		//     constructor -> postMixInProperties -> buildRendering -> postCreate -> startup

		postMixInProperties: function() {
			// Método perteneciente al ciclo de vida de un widget Dijit.

			this.inherited(arguments);

			this._mergeOwnAttributes(this.params || {});
		},

		_mergeOwnAttributes: function(/*Object*/ args) {
			// summary:
			//   Recibe atributos definidos desde fuera para mezclarlos en profundidad dentro de la instancia.
			// description:
			//   Es importante que este método se llame desde la fase de postMixInProperties del componente, ya que
			//   justo antes Dijit hace una primera mezcla de args en this, que no tiene en cuenta los cambios. Por
			//   tanto, si se ejecuta antes, los cambios serán sobreescritos, y si se ejecuta después, puede ser
			//   demasiado tarde para asignar algunos valores necesarios en otras fases tempranas.
			//   Respetar siempre en la definición del método los posibles valores devueltos en llamadas heredadas,
			//   para poder ir acumulando la configuración que aporta cada nivel.

			const defaultConfig = this._getDesignDefaultConfig?.() || {};

			lang.mixin(this, this._merge([this, defaultConfig, args]));
		},

		buildRendering: function() {
			// Método perteneciente al ciclo de vida de un widget Dijit.

			this.inherited(arguments);

			this._setLayoutClass(this.layoutClasses);
		},

		_setLayoutClass: function(/*String*/ classNames) {
			// summary:
			//   Recibe un string con una o más clases CSS para aplicarlas al nodo principal de la maquetación.
			// description:
			//   Es importante que este método se llame desde la fase de buildRendering del componente, en postCreate
			//   ya será demasiado tarde para que se apliquen los cambios.

			if (!classNames?.length) {
				return;
			}

			this.class = classNames.split('.').join(' ');
		},

		postCreate: function() {
			// Método perteneciente al ciclo de vida de un widget Dijit.

			this.inherited(arguments);

			// Este método debe devolver un objeto con los nodos de maquetación, indexados por su propName.
			const layoutNodes = this.createDesignLayoutNodes?.();

			for (let propName in layoutNodes) {
				this._setLayoutNode(layoutNodes[propName], propName);
			}

			this.populateDesignLayoutNodes?.();
		},

		_setLayoutNode: function(/*Object*/ node, /*String*/ nodePropName) {
			// summary:
			//   Recibe un nodo de maquetación y un nombre de propiedad para referenciarlo.
			// description:
			//   Almacena el nodo (si no existía uno con ese nombre) para poder recuperarlo más adelante.

			if (!this._designLayoutNodes) {
				this._designLayoutNodes = {};
			}

			if (this._designLayoutNodes[nodePropName]) {
				console.error(`Node with name ${nodePropName} already exists at design ${this.getChannel()}.`);
				return;
			}

			this._designLayoutNodes[nodePropName] = node;
		},

		getLayoutNode: function(/*String*/ nodePropName) {
			// summary:
			//   Recibe un nombre de propiedad para recuperar un nodo de maquetación previamente almacenado.

			return this._designLayoutNodes?.[nodePropName];
		}
	});
});
