define([
	'app/home/views/_DashboardItem'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/base/_Store'
	, 'redmic/modules/search/CompositeImpl'
], function(
	_DashboardItem
	, declare
	, lang
	, put
	, _Module
	, _Show
	, _Store
	, CompositeImpl
) {

	return declare([_Module, _Show], {
		//	summary:
		//		Widget contenedor de resultados de búsqueda sobre actividades

		constructor: function(args) {

			this.config = {
				ownChannel: 'searchFilterWidget',
				className: 'composite'
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

			var compositeSearchNode = put(this.domNode, 'div.' + this.className);

			this._publish(this.compositeSearch.getChannel("SHOW"), {
				node: compositeSearchNode
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
