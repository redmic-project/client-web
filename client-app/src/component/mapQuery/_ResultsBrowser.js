define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'src/component/base/_Show'
	, 'src/component/layout/nestedContent/NestedBrowsersImpl'
	, 'src/component/layout/dataDisplayer/DataDisplayer'
	, 'templates/LoadingCustom'
], function(
	declare
	, lang
	, aspect
	, _Show
	, NestedBrowsersImpl
	, DataDisplayer
	, LoadingCustom
) {

	return declare(_Show, {
		//	summary:
		//		Extensión del módulo para mostrar los resultados de consulta en listados jerárquicos dinámicos.

		constructor: function(args) {

			this.config = {
				'class': 'queryOnMapContainer'
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_beforeInitialize', lang.hitch(this, this._initializeResultsBrowser));
			aspect.after(this, '_definePublications', lang.hitch(this, this._defineResultsBrowserPublications));
			aspect.after(this, '_setOwnCallbacksForEvents',
				lang.hitch(this, this._setResultsBrowserOwnCallbacksForEvents));
		},

		_initializeResultsBrowser: function() {

			this._layersInfo = new NestedBrowsersImpl({
				parentChannel: this.getChannel(),
				typeGroupProperty: this.typeGroupProperty,
				primaryTitle: this.i18n.presentElements,
				primaryListButtons: this.primaryListButtons,
				secondaryListButtons: this.secondaryListButtons
			});

			this._dataDisplayer = new DataDisplayer({
				parentChannel: this.getChannel(),
				data: LoadingCustom({
					message: this.i18n.selectFeatureOnMap,
					iconClass: 'fa fa-map-marker'
				})
			});

			this._publish(this._dataDisplayer.getChannel('SHOW'), {
				node: this.domNode
			});
		},

		_defineResultsBrowserPublications: function() {

			this.publicationsConfig.push({
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

		_setResultsBrowserOwnCallbacksForEvents: function() {

			this._onEvt('SHOW_LAYERS_INFO', lang.hitch(this, this._showResultsAndHidePlaceholder));
			this._onEvt('HIDE_LAYERS_INFO', lang.hitch(this, this._hideResultsAndShowPlaceholder));
		},

		_showResultsAndHidePlaceholder: function() {

			this._publish(this._layersInfo.getChannel('SHOW'), {
				node: this.domNode
			});

			this._publish(this._dataDisplayer.getChannel('HIDE'));
		},

		_hideResultsAndShowPlaceholder: function() {

			this._publish(this._dataDisplayer.getChannel('SHOW'));

			this._publish(this._layersInfo.getChannel('HIDE'));
		}
	});
});
