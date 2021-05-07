define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/search/CompositeImpl'
], function(
	declare
	, lang
	, _Module
	, _Show
	, CompositeImpl
) {

	return declare([_Module, _Show], {
		//	summary:
		//		Widget contenedor de filtros avanzados de búsqueda sobre actividades

		constructor: function(args) {

			this.config = {
				ownChannel: 'searchFilterWidget',
				'class': 'composite'
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.compositeSearchConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.compositeSearchConfig || {}]);

			this.compositeSearch = new CompositeImpl(this.compositeSearchConfig);
		},

		_afterShow: function() {

			if (this._getPreviouslyShown()) {
				return;
			}

			this._publish(this.compositeSearch.getChannel('SHOW'), {
				node: this.domNode
			});
		},

		_onTargetPropSet: function(evt) {

			this._setPropToChildModules(evt.prop, evt.value);
		},

		_onQueryChannelPropSet: function(evt) {

			this._setPropToChildModules(evt.prop, evt.value);
		},

		_setPropToChildModules: function(prop, value) {

			var obj = {};
			obj[prop] = value;

			this._publish(this.compositeSearch.getChannel('SET_PROPS'), obj);
		}
	});
});
