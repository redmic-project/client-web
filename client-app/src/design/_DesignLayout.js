define([
	'dojo/_base/declare'
], function (
	declare
) {

	return declare(null, {
		// summary:
		//   Base común para las maquetaciones de diseño.
		//   Reúne funciones básicas usadas por todas las maquetaciones de diseño.

		buildRendering: function() {
			// Método perteneciente al ciclo de vida de un widget Dojo.

			this.inherited(arguments);

			this.layoutClasses?.length && this._setLayoutClass(this.layoutClasses);
		},

		_setLayoutClass: function(/*String*/ classNames) {
			// summary:
			//   Recibe un string con una o más clases CSS para aplicarlas al nodo principal de la maquetación.
			//   Es importante que este método se llame antes de terminar la fase de buildRendering del componente,
			//   en postCreate ya será demasiado tarde para que se apliquen los cambios.

			if (!classNames?.length) {
				return;
			}

			this.class = classNames.includes('.') ? classNames.replace(/\./g, ' ') : classNames;
		},

		postCreate: function() {
			// Método perteneciente al ciclo de vida de un widget Dojo.

			this.inherited(arguments);

			// Este método debe devolver un objeto con los nodos de maquetación, indexados por su propName.
			const layoutNodes = this._createDesignLayoutNodes?.();

			for (let propName in layoutNodes) {
				this._setLayoutNode(layoutNodes[propName], propName);
			}

			this._populateDesignLayoutNodes?.();
		},

		_setLayoutNode: function(/*Object*/ node, /*String*/ nodePropName) {
			// summary:
			//   Recibe un nodo de maquetación y un nombre de propiedad para referenciarlo.
			//   Almacena el nodo para poder recuperarlo más adelante si no existía uno con ese nombre.

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
