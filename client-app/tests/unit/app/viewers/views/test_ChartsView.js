define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/date/stamp"
	, "app/viewers/views/ChartsView"
	, "redmic/modules/store/MasterStore"
	, "src/utils/Mediator"
], function(
	declare
	, lang
	, stamp
	, ChartView
	, MasterStore
	, Mediator
){
	var timeout, view, callback, item, source;

	var parseDate = function (date) {
		return stamp.fromISOString(date);
	};

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("ChartView tests", {
		before: function() {

			timeout = 100;

			/*masterStore = new MasterStore({
				parentChannel: "app"
			});*/

			view = new declare(ChartView)({
				mediator: Mediator,
				parentChannel: "",
				ownChannel: ""
			});
			view._initialize();

			source = [{
				"key_as_string" : "2015-03-30",
				"key" : 1427673600000,
				"doc_count" : 48,
				"aggs_velocidad" : {
					"doc_count" : 24,
					"metrics" : {
						"count" : 24,
						"min" : -22.709999084472656,
						"max" : 0.6700000166893005,
						"avg" : -10.667499920974175,
						"sum" : -256.0199981033802
					}
				}
			}, {
				"key_as_string" : "2015-03-31",
				"key" : 1427760000000,
				"doc_count" : 48,
				"aggs_velocidad" : {
					"doc_count" : 24,
					"metrics" : {
						"count" : 24,
						"min" : -24.059999465942383,
						"max" : 2.2100000381469727,
						"avg" : -11.464583282669386,
						"sum" : -275.14999878406525
					}
				}
			}];

			item = {
				"aggs_velocidad" : {
					"name": "velocidad",
					//"unit":	"m/s",
					"avg" : {
						node: null,
						type: "line",
						display: true,
						color: null,
						name: "avg",
						xmin: parseDate("2015-03-30"),
						xmax: parseDate("2015-03-31"),
						ymin: -11.464583282669386,
						ymax: -10.667499920974175,
						data: [{x: parseDate("2015-03-30"), y: -10.667499920974175}, {x: parseDate("2015-03-31"), y: -11.464583282669386}]
					},
					"count" : {
						node: null,
						type: "line",
						display: true,
						color: null,
						name: "count",
						xmin: parseDate("2015-03-30"),
						xmax: parseDate("2015-03-31"),
						ymin: 24,
						ymax: 24,
						data: [{x: parseDate("2015-03-30"), y: 24}, {x: parseDate("2015-03-31"), y: 24}]
					},
					"sum" : {
						node: null,
						type: "line",
						display: true,
						color: null,
						name: "sum",
						xmin: parseDate("2015-03-30"),
						xmax: parseDate("2015-03-31"),
						ymin: -275.14999878406525,
						ymax: -256.0199981033802,
						data: [{x: parseDate("2015-03-30"), y: -256.0199981033802}, {x: parseDate("2015-03-31"), y: -275.14999878406525}]
					},
					"min" : {
						node: null,
						type: "line",
						display: true,
						color: null,
						name: "min",
						xmin: parseDate("2015-03-30"),
						xmax: parseDate("2015-03-31"),
						ymin: -24.059999465942383,
						ymax: -22.709999084472656,
						data: [{x: parseDate("2015-03-30"), y: -22.709999084472656}, {x: parseDate("2015-03-31"), y: -24.059999465942383}]
					},
					"max" : {
						node: null,
						type: "line",
						display: true,
						color: null,
						name: "max",
						xmin: parseDate("2015-03-30"),
						xmax: parseDate("2015-03-31"),
						ymin: 0.6700000166893005,
						ymax: 2.2100000381469727,
						data: [{x: parseDate("2015-03-30"), y: 0.6700000166893005}, {x: parseDate("2015-03-31"), y: 2.2100000381469727}]
					}
				},
				total: 5
			};
		},

		after: function() {

			Mediator.removeDescendantChannels("app");
		},

		tests: {
			"create _EditionView": function() {

				assert.ok(view.actions, "No se ha creado bien la extensión de edición en vistas");
				assert.ok(view.events, "No se ha creado bien la extensión de edición en vistas");
			},

			"parse data": function() {

				assert.deepEqual(item, view._parseData(source), "El dato cargado no es el dato enviado");
			}/*,

			"add element": function() {
				var dfd = this.async(timeout);

				Mediator.once(view._buildChannel(view.form.ownChannel, view.form.actions.SHOW),
					dfd.callback(function() {}));
				view.emit(view.events.ADD);
			}*/
		}
	});
});
