define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/browser/_ButtonsInRow'
	, 'src/component/browser/_DragAndDrop'
	, 'src/component/browser/_Framework'
	, 'src/component/browser/_GeoJsonParser'
	, 'src/component/browser/_HierarchicalSelect'
	, 'src/component/browser/_Select'
	, 'src/component/browser/bars/Total'
	, 'src/component/browser/ListImpl'
	, 'src/component/layout/genericDisplayer/GenericWithTopbarDisplayerImpl'
	, 'src/component/layout/TabsDisplayer'
	, 'src/component/search/TextImpl'
	, 'templates/DefaultList'
], function(
	declare
	, lang
	, _ButtonsInRow
	, _DragAndDrop
	, _Framework
	, _GeoJsonParser
	, _HierarchicalSelect
	, _Select
	, Total
	, ListImpl
	, GenericWithTopbarDisplayerImpl
	, TabsDisplayer
	, TextImpl
	, TemplateDefaultList
) {

	const browserComponentExtensionDefinitions = {
		dragAndDrop: _DragAndDrop,
		hierarchicalSelect: _HierarchicalSelect,
		select: _Select
	};

	return declare(null, {
		// summary:
		//   Lógica de diseño para añadir un componente Browser, junto con otros para mostrarlo y filtrar contenido.
		//   Debe asociarse como mixin a un componente al instanciarlo, junto con la parte de controlador y alguna
		//   maquetación de este diseño.

		constructor: function(args) {

			const defaultConfig = {
				enabledBrowserExtensions: {
					dragAndDrop: false,
					hierarchicalSelect: false,
					select: false
				}
			};

			lang.mixin(this, this._merge([this, defaultConfig, args]));
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			const parentChannel = this.getChannel(),
				target = this._getTarget?.();

			this.mergeComponentAttribute('tabsDisplayerConfig', {
				parentChannel
			});

			this.mergeComponentAttribute('searchConfig', {
				parentChannel,
				target,
				itemLabel: null
			});

			this.mergeComponentAttribute('browserConfig', {
				parentChannel,
				selectorChannel: parentChannel,
				target,
				template: TemplateDefaultList,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-map-marker",
							title: 'mapCentering',
							btnId: "mapCentering",
							returnItem: true
						}]
					}
				},
				bars: [{
					instance: Total
				}]
			}, {
				arrayMergingStrategy: 'concatenate'
			});

			this._BrowserComponentDefinition = this.prepareComponentDefinition(
				[ListImpl, _Framework, _ButtonsInRow, _GeoJsonParser], this.enabledBrowserExtensions,
				browserComponentExtensionDefinitions);
		},

		createDesignControllerComponents: function() {

			let inheritedComponents = this.inherited(arguments);

			let tabsDisplayer = inheritedComponents.tabsDisplayer;

			if (!tabsDisplayer) {
				tabsDisplayer = this._createDesignTabDisplayerComponent();
				lang.mixin(inheritedComponents, {tabsDisplayer});
			}

			const browser = this._createDesignBrowserComponent(),
				browserWrapper = this._createDesignBrowserWrapperComponent(browser),
				search = this._createDesignSearchComponent(browserWrapper);

			return lang.mixin(inheritedComponents, {browserWrapper, browser, search});
		},

		_createDesignTabDisplayerComponent: function() {

			return new TabsDisplayer(this.tabsDisplayerConfig);
		},

		_createDesignBrowserComponent: function() {

			return new this._BrowserComponentDefinition(this.browserConfig);
		},

		_createDesignBrowserWrapperComponent: function(browserInstance) {

			return new GenericWithTopbarDisplayerImpl({
				parentChannel: this.getChannel(),
				content: browserInstance,
				title: this.browserConfig.title || this.i18n.geographicData
			});
		},

		_createDesignSearchComponent: function() {

			return new TextImpl(this.searchConfig);
		},

		populateDesignLayoutNodes: function() {

			this.inherited(arguments);

			const browserWrapperInstance = this.getComponentInstance('browserWrapper'),
				browserWrapperChannel = browserWrapperInstance.getChannel();

			const searchInstance = this.getComponentInstance('search');

			this._publish(browserWrapperInstance.getChannel('ADD_TOPBAR_CONTENT'), {
				content: searchInstance
			});

			const tabsDisplayerInstance = this.getComponentInstance('tabsDisplayer'),
				additionalContentNode = this.getLayoutNode('additionalContent');

			this._publish(tabsDisplayerInstance.getChannel('ADD_TAB'), {
				title: this.browserConfig.title || this.i18n.geographicData,
				iconClass: 'fa fa-table',
				channel: browserWrapperChannel,
				prepend: true
			});

			this._publish(tabsDisplayerInstance.getChannel('SHOW_TAB'), {
				channel: browserWrapperChannel
			});

			this._publish(tabsDisplayerInstance.getChannel('SHOW'), {
				node: additionalContentNode
			});
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			const browserInstance = this.getComponentInstance('browser');

			this.subscriptionsConfig.push({
				channel : browserInstance.getChannel('BUTTON_EVENT'),
				callback: '_subDesignBrowserComponentButtonEvent'
			});
		},

		_subDesignBrowserComponentButtonEvent: function(evt) {

			var publicCallback = `${evt.btnId}Callback`,
				privateCallback = `_${evt.btnId}Callback`;

			this[publicCallback]?.(evt);
			this[privateCallback]?.(evt);
		}
	});
});
