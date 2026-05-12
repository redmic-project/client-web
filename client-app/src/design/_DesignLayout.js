define([
	'dojo/_base/declare'
], function(
	declare
) {

	return declare(null, {
		// summary:
		//   Base común para las maquetaciones de diseño.
		// description:
		//   Reúne funciones básicas usadas por todas las maquetaciones de diseño. Se acopla al ciclo de vida de los
		//   componentes, aprovechando algunas fases.

		postMixInProperties: function() {
			// Método perteneciente al ciclo de vida de un widget Dijit.

			const defaultConfig = this._getDesignDefaultConfig?.();
			defaultConfig && this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
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
