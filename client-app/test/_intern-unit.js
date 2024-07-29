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
				suitesPrefix + 'redmic/base/testRedmicLocalStorage'
				, suitesPrefix + 'redmic/base/testCredentials'
				, suitesPrefix + 'redmic/base/testMediator'

				// Modelos
				, suitesPrefix + 'src/component/model/model/attr/testAttr'
				, suitesPrefix + 'src/component/model/model/attr/testRelationAttr'
				, suitesPrefix + 'src/component/model/model/attr/testObjAttr'
				, suitesPrefix + 'src/component/model/model/attr/testArrayAttr'
				, suitesPrefix + 'src/component/model/model/test_Model'

				// Módulos
				, suitesPrefix + 'src/component/base/test_Module'
				, suitesPrefix + 'src/component/store/testRestManager'
				, suitesPrefix + 'src/component/layout/wizard/testWizard'
				, suitesPrefix + 'src/component/model/testModelImpl'
				, suitesPrefix + 'src/component/map/testLeafletImpl'
				, suitesPrefix + 'src/component/tree/testTree'
				, suitesPrefix + 'src/component/selection/testSelector'
				, suitesPrefix + 'src/component/gateway/testGateway'
				, suitesPrefix + 'src/component/chart/ChartsContainer/testInfoChartsContainerImpl'
				, suitesPrefix + 'src/component/chart/layer/ChartLayer/testLinearChartImpl'
				, suitesPrefix + 'src/component/chart/Toolbar/testSliderSelectorImpl'
				, suitesPrefix + 'src/component/form/form/testUploadInput'
				, suitesPrefix + 'src/component/browser/testListImpl'
				, suitesPrefix + 'src/component/browser/testHierarchicalImpl'
				, suitesPrefix + 'src/component/browser/row/testRow'
				, suitesPrefix + 'src/component/browser/buttons/testButtons'
				, suitesPrefix + 'src/component/browser/bars/testOrder'
				, suitesPrefix + 'src/component/browser/bars/testPagination'
				, suitesPrefix + 'src/component/browser/bars/testSelectionBox'
				, suitesPrefix + 'src/component/browser/bars/testTotal'
				, suitesPrefix + 'src/component/search/testFacetsImpl'
			],

			// TODO irlos arreglando e incorporando a 'suites'. Borrar 'suitesFAIL' cuando se vacíe
			suitesFAIL: [
				// Módulos
				suitesPrefix + 'src/component/layout/details/testDetails'
				, suitesPrefix + 'src/component/form/testForm'
				, suitesPrefix + 'src/component/search/testSearch'
				, suitesPrefix + 'src/component/base/testManager'
				, suitesPrefix + 'src/component/base/testSelectionBox'
				, suitesPrefix + 'src/component/base/testNotification'
				, suitesPrefix + 'src/component/socket/testSocket'
				, suitesPrefix + 'src/component/form/inputs/testTextBoxImpl'
				, suitesPrefix + 'src/component/form/inputs/testNumberTextBoxImpl'
				, suitesPrefix + 'src/component/form/inputs/testNumberSpinnerImpl'
				, suitesPrefix + 'src/component/form/inputs/testCheckBoxImpl'
				, suitesPrefix + 'src/component/form/inputs/testDateTextBoxImpl'
				, suitesPrefix + 'src/component/form/inputs/testTextAreaImpl'
				, suitesPrefix + 'src/component/form/inputs/testFilteringInputImpl'

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
