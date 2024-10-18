define([
	'app/base/views/extensions/_OnShownAndRefresh'
	, 'app/designs/base/_Main'
	, 'src/catalog/ogcService/_OgcService'
	, 'app/designs/textSearchList/Controller'
	, 'app/designs/textSearchList/layout/BasicTopZone'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/browser/HierarchicalImpl'
	, 'templates/ServiceOGCList'
], function(
	_OnShownAndRefresh
	, _Main
	, _OgcService
	, Controller
	, Layout
	, declare
	, lang
	, HierarchicalImpl
	, templateList
) {

	return declare([Layout, Controller, _Main, _OgcService, _OnShownAndRefresh], {
		//	summary:
		//		Vista de catálogo de servicios OGC con diseño reducido (sin filtro por facets).

		constructor: function(args) {

			this.config = {
				ownChannel: 'catalogOGC',
				title: this.i18n.layersCatalog
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.inherited(arguments);

			this.browserConfig = this._merge([{
				template: templateList,
				rowConfig: {
					selectionIdProperty: this.pathProperty
				},
				idProperty: this.pathProperty,
				pathSeparator: this.pathSeparator,
				target: this._atlasDataTarget
			}, this.browserConfig || {}]);

			this.browserBase.shift();

			this.browserBase.unshift(HierarchicalImpl);
		}
	});
});
