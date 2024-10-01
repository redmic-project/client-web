define([
	'dijit/form/Button'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'src/component/taskAction/Report'
], function(
	Button
	, declare
	, lang
	, aspect
	, Report
) {

	return declare(null, {
		//	summary:
		//		Extensión de vistas de catálogo para añadir funcionalidad relativa a la generación y descarga de
		//		informes.

		constructor: function(args) {

			this.config = {
				_generateReportButtonConfig: {
					'class': 'primary',
					iconClass: 'fa-print',
					title: this.i18n.createReport,
					onClick: lang.hitch(this, this._generateReportCallback)
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_initialize', lang.hitch(this, this._initializeGenerateReport));
		},

		_initializeGenerateReport: function() {

			this._reportTaskAction = new Report({
				parentChannel: this.getChannel()
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			if (!this.reportService) {
				console.warn('Tried to add report download button, but "reportService" was not defined at view "%s"',
					this.getChannel());

				return;
			}

			var placementNode = this._getReportButtonPlacementNode();

			if (!placementNode) {
				console.warn('Tried to add report download button, but container node was not found at view "%s"',
					this.getChannel());

				return;
			}

			this._generateReportButton = new Button(this._generateReportButtonConfig).placeAt(placementNode);
		},

		_getReportButtonPlacementNode: function() {

			return this.buttonsNode;
		},

		_generateReportCallback: function() {

			this._publish(this._reportTaskAction.getChannel('GENERATE_REPORT'), {
				selectionTarget: this._getReportSelectionTarget(),
				reportService: this.reportService
			});
		},

		_getReportSelectionTarget: function() {

			return this.selectionTarget || this.target;
		}
	});
});
