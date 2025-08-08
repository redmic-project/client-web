define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
], function (
	declare
	, lang
) {

	return declare(null, {
		// summary:
		//   Base común para los controladores de diseño.
		// description:
		//   Reúne funciones básicas usadas por todos los controladores de diseño.

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

		prepareComponentDefinition: function(/*Array*/ baseDefinitionArray, /*Object*/ extensionEnableFlags,
			/*Object*/ extensionDefinitions) {
			// summary:
			//   Recibe un array de definiciones base del componente y dos objetos, uno de flags de activación y otro
			//   de correspondencias con extensiones de definición, ambos con los mismos nombres de propiedad.
			//   Devuelve la declaración del componente con todas las extensiones que se hayan habilitado.

			for (let enabledProp in extensionEnableFlags) {
				if (extensionEnableFlags[enabledProp]) {
					const extensionDefinition = extensionDefinitions?.[enabledProp];
					extensionDefinition && baseDefinitionArray.push(extensionDefinition);
				}
			}

			return declare(baseDefinitionArray);
		},

		mergeComponentAttribute: function(/*String*/ attrName, /*Object*/ objToMerge, /*Object?*/ mergeOpts) {
			// summary:
			//   Recibe un nombre de atributo, un objeto para mezclar con el valor actual del atributo y un objeto
			//   opcional para configurar parámetros de la mezcla.
			//   Asigna al atributo indicado el valor resultante entre la mezcla de su valor actual con el valor
			//   recibido por parámetro, siguiendo las opciones de mezcla establecidas.

			this[attrName] = this._merge([this[attrName] || {}, objToMerge], mergeOpts);
		},

		_initialize: function() {
			// Método perteneciente al ciclo de vida de un componente.

			this.inherited(arguments);

			// Este método debe devolver un objeto con las instancias de los componentes, indexadas por su propName.
			const componentInstances = this.createDesignControllerComponents?.();

			for (let key in componentInstances) {
				this._setComponentInstance(componentInstances[key], key);
			}
		},

		_setComponentInstance: function(/*Object*/ instance, /*String?*/ instancePropName) {
			// summary:
			//   Recibe una instancia de un componente y, opcionalmente, un nombre de propiedad para referenciarlo.
			//   En caso de no recibir instancePropName, usa el valor devuelto por instance.getOwnChannel para ello.
			//   Almacena la instancia para poder recuperarla más adelante si no existía una con ese nombre.
			//   Devuelve el nombre de la propiedad usado para almacenar la instancia internamente.

			const propName = instancePropName || instance.getOwnChannel();

			if (!this._designComponentInstances) {
				this._designComponentInstances = {};
			}

			if (this._designComponentInstances[propName]) {
				console.error(`Instance with name ${propName} already exists at design ${this.getChannel()}.`);
				return;
			}

			this._designComponentInstances[propName] = instance;

			return propName;
		},

		getComponentInstance: function(/*String*/ instancePropName) {
			// summary:
			//   Recibe un nombre de propiedad para recuperar una instancia de un componente previamente almacenada.

			return this._designComponentInstances?.[instancePropName];
		}
	});
});
