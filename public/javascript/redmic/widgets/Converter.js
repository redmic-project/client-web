define([
	'proj4/proj4'
], function(
	proj4
) {

	//	summary:
	//		Widget para convertir coordenadas de un sistema a otro.
	//	description:
	//		Se le pasa una latitud, una longitud, un sistema de coordenadas de origen
	//		y otro de destino al método 'convert' y devuelve las coordenadas convertidas.

	// Espacios de referencia permitidos
	var spatialReferences = {
		'4326': null, // definido por defecto en proj4
		'32628': "+proj=utm +zone=28 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
		'3857': null // definido por defecto en proj4
	};

	var isValidSpatialReference = function(/*String*/ reference) {
		//	summary:
		//		Devuelve si un espacio de referencia está permitido o no.
		//	spatialReference:
		//		Espacio de referencia a comprobar.
		//	returns:
		//		Booleano que indica si es válido o no.

		return Object.keys(spatialReferences).indexOf(reference.toString ? reference.toString() : reference) !== -1;
	};

	var _isValidValue = function(/*Integer*/ value) {
		//	summary:
		//		Devuelve si un valor es válido o no.
		//	tags:
		//		private
		//	value:
		//		Valor a comprobar.
		//	returns:
		//		Booleano con la respuesta.

		return value !== null && value !== undefined && !isNaN(value);
	};

	return {
		DMS2DD: function(/*Integer*/ degrees, /*Integer*/ minutes, /*Number*/ seconds) {
			//	summary:
			//		Convierte de grados, minutos y segundos a grados decimales.
			//	degrees:
			//		Parte del valor en grados.
			//	minutes:
			//		Parte del valor en minutos.
			//	seconds:
			//		Parte del valor en segundos.
			//	returns:
			//		Valor decimal de la coordenada o null si no es válida.

			if (!_isValidValue(degrees) || !_isValidValue(minutes) || !_isValidValue(seconds)) {
				return null;	// return null
			}

			var dd = Math.abs(degrees) + Math.abs(minutes/60) + Math.abs(seconds/3600),
				negative = degrees < 0;

			if (negative) {
				dd = dd * -1;
			}

			return dd;	// return Number
		},

		DD2DMS: function(/*Number*/ coordinate) {
			//	summary:
			//		Convierte de grados decimales a grados, minutos y segundos.
			//	coordinate:
			//		Valor en grados decimales.
			//	returns:
			//		Objeto con el valor en grados, minutos y segundos de la coordenada o null si no es válida.

			if (!_isValidValue(coordinate)) {
				return null;	// return null
			}

			var dms = {},
				negative = coordinate < 0,
				coord = Math.abs(coordinate),
				components = coord.toString().split("."),
				integerStr = components[0],
				remainderStr = "0." + components[1];

			dms.degrees = parseInt(integerStr, 10);
			coord = parseFloat(remainderStr) * 60;
			components = coord.toString().split(".");
			integerStr = components[0];
			remainderStr = "0." + components[1];
			dms.minutes = parseInt(integerStr, 10);
			dms.seconds = parseFloat(remainderStr) * 60;

			if (dms.seconds >= 59.99999) {
				dms.seconds = 0;
				dms.minutes ++;

				if (dms.minutes === 60) {
					dms.minutes = 0;
					dms.degrees ++;
				}
			}

			if (negative) {
				dms.degrees = dms.degrees * -1;
			}

			return dms;	// return Object
		},

		convert: function(/*String*/ src, /*String*/ dst, /*Number*/ x, /*Number*/ y) {
			//	summary:
			//		Convierte coordenadas de un sistema a otro.
			//	src:
			//		Espacio de referencia de entrada.
			//	dst:
			//		Espacio de referencia de salida.
			//	x:
			//		Longitud de la coordenada (componente X).
			//	y:
			//		Latitud de la coordenada (componente Y).
			//	returns:
			//		Objeto con las coordenadas convertidas.

			if (!isValidSpatialReference(src) || !isValidSpatialReference(dst) ||
				!_isValidValue(x) || !_isValidValue(y)) {
				return null;
			}

			var validPrefix = 'EPSG:',
				validSrc = validPrefix + src,
				validDst = validPrefix + dst;

			var customSrc = spatialReferences[src],
				customDst = spatialReferences[dst];

			customSrc && proj4.defs(validSrc, customSrc);
			customDst && proj4.defs(validDst, customDst);

			return proj4(validSrc, validDst, { x: x, y: y });
		}
	};
});
