define([
	"app/base/views/extensions/_ActivityClosed"
	, "app/designs/mapWithSideContent/main/GeographicEditor"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "src/component/browser/bars/Pagination"
	, 'put-selector'
], function(
	_ActivityClosed
	, GeographicEditor
	, redmicConfig
	, declare
	, lang
	, Deferred
	, Pagination
	, put
){
	return declare([GeographicEditor, _ActivityClosed], {
		//	summary:
		//		Vista de Citation.
		//	description:
		//		Permite editar las citas taxonómicas.

		constructor: function (args) {

			this.config = {
				title: this.i18n.citations,

				idProperty: "uuid",
				propsToClean: ["id", "uuid", "geometry.coordinates"],

				documentDetailsPath: redmicConfig.viewPaths.documentDetails,

				templateTarget: redmicConfig.services.citationByActivity,

				ownChannel: "citation"
			};

			lang.mixin(this, this.config, args);

			if (!(this.pathVariableId && Number.isInteger(parseInt(this.pathVariableId, 10)))) {
				this._goTo404();
			}

			this.target = this.templateTarget.replace('{id}', this.pathVariableId);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				bars: [{
					instance: Pagination
				}],
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-map-marker",
							title: 'mapCentering',
							btnId: "mapCentering",
							returnItem: true,
							delayNext: 2000
						},{
							groupId: "edition",
							icons: [{
								icon: "fa-copy",
								btnId: "copy",
								title: "copy"
							},{
								icon: "fa-clone",
								btnId: "copyWithGeometry",
								title: "copyWithGeometry"
							}]
						}]
					}
				},
				orderConfig:{
					options: [
						//{value: "properties.updated", label: this.i18n.updated},
						{value: "properties.collect.taxon.scientificName", label: this.i18n.scientificName},
						{value: "properties.collect.startDate", label: this.i18n.startDate},
						{value: "properties.collect.endDate", label: this.i18n.endDate}
					]
				}
			}, this.browserConfig || {}]);

			this.formConfig = this._merge([{
				modelTarget: this.target,
				template: "dataLoader/citation/views/templates/Citation"
			}, this.formConfig || {}]);

			this.filterConfig = this._merge([{
				initQuery: {
					accessibilityIds: null
				}
			}, this.filterConfig || {}]);

			this.compositeConfig = this._merge([{
			}, this.compositeConfig || {}]);

			this.mapConfig = this._merge([{
				placeNamesConfig: {
					noFixedZoom: true
				}
			}, this.mapConfig || {}]);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._addActivityClosedButton(this.buttonsNode);
		},

		_gotActivity: function(data) {

			if (!data) {
				this._updateTitle(this.i18n.notDefined);
				return;
			}

			var activityName = data.name,
				activityLabel = activityName || this.i18n.notDefined,

				allDocuments = data.documents;

			if (!allDocuments) {
				return;
			}

			var	singleDocument = allDocuments ? allDocuments[0] : null,
				documentData = (singleDocument && singleDocument.document) ? singleDocument.document : null,
				title = activityLabel;

			if (documentData) {
				var documentLink = put("a"),
					documentIcon = put(documentLink, "span.fa.fa-book");

				documentLink.setAttribute('href', lang.replace(this.documentDetailsPath, documentData));
				documentLink.setAttribute('d-state-url', true);

				title += " " + documentLink.outerHTML;
			}

			this._updateTitle(title);

			this._publish(this.getChannel("CLEAR"));
		},

		_itemAvailable: function(response) {

			var value = response.data.geometry.coordinates,
				obj = {
					propertyName: 'geometry/coordinates',
					value: value
				};

			this.inherited(arguments);

			if (this._geometryProperty) {
				delete this._geometryProperty;

				this._emitEvt('SET_FORM_PROPERTY', obj);

				this._coordinatesChanged(value);
			}
		},

		_copyWithGeometryCallback: function(evt) {

			this._geometryProperty = true;
			this._copyCallback(evt);
		}
	});
});
