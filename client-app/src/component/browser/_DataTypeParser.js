define([
	'dojo/_base/declare'
], function(
	declare
) {

	return declare(null, {
		// summary:
		//   Amplía proceso de entrada de datos para el manejo de datos de recolección de basura.

		_addData: function(response) {

			if (response.data.features) {
				response.data.data = response.data.features;
				delete response.data.features;
			}

			const data = response.data,
				newData = data[0];

			if (!newData) {
				this.inherited(arguments);
				return;
			}

			for (let i = 1; i < data.length; i++) {
				data[i].data.splice(0,1);
				newData.data = this._merge([data[i].data, newData.data || {}], {
					arrayMergingStrategy: 'combine'
				});
			}

			newData.total = newData.data?.length;

			response.data = newData;

			this.inherited(arguments);
		}
	});
});
