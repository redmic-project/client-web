module.exports = function(args) {

	var path = require('path'),
		deepmerge = require('deepmerge'),

		_intern = require('./_intern')(args),
		_functions = require('./_functions'),

		testsPath = args.testsPath,
		suitesGroups = args.suitesGroups,	// TODO por ahora no funciona, porque se recorre desde directorio no controlable
		suites = args.suites,

		pathPrefix = path.join(testsPath, 'unit'),
		suitesPrefix = pathPrefix + '/',

		// TODO cuando se arreglen todos, importar con un glob pattern todos y eliminar la variable, como en functional
		config = {
			suites: [
				// Funcionalidades básicas
				suitesPrefix + 'util/testRedmicLocalStorage'
				, suitesPrefix + 'util/testCredentials'
				, suitesPrefix + 'util/testMediator'

				// Modelos
				, suitesPrefix + 'component/model/model/attr/testAttr'
				, suitesPrefix + 'component/model/model/attr/testRelationAttr'
				, suitesPrefix + 'component/model/model/attr/testObjAttr'
				, suitesPrefix + 'component/model/model/attr/testArrayAttr'
				, suitesPrefix + 'component/model/model/test_Model'

				// Módulos
				, suitesPrefix + 'component/base/test_Module'
				, suitesPrefix + 'component/store/testRestManager'
				, suitesPrefix + 'component/layout/wizard/testWizard'
				, suitesPrefix + 'component/model/testModelImpl'
				, suitesPrefix + 'component/map/testLeafletImpl'
				, suitesPrefix + 'component/tree/testTree'
				, suitesPrefix + 'component/selection/testSelector'
				, suitesPrefix + 'component/gateway/testGateway'
				, suitesPrefix + 'component/chart/ChartsContainer/testInfoChartsContainerImpl'
				, suitesPrefix + 'component/chart/layer/ChartLayer/testLinearChartImpl'
				, suitesPrefix + 'component/chart/Toolbar/testSliderSelectorImpl'
				, suitesPrefix + 'component/form/form/testUploadInput'
				, suitesPrefix + 'component/browser/testListImpl'
				, suitesPrefix + 'component/browser/testHierarchicalImpl'
				, suitesPrefix + 'component/browser/row/testRow'
				, suitesPrefix + 'component/browser/buttons/testButtons'
				, suitesPrefix + 'component/browser/bars/testOrder'
				, suitesPrefix + 'component/browser/bars/testPagination'
				, suitesPrefix + 'component/browser/bars/testSelectionBox'
				, suitesPrefix + 'component/browser/bars/testTotal'
				, suitesPrefix + 'component/search/testFacetsImpl'
			],

			// TODO irlos arreglando e incorporando a 'suites'. Borrar 'suitesFAIL' cuando se vacíe
			suitesFAIL: [
				// Módulos
				suitesPrefix + 'component/layout/details/testDetails'
				, suitesPrefix + 'component/form/testForm'
				, suitesPrefix + 'component/search/testSearch'
				, suitesPrefix + 'component/base/testManager'
				, suitesPrefix + 'component/base/testSelectionBox'
				, suitesPrefix + 'component/base/testNotification'
				, suitesPrefix + 'component/socket/testSocket'
				, suitesPrefix + 'component/form/inputs/testTextBoxImpl'
				, suitesPrefix + 'component/form/inputs/testNumberTextBoxImpl'
				, suitesPrefix + 'component/form/inputs/testNumberSpinnerImpl'
				, suitesPrefix + 'component/form/inputs/testCheckBoxImpl'
				, suitesPrefix + 'component/form/inputs/testDateTextBoxImpl'
				, suitesPrefix + 'component/form/inputs/testTextAreaImpl'
				, suitesPrefix + 'component/form/inputs/testFilteringInputImpl'

				//Vistas
				, suitesPrefix + 'app/base/views/extensions/test_EditionView'
				, suitesPrefix + 'app/viewers/views/test_ChartsView'
				, suitesPrefix + 'app/viewers/views/test_TimeSeriesSelectionManagement'
			]
		};

	if (suites) {
		config.suites = _functions.getParameterValueAsArray(suites);
	} else if (suitesGroups) {
		config.suites = _functions.getSuites(pathPrefix, suitesGroups);
	}

	return deepmerge.all([_intern, config], {
		arrayMerge: function (_destinationArray, sourceArray, _options) {

			return sourceArray;
		}
	});
};
