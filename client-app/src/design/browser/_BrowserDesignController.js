define([
	'dojo/_base/declare'
	, 'src/component/browser/_BrowserSelectionManager'
	, 'src/component/browser/_ButtonsInRow'
	, 'src/component/browser/_DragAndDrop'
	, 'src/component/browser/_Framework'
	, 'src/component/browser/_GeoJsonParser'
	, 'src/component/browser/_HierarchicalSelect'
	, 'src/component/browser/_MultiTemplate'
	, 'src/component/browser/_Select'
	, 'src/component/browser/HierarchicalImpl'
	, 'src/component/browser/ListImpl'
	, 'src/design/_DesignController'
], function (
	declare
	, _BrowserSelectionManager
	, _ButtonsInRow
	, _DragAndDrop
	, _Framework
	, _GeoJsonParser
	, _HierarchicalSelect
	, _MultiTemplate
	, _Select
	, HierarchicalImpl
	, ListImpl
	, _DesignController
) {

	const browserComponentDefinitions = {
		list: ListImpl,
		hierarchical: HierarchicalImpl
	};

	const browserComponentExtensionDefinitions = {
		buttons: _ButtonsInRow,
		dragAndDrop: _DragAndDrop,
		framework: _Framework,
		geoJson: _GeoJsonParser,
		hierarchicalSelect: _HierarchicalSelect,
		multiTemplate: _MultiTemplate,
		select: _Select,
		selectionManager: _BrowserSelectionManager
	};

	return declare(_DesignController, {
		// summary:
		//   Lógica de diseño para mostrar un componente listado con extensiones opcionales.
		// description:
		//   Debe ser incluido por cada una de las maquetaciones de este diseño.

		_getDesignDefaultConfig: function() {

			const defaultConfig = {
				browserDefinition: 'list',
				enabledBrowserExtensions: {
					buttons: true,
					dragAndDrop: false,
					framework: true,
					geoJson: false,
					hierarchicalSelect: false,
					multiTemplate: false,
					select: false,
					selectionManager: false
				},
				actions: {
					CLEAR: 'clear'
				}
			};

			const inheritedDefaultConfig = this.inherited(arguments) || {};

			return this._merge([inheritedDefaultConfig, defaultConfig]);
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			const parentChannel = this.getChannel(),
				target = this._getTarget();

			this.mergeComponentAttribute('browserConfig', {
				parentChannel, target
			});

			const browserComponentBaseDefinition = browserComponentDefinitions[this.browserDefinition];

			this._BrowserComponentDefinition = this.prepareComponentDefinition([browserComponentBaseDefinition],
				this.enabledBrowserExtensions, browserComponentExtensionDefinitions);
		},

		createDesignControllerComponents: function() {

			const browser = new this._BrowserComponentDefinition(this.browserConfig);

			return {browser};
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			const browserInstance = this.getComponentInstance('browser');

			this.subscriptionsConfig.push({
				channel : browserInstance.getChannel('BUTTON_EVENT'),
				callback: '_subBrowserButtonEvent'
			},{
				channel : this.getChannel('CLEAR'),
				callback: '_subClear'
			});
		},

		_subBrowserButtonEvent: function(res) {

			const btnId = res?.btnId || 'defaultButton',
				callbackMethodName = `_${btnId}Callback`;

			this[callbackMethodName]?.(res);
		},

		_subClear: function() {

			this._publish(this.getComponentInstance('browser').getChannel('CLEAR'));
		},

		_onBrowserDesignTitlePropSet: function(evt) {

			this._setBrowserDesignTitle?.(evt.value);
		},

		_onTargetPropSet: function(changeObj) {

			this.inherited(arguments);

			const instance = this.getComponentInstance('browser'),
				target = changeObj.newValue;

			this._publish(instance.getChannel('SET_PROPS'), {target});
		}
	});
});
