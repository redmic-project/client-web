define([
	"dojo/_base/declare"
	, "app/viewers/views/_TimeSeriesSelectionManagement"
], function(
	declare
	, _TimeSeriesSelectionManagement
){
	var timeout, _ext;

	var checkedStructureOneElement = function() {

		assertObjectLengthEqual(_ext._insertedInTimeSeriesData, 1);

		assertObjectLengthEqual(_ext.timeSeriesData.stationIndex, 1);
		assert.strictEqual(_ext.timeSeriesData.stationIndex[14][0], 3);

		assertObjectLengthEqual(_ext.timeSeriesData.data.stations, 1);
		assert.strictEqual(_ext.timeSeriesData.data.stations[14] && true, true);

		assertObjectLengthEqual(_ext.timeSeriesData.parameterIndex, 1);
		assert.strictEqual(_ext.timeSeriesData.parameterIndex[3][0], 14);

		assertObjectLengthEqual(_ext.timeSeriesData.data.parameters, 1);
		assert.strictEqual(_ext.timeSeriesData.data.parameters[3] && true, true);
		assert.strictEqual(_ext.timeSeriesData.data.parameters[3].unit && true, true);

		assertObjectLengthEqual(_ext.timeSeriesData.definitionIndex, 2);
		assert.strictEqual(_ext.timeSeriesData.definitionIndex[32].sIds, 14);
		assert.strictEqual(_ext.timeSeriesData.definitionIndex[32].pIds, 3);
		assert.strictEqual(_ext.timeSeriesData.definitionIndex[41].sIds, 14);
		assert.strictEqual(_ext.timeSeriesData.definitionIndex[41].pIds, 3);

		assert.strictEqual(Object.keys(_ext.timeSeriesData.data.definitions).length, 2);
		assert.strictEqual(_ext.timeSeriesData.data.definitions[32] && true, true);
		assert.strictEqual(_ext.timeSeriesData.data.definitions[32].z, 3);
		assert.strictEqual(_ext.timeSeriesData.data.definitions[41] && true, true);
		assert.strictEqual(_ext.timeSeriesData.data.definitions[41].z, 6);
	};

	var checkedStructureNoElement = function() {

		assertObjectLengthEqual(_ext._insertedInTimeSeriesData, 0);
		assertObjectLengthEqual(_ext.timeSeriesData.stationIndex, 0);
		assertObjectLengthEqual(_ext.timeSeriesData.data.stations, 0);
		assertObjectLengthEqual(_ext.timeSeriesData.parameterIndex, 0);
		assertObjectLengthEqual(_ext.timeSeriesData.data.parameters, 0);
		assertObjectLengthEqual(_ext.timeSeriesData.definitionIndex, 0);
		assertObjectLengthEqual(_ext.timeSeriesData.data.definitions, 0);
	};

	var checkedStructureTwoElement = function() {
		assert.strictEqual(Object.keys(_ext._insertedInTimeSeriesData).length, 2);

		assert.strictEqual(Object.keys(_ext.timeSeriesData.stationIndex).length, 1);
		assert.strictEqual(_ext.timeSeriesData.stationIndex[14][0], 3);
		assert.strictEqual(_ext.timeSeriesData.stationIndex[14][1], 32);

		assert.strictEqual(Object.keys(_ext.timeSeriesData.data.stations).length, 1);
		assert.strictEqual(_ext.timeSeriesData.data.stations[14] && true, true);

		assert.strictEqual(Object.keys(_ext.timeSeriesData.parameterIndex).length, 2);
		assert.strictEqual(_ext.timeSeriesData.parameterIndex[3][0], 14);
		assert.strictEqual(_ext.timeSeriesData.parameterIndex[32][0], 14);

		assert.strictEqual(Object.keys(_ext.timeSeriesData.data.parameters).length, 2);
		assert.strictEqual(_ext.timeSeriesData.data.parameters[3] && true, true);
		assert.strictEqual(_ext.timeSeriesData.data.parameters[3].unit && true, true);
		assert.strictEqual(_ext.timeSeriesData.data.parameters[32] && true, true);

		assert.strictEqual(Object.keys(_ext.timeSeriesData.definitionIndex).length, 3);
		assert.strictEqual(_ext.timeSeriesData.definitionIndex[32].sIds, 14);
		assert.strictEqual(_ext.timeSeriesData.definitionIndex[32].pIds, 3);
		assert.strictEqual(_ext.timeSeriesData.definitionIndex[41].sIds, 14);
		assert.strictEqual(_ext.timeSeriesData.definitionIndex[41].pIds, 3);
		assert.strictEqual(_ext.timeSeriesData.definitionIndex[16].sIds, 14);
		assert.strictEqual(_ext.timeSeriesData.definitionIndex[16].pIds, 32);

		assert.strictEqual(Object.keys(_ext.timeSeriesData.data.definitions).length, 3);
		assert.strictEqual(_ext.timeSeriesData.data.definitions[32] && true, true);
		assert.strictEqual(_ext.timeSeriesData.data.definitions[41] && true, true);
		assert.strictEqual(_ext.timeSeriesData.data.definitions[16] && true, true);
	};

	var assertObjectLengthEqual = function(object, length) {
		assert.strictEqual(Object.keys(object).length, length);
	};

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("_TimeSeriesSelectionManagement tests", {
		before: function() {

			timeout = 100;

			_ext = new declare(_TimeSeriesSelectionManagement)({});

			_ext._dataList = [{
				code: "TGr00",
				id: 14,
				leaves: 2,
				name: "Meteo Boya OAG Granadilla",
				path: "r.TGr00"
			},{
				id: 3,
				leaves: 0,
				name: "Temperatura",
				path: "r.TGr00.3",
				unit: "Grados centígrados",
				dataDefinitions: [{
					id: 32,
					path: "r.TGr00.3.32",
					length: 0,
					z: 3,
					isRegularity:false,
					isSerial: true,
					maxValue: 50,
					minValue: 0,
					significantDigits: 4,
					timeInterval: 900
				},{
					id: 41,
					path: "r.TGr00.3.41",
					length: 0,
					z: 6,
					isRegularity:false,
					isSerial: true,
					maxValue: 50,
					minValue: 0,
					significantDigits: 4,
					timeInterval: 900
				}]
			},{
				id: 32,
				leaves: 0,
				name: "Presión atmosférica",
				path: "r.TGr00.32",
				unit: "Bares",
				dataDefinitions: [{
					id: 16,
					path: "r.TGr00.32.16",
					length: 0,
					z: 3,
					isRegularity:false,
					isSerial: true,
					maxValue: 1100,
					minValue: 600,
					significantDigits: 6,
					timeInterval: 3600
				}]
			},{
				code: "TGr01",
				id: 10,
				leaves: 1,
				name: "Meteo",
				path: "r.TGr01"
			},{
				id: 3,
				leaves: 0,
				name: "Temperatura",
				path: "r.TGr01.3",
				unit: "Grados centígrados",
				dataDefinitions: [{
					id: 85,
					path: "r.TGr01.3.85",
					length: 0,
					z: 4,
					isRegularity:false,
					isSerial: true,
					maxValue: 50,
					minValue: 0,
					significantDigits: 4,
					timeInterval: 900
				}]
			}];

			_ext._indexDataList = {
				'r.TGr00': 0,
				'r.TGr00.3': 1,
				'r.TGr00.32': 2,
				'r.TGr01': 3,
				'r.TGr01.3': 4
			};
		},

		tests: {
			"clear structure data": function() {
				assertObjectLengthEqual(_ext._insertedInTimeSeriesData, 0);
				_ext._insertItemInDataChart("r.TGr00.3");
				_ext._clear();
				checkedStructureNoElement();
			},

			"insert item in structure data": function() {

				_ext._clear();
				assertObjectLengthEqual(_ext._insertedInTimeSeriesData, 0);
				_ext._insertItemInDataChart("r.TGr00.3");
				checkedStructureOneElement();
			},


			"insert items in structure data with one element": function() {

				_ext._clear();
				assertObjectLengthEqual(_ext._insertedInTimeSeriesData, 0);
				_ext._insertItemInDataChart("r.TGr00.3");
				checkedStructureOneElement();
				_ext._insertItemInDataChart("r.TGr00.32");
				checkedStructureTwoElement();
			},


			"insert items in structure data with two element and station diff": function() {

				_ext._clear();
				_ext._insertItemInDataChart("r.TGr00.3");
				checkedStructureOneElement();
				_ext._insertItemInDataChart("r.TGr00.32");
				checkedStructureTwoElement();
				_ext._insertItemInDataChart("r.TGr01.3");
			}
		}
	});
});