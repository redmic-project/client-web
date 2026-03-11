define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/browser/_BrowserSelectionManager'
	, 'src/component/browser/_ButtonsInRow'
	, 'src/component/browser/_DragAndDrop'
	, 'src/component/browser/_Framework'
	, 'src/component/browser/_GeoJsonParser'
	, 'src/component/browser/_HierarchicalSelect'
	, 'src/component/browser/_MultiTemplate'
	, 'src/component/browser/_Select'
	, 'src/component/browser/bars/Total'
	, 'src/component/browser/ListImpl'
	, 'src/component/layout/genericDisplayer/GenericWithTopbarDisplayerImpl'
	, 'src/component/textSearch/TextSearchSuggestionsRequestImpl'
	, 'src/design/map/_AddTabsDisplayerComponent'
	, 'templates/DefaultList'
], function(
	declare
	, lang
	, _BrowserSelectionManager
	, _ButtonsInRow
	, _DragAndDrop
	, _Framework
	, _GeoJsonParser
	, _HierarchicalSelect
	, _MultiTemplate
	, _Select
	, Total
	, ListImpl
	, GenericWithTopbarDisplayerImpl
	, TextSearchSuggestionsRequestImpl
	, _AddTabsDisplayerComponent
	, TemplateDefaultList
) {

	const browserComponentExtensionDefinitions = {
		dragAndDrop: _DragAndDrop,
		hierarchicalSelect: _HierarchicalSelect,
		multiTemplate: _MultiTemplate,
		select: _Select,
		selectionManager: _BrowserSelectionManager
	};

	return declare(_AddTabsDisplayerComponent, {
		// summary:
		//   Lógica de diseño para añadir un componente Browser, junto con otros para mostrarlo y filtrar contenido.
		//   Debe asociarse como mixin a un componente al instanciarlo, junto con la parte de controlador y alguna
		//   maquetación de este diseño.

		_getDesignDefaultConfig: function() {

			const defaultConfig = {
				enabledBrowserExtensions: {
					dragAndDrop: false,
					hierarchicalSelect: false,
					select: false,
					selectionManager: false,
					multiTemplate: false
				},
				browserTabIconClass: 'fa fa-table'
			};

			const inheritedDefaultConfig = this.inherited(arguments) || {};

			return this._merge([inheritedDefaultConfig, defaultConfig]);
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			const parentChannel = this.getChannel(),
				target = this._getTarget?.();

			this.mergeComponentAttribute('searchConfig', {
				parentChannel,
				target
			});

			this.mergeComponentAttribute('browserConfig', {
				parentChannel,
				selectorChannel: parentChannel,
				target,
				template: TemplateDefaultList,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-map-marker',
							title: 'mapCentering',
							btnId: 'mapCentering',
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

			const inheritedComponents = this.inherited(arguments);

			const browser = this._createDesignBrowserComponent(),
				browserWrapper = this._createDesignBrowserWrapperComponent(browser),
				search = this._createDesignSearchComponent(browserWrapper);

			return lang.mixin(inheritedComponents, {browserWrapper, browser, search});
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

			return new TextSearchSuggestionsRequestImpl(this.searchConfig);
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this.on('ME_OR_ANCESTOR_HIDDEN', () => this._addBrowserComponentOnHide());
		},

		populateDesignLayoutNodes: function() {

			this.inherited(arguments);

			const browserWrapperInstance = this.getComponentInstance('browserWrapper'),
				browserWrapperChannel = browserWrapperInstance.getChannel();

			// TODO contemplar omisión de search
			const searchInstance = this.getComponentInstance('search');

			this._publish(browserWrapperInstance.getChannel('ADD_TOPBAR_CONTENT'), {
				content: searchInstance
			});

			const tabsDisplayerInstance = this.getComponentInstance('tabsDisplayer');

			this._publish(tabsDisplayerInstance.getChannel('ADD_TAB'), {
				title: this.browserConfig.title || this.i18n.geographicData,
				iconClass: this.browserTabIconClass,
				channel: browserWrapperChannel,
				prepend: true
			});

			this._publish(tabsDisplayerInstance.getChannel('SHOW_TAB'), {
				channel: browserWrapperChannel
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

			const publicCallback = `${evt.btnId}Callback`,
				privateCallback = `_${evt.btnId}Callback`;

			this[publicCallback]?.(evt);
			this[privateCallback]?.(evt);
		},

		_addBrowserComponentOnHide: function() {

			const browserInstance = this.getComponentInstance('browser');

			this._publish(browserInstance.getChannel('CLEAR'));
		}
	});
});
