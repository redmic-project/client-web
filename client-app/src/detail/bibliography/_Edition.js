define([
	'dojo/_base/declare'
	, 'src/redmicConfig'
], function(
	declare
	, redmicConfig
) {

	return declare(null, {
		//	summary:
		//		Extensión de vista de detalle de documentos (bibliografía) para añadir funcionalidad relativa a la
		// 		edición de registros.

		_setConfigurations: function() {

			this.inherited(arguments);

			this.shownOptionInfo = {
				remark: true
			};
		},

		_afterSetConfigurations: function() {

			this.inherited(arguments);

			if (!this._titleRightButtonsList) {
				this._titleRightButtonsList = [];
			}

			this._titleRightButtonsList.push({
				icon: 'fa-edit',
				href: redmicConfig.viewPaths.bibliographyEdit,
				title: this.i18n.edit
			});
		},

		_evaluateItemToShowOrHidePdf: function(res) {

			var documentData = res.data,
				pdfUrl = documentData.internalUrl;

			if (!pdfUrl) {
				this._hideWidget('pdf');
			} else {
				this._showWidget('pdf');
			}
		}
	});
});
