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
				, suitesPrefix + 'app/base/models/attr/testAttr'
				, suitesPrefix + 'app/base/models/attr/testRelationAttr'
				, suitesPrefix + 'app/base/models/attr/testObjAttr'
				, suitesPrefix + 'app/base/models/attr/testArrayAttr'
				, suitesPrefix + 'app/base/models/test_Model'

				// Módulos
				, suitesPrefix + 'redmic/modules/base/test_Module'
				, suitesPrefix + 'redmic/modules/store/testRestManager'
				, suitesPrefix + 'redmic/modules/layout/wizard/testWizard'
				, suitesPrefix + 'redmic/modules/model/testModelImpl'
				, suitesPrefix + 'redmic/modules/map/testLeafletImpl'
				, suitesPrefix + 'redmic/modules/tree/testTree'
				, suitesPrefix + 'redmic/modules/selection/testSelector'
				, suitesPrefix + 'redmic/modules/gateway/testGateway'
				, suitesPrefix + 'redmic/modules/chart/ChartsContainer/testInfoChartsContainerImpl'
				, suitesPrefix + 'redmic/modules/chart/layer/ChartLayer/testLinearChartImpl'
				, suitesPrefix + 'redmic/modules/chart/Toolbar/testSliderSelectorImpl'
				, suitesPrefix + 'redmic/form/testUploadInput'
				, suitesPrefix + 'redmic/modules/browser/testListImpl'
				, suitesPrefix + 'redmic/modules/browser/testHierarchicalImpl'
				, suitesPrefix + 'redmic/modules/browser/row/testRow'
				, suitesPrefix + 'redmic/modules/browser/buttons/testButtons'
				, suitesPrefix + 'redmic/modules/browser/bars/testOrder'
				, suitesPrefix + 'redmic/modules/browser/bars/testPagination'
				, suitesPrefix + 'redmic/modules/browser/bars/testSelectionBox'
				, suitesPrefix + 'redmic/modules/browser/bars/testTotal'
				, suitesPrefix + 'redmic/modules/search/testFacetsImpl'
			],

			// TODO irlos arreglando e incorporando a 'suites'. Borrar 'suitesFAIL' cuando se vacíe
			suitesFAIL: [
				// Módulos
				suitesPrefix + 'redmic/modules/layout/details/testDetails'
				, suitesPrefix + 'redmic/modules/form/testForm'
				, suitesPrefix + 'redmic/modules/search/testSearch'
				, suitesPrefix + 'redmic/modules/base/testManager'
				, suitesPrefix + 'redmic/modules/base/testSelectionBox'
				, suitesPrefix + 'redmic/modules/base/testNotification'
				, suitesPrefix + 'redmic/modules/socket/testSocket'
				, suitesPrefix + 'redmic/modules/form/inputs/testTextBoxImpl'
				, suitesPrefix + 'redmic/modules/form/inputs/testNumberTextBoxImpl'
				, suitesPrefix + 'redmic/modules/form/inputs/testNumberSpinnerImpl'
				, suitesPrefix + 'redmic/modules/form/inputs/testCheckBoxImpl'
				, suitesPrefix + 'redmic/modules/form/inputs/testDateTextBoxImpl'
				, suitesPrefix + 'redmic/modules/form/inputs/testTextAreaImpl'
				, suitesPrefix + 'redmic/modules/form/inputs/testFilteringInputImpl'

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
		arrayMerge: function (destinationArray, sourceArray, options) {

			return sourceArray;
		}
	});
};
