define([
	'dojo/_base/lang'
	, 'dojo/has'
	, 'RWidgets/Utilities'
	, 'src/util/stringFormats'
	, 'tv4/tv4'
], function(
	lang
	, has
	, Utilities
	, stringFormats
	, tv4
){

	//	summary:
	//		Fachada para tv4.
	//	description:
	//		Permite sobreescribir y ampliar tv4 a nuestro gusto, además de facilitar el abandono del módulo si
	//		decidimos cambiar a otro.

	function _uniqueItemsByRequiredProperties(data, value, schema) {

		var items = schema.items,
			type = items.type;

		if (type !== 'object' || (type instanceof Array && type.indexOf('object') === -1))
			return null;

		var requiredItems = items && items.required;

		if (!requiredItems || !requiredItems.length || !data)
			return null;

		for (var i = 0; i < data.length; i++) {
			for (var j = i + 1; j < data.length; j++) {
				var equalProperties = 0;
				for (var n = 0; n < requiredItems.length; n++) {
					var requiredItem = requiredItems[n],
						itemA = data[i] && data[i][requiredItem],
						itemB = data[j] && data[j][requiredItem];

					if (itemA && itemB && Utilities.isEqual(itemA, itemB))
						equalProperties ++;
				}

				if (equalProperties === requiredItems.length) {
					return {
						code: 'ARRAY_UNIQUE_REQUIRED_PROPERTIES'
					};
				}
			}
		}

		return null;
	}

	function _customizeTv4(instance) {

		instance.addFormat(stringFormats);

		instance.defineError('ARRAY_UNIQUE_REQUIRED_PROPERTIES', 10400,
			'Array items are not unique by required properties');

		instance.defineKeyword('uniqueItemsByRequiredProperties', lang.hitch(this, _uniqueItemsByRequiredProperties));
	}

	var tv4Instance;
	if (has('host-browser')) {
		if (!window.tv4) {
			_customizeTv4(tv4);
			window.tv4 = tv4;
		}
		tv4Instance = window.tv4;
	} else if (has('host-node')) {
		if (!global.tv4) {
			_customizeTv4(tv4);
			global.tv4 = tv4;
		}
		tv4Instance = global.tv4;
	} else {
		console.error('Cannot create a tv4 instance, environment not supported');
	}

	return tv4Instance;
});
