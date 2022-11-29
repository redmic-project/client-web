define([
	'moment/moment.min'
], function(
	moment
){
	var methods = {

		capitalize: function(/*String*/ str) {
			//	summary:
			//		Convierte el primer caracter de la cadena de entrada a mayúscula.
			//	returns:
			//		String de entrada.

			if (typeof str !== 'string' || !str.length) {
				return str;	// String
			}

			return str[0].toUpperCase() + (str.length > 1 ? str.slice(1) : '');	// String
		},

		uncapitalize: function(/*String*/ str) {
			//	summary:
			//		Convierte el primer caracter de la cadena de entrada a minuscula.
			//	returns:
			//		String de entrada.

			if (typeof str !== 'string' || !str.length) {
				return str;	// String
			}

			return str[0].toLowerCase() + (str.length > 1 ? str.slice(1) : '');	// String
		},

		without: function(/*any[]*/ array, /*any[] | any*/ values) {
			//	summary:
			//		Crea un array a partir del original quitando los valores deseados.
			//	returns:
			//		Array original sin los elementos pasados en el segundo parámetro.

			if (!array) {
				return null;	// null
			}

			if (!values) {
				return array;	// any[]
			}

			if (!values.length)
				values = [values];

			return array.filter(function(item) {	// return any[]
				return values.indexOf(item) < 0;
			});
		},

		uniq: function(/*any[]*/ array) {
			//	summary:
			//		Crea un array sin los valores duplicados que haya en el original.
			//	returns:
			//		Array libre de duplicados.

			if (!array) {
				return null;	// null
			}

			var objAux = {},
				result = [];

			for (var i = 0; i < array.length; i++)
				if (!objAux[array[i]]) {
					result.push(array[i]);
					objAux[array[i]] = true;
				}

			return result;	// any[]
		},

		uniqBy: function(/*any[]*/ array, /*function*/ func) {
			//	summary:
			//		Crea un array sin los valores duplicados que haya en el original, pero
			//		evaluando su duplicidad en base al valor devuelto por 'func' (teniendo
			//		como entrada cada uno de los elementos de 'array').
			//	returns:
			//		Array libre de duplicados.

			if (!array) {
				return null;	// null
			}

			var objAux = {},
				result = [];

			for (var i = 0; i < array.length; i++) {
				var resultFunc = func(array[i]);
				if (!objAux[resultFunc]) {
					result.push(array[i]);
					objAux[resultFunc] = true;
				}
			}

			return result;	// any[]
		},

		intersection: function(/*any[]*/ a, /*any[]*/ b) {
			//	summary:
			//		Crea un array con los elementos presentes en la intersección entre
			//		'a' y 'b'.
			//	returns:
			//		Array con los elementos resultantes de la intersección.

			if (!a || !b) {
				return null;	// null
			}

			return a.filter(function(i) {	// return any[]
				return b.indexOf(i) != -1;
			});
		},

		flatten: function(/*any[]*/ array) {
			//	summary:
			//		Aplana un array un único nivel de profundidad.
			//	returns:
			//		Array aplanado.

			if (!array) {
				return null;	// null
			}

			var result = [];

			for (var i = 0; i < array.length; i++) {
				if (array[i] && array[i] instanceof Array) {
					for (var n = 0; n < array[i].length; n++)
						result.push(array[i][n]);
				} else
					result.push(array[i]);
			}

			return result;	// any[]
		},

		compact: function(/*any[]*/ array) {
			//	summary:
			//		Crea un array sin los valores nulos presentes en el array de entrada.
			//	returns:
			//		Array libre de elementos con valor de verdad falso.

			if (!array) {
				return null;	// null
			}

			var result = [];

			for (var i = 0; i < array.length; i++)
				if (array[i])
					result.push(array[i]);

			return result;	// any[]
		},

		pickProps: function(/*Object*/ obj, /*String[]*/ props) {
			//	summary:
			//		Crea un objeto con las propiedades que le indiquemos solamente.
			//	returns:
			//		Objeto sin las propiedades no deseadas del original.

			if (!obj) {
				return null;	// null
			}

			var keys = Object.keys(obj),
				retObj = {};

			if (!props || !(props instanceof Array)) {
				return retObj;	// Object
			}

			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				if (props.indexOf(key) !== -1) {
					retObj[key] = obj[key];
				}
			}

			return retObj;	// Object
		},

		startsWith: function(/*String*/ str, /*String*/ prefix) {
			//	summary:
			//		Comprueba si la cadena pasada empieza por el prefijo especificado.
			//	returns:
			//		Si la cadena empieza o no por el prefijo.

			if (typeof str !== 'string' || typeof prefix !== 'string') {
				return false;	// Boolean
			}

			return str.lastIndexOf(prefix, 0) === 0;	// Boolean
		},

		isValidNumber: function(/*any*/ n) {
			//	summary:
			//		Comprueba si el parámetro es un número válido.
			//	returns:
			//		Si el número es válido.

			return n !== null && !isNaN(n);	// Boolean
		},

		getDeepProp: function(/*Object*/ obj, /*String*/ propPath, /*String?*/ pathSeparator) {
			//	summary:
			//		Obtiene la propiedad indicada (a cualquier nivel) de un objeto.
			//		Los niveles en 'propPath' se separan con el caracter '.' por defecto.
			//	returns:
			//		Valor de la propiedad en el objeto.

			if (!obj || typeof propPath !== 'string' || !propPath.length) {
				return null;	// null
			}

			var propsList = propPath.split(pathSeparator || '.'),
				subObj = obj;

			for (var i = 0; i < propsList.length; i++) {
				if (!subObj) {
					return null;
				}

				subObj = subObj[propsList[i]];
			}

			return subObj;	// any
		},

		setDeepProp: function(/*Object*/ obj, /*String*/ propPath, /*any*/ value, /*String?*/ pathSeparator) {
			//	summary:
			//		Cambia el valor de la propiedad indicada (a cualquier nivel) de un objeto.
			//		Los niveles en 'propPath' se separan con el caracter '.' por defecto.
			//	returns:
			//		Objeto actualizado.

			if (!obj || typeof propPath !== 'string' || !propPath.length) {
				return null;	// null
			}

			var propsList = propPath.split(pathSeparator || '.'),
				subObj = obj;

			for (var i = 0; i < propsList.length - 1; i++) {
				subObj = subObj[propsList[i]];
			}

			subObj[propsList.pop()] = value;

			return obj;	// Object
		},

		isValidUuid: function(/*String*/ uuid) {
			//	summary:
			//		Comprueba si el parámetro es un UUID (RFC 4122) válido.
			//	returns:
			//		Si el UUID es válido.

			if (!uuid || typeof uuid !== 'string') {
				return false;	// Boolean
			}

			var regExp = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
			return regExp.test(uuid);	// Boolean
		},

		isEqual: function(/*any*/ a, /*any*/ b) {
			//	summary:
			//		Comprueba si dos valores pueden considerarse iguales.
			//	returns:
			//		Si ambos valores son iguales.

			if (a === b) {
				return true;	// Boolean
			}

			if ((!a || !b) || typeof a !== 'object' || typeof b !== 'object') {
				return false;	// Boolean
			}

			if (a instanceof Date && b instanceof Date) {
				return a === b;
			}

			var propNamesInA = Object.keys(a),
				propNamesInB = Object.keys(b),
				propName,
				i;

			if (propNamesInA.length !== propNamesInB.length) {
				return false;	// Boolean
			}

			for (i = 0; i < propNamesInA.length; i++) {
				propName = propNamesInA[i];

				if (!b.hasOwnProperty(propName)) {
					return false;	// Boolean
				}

				var propValueInA = a[propName],
					propValueInB = b[propName];

				if (propValueInA === propValueInB) {
					continue;
				}

				if (typeof propValueInA !== 'object') {
					return false;	// Boolean
				}

				if (!methods.isEqual(propValueInA, propValueInB)) {
					return false;	// Boolean
				}
			}

			for (i = 0; i < propNamesInB.length; i++) {
				propName = propNamesInB[i];

				if (!a.hasOwnProperty(propName)) {
					return false;	// Boolean
				}
			}

			return true;	// Boolean
		},

		formatDate: function(/*String*/ date, /*String*/ format) {
			//	summary:
			//		Devuelve la fecha introducida en el formato indicado, dentro de las posibilidades disponibles.
			//	returns:
			//		Fecha convertida al formato especificado o igual a la de entrada, si no ha sido posible formatear.

			var locale = dojoConfig.locale,
				formatToApply;

			if (format === 'date') {
				formatToApply = locale === 'en' ? 'MM/DD/YYYY' : 'DD/MM/YYYY';
			} else if (format === 'dateTime') {
				formatToApply = locale === 'en' ? 'MM/DD/YYYY HH:mm:ss' : 'DD/MM/YYYY HH:mm:ss';
			}

			if (!formatToApply) {
				return date;	// String
			}

			var momentInstance = moment(date);

			if (!momentInstance.isValid()) {
				return date;	// String
			}

			return momentInstance.format(formatToApply);	// String
		},

		getPathDepth: function(/*String*/ path, /*String?*/ pathSeparator) {
			//	summary:
			//		Devuelve la profundidad del path.
			//	returns:
			//		Longitud del path haciendole un split.

			if (path && typeof path === 'string')
				return path.split(pathSeparator || '.').length;

			return null;
		},

		setUndefinedProps: function(/*Object*/ dest, /*Object?*/ props) {
			//	summary:
			//		Mezcla en el objeto 'dest' los atributos de 'props' si estos estan indefinidos.

			for (var key in props) {
				if (dest[key] === undefined)
					dest[key] = props[key];
			}
		}
	};

	return methods;
});