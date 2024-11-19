define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'src/component/form/FormContainerImpl'
	, 'src/component/form/_PublicateChanges'
	, './_AddTextSearchInputItfc'
], function(
	declare
	, lang
	, aspect
	, FormContainerImpl
	, _PublicateChanges
	, _AddTextSearchInputItfc
) {

	return declare(_AddTextSearchInputItfc, {
		//	summary:
		//		Extensión que añade input de texto y botón, para buscar contenido

		constructor: function(args) {

			this.config = {};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_afterSetConfigurations', lang.hitch(this, this._setAddTextSearchInputConfigurations));
			aspect.after(this, '_beforeInitialize', lang.hitch(this, this._initializeAddTextSearchInput));

			if (this._clearStep) {
				aspect.after(this, '_clearStep', lang.hitch(this, this._addTextSearchInputClearStep));
			}
		},

		_setAddTextSearchInputConfigurations: function() {

			this.formConfig = this._merge([{
				parentChannel: this.getChannel(),
				template: 'maintenance/views/templates/forms/ServiceOGCLayerSearch',
				modelChannel: this.modelChannel,
				formContainerConfig: {
					onNewSearch: lang.hitch(this, this._onNewSearch)
				}
			}, this.formConfig || {}]);
		},

		_initializeAddTextSearchInput: function() {

			var formDefinition = declare(FormContainerImpl).extend(_PublicateChanges);

			this._form = new formDefinition(this.formConfig);
		},

		_showTextSearch: function(parentNode) {

			this._publish(this._form.getChannel('SHOW'), {
				node: parentNode
			});
		},

		_onNewSearch: function() {

			this._once(this._form.getChannel('GOT_PROPERTY_VALUE'), lang.hitch(this, function(res) {

				var url = res.value;

				this._emitEvt('REQUEST', {
					target: this.target,
					action: 'wms',
					method: 'POST',
					query: {
						url: url
					}
				});
			}));

			this._publish(this._form.getChannel('GET_PROPERTY_VALUE'), {
				propertyName: 'urlSource'
			});
		},

		_dataAvailable: function(res) {

			this._onNewSearchResults(res.data);
		},

		_errorAvailable: function(error, status) {

			this._emitEvt('COMMUNICATION', {
				type: 'alert',
				level: 'error',
				description: error
			});
		},

		_addTextSearchInputClearStep: function() {

			this._publish(this._form.getChannel('CLEAR'));
		}
	});
});
