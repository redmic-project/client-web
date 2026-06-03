define([
	'dojo/_base/declare'
	, 'src/component/form/input/Input'
	, 'src/component/textSearch/geographic/GeographicSearchImpl'
], function(
	declare
	, Input
	, GeographicSearchImpl
) {

	return declare(Input, {
		// summary:
		//   Implementación de componente Input para mostrar un mapa.

		postMixInProperties: function() {

			this.inherited(arguments);

			const defaultConfig = {
				ownChannel: 'mapSearch'
			};

			this._mergeOwnAttributes(defaultConfig);
		},

		_createInputInstance: function() {

			return false;
		},

		_createMapInstance: function() {

			this.mapSearch = new GeographicSearchImpl({
				parentChannel: this.getChannel()
			});

			this._subscribe(this.mapSearch.getChannel('SEARCH'), res => this._setValue(res.value));
		},

		_enable: function() {

			if (!this.mapSearch) {
				this._createMapInstance();
			}

			this._publish(this.mapSearch.getChannel('SHOW'), {
				node: this.containerInput
			});
		},

		_disable: function() {

			if (!this.mapSearch) {
				return;
			}

			this._publish(this.mapSearch.getChannel('HIDE'));
		}
	});
});
