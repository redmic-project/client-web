define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'put-selector/put'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/layout/nestedContent/NestedBrowsersImpl'
], function(
	declare
	, lang
	, aspect
	, put
	, _Show
	, NestedBrowsersImpl
) {

	return declare(_Show, {
		//	summary:
		//		Extensión del módulo para mostrar los resultados de consulta en listados jerárquicos dinámicos.

		constructor: function(args) {

			this.config = {
				containerClass: 'queryOnMapContainer'
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_beforeInitialize', lang.hitch(this, this._initializeResultsBrowser));
			aspect.after(this, '_definePublications', lang.hitch(this, this._defineResultsBrowserPublications));
		},

		_initializeResultsBrowser: function() {

			this._layersInfo = new NestedBrowsersImpl({
				parentChannel: this.getChannel(),
				typeGroupProperty: this.typeGroupProperty,
				primaryTitle: this.i18n.presentElements,
				primaryListButtons: this.primaryListButtons,
				secondaryListButtons: this.secondaryListButtons
			});
		},

		_defineResultsBrowserPublications: function() {

			this.publicationsConfig.push({
				event: 'SHOW_LAYERS_INFO',
				channel: this.getChannel('SHOW')
			},{
				event: 'HIDE_LAYERS_INFO',
				channel: this.getChannel('HIDE')
			},{
				event: 'HIDE_LAYERS_INFO',
				channel: this._layersInfo.getChannel('CLEAR')
			},{
				event: 'ADD_INFO_DATA',
				channel: this._layersInfo.getChannel('NEW_DATA')
			},{
				event: 'ADD_NEW_TEMPLATES',
				channel: this._layersInfo.getChannel('ADD_NEW_TEMPLATES')
			});
		},

		postCreate: function() {

			this._layersInfoContainer = put('div.' + this.containerClass);
		},

		_getNodeToShow: function() {

			return this._layersInfoContainer;
		},

		_beforeShow: function() {

			this._publish(this._layersInfo.getChannel('SHOW'), {
				node: this._layersInfoContainer
			});
		}
	});
});
