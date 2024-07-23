define([
	"app/base/views/extensions/_SelectInDoubleList"
	, "app/designs/doubleList/layout/TopLeftContentAndDoubleList"
	, "app/designs/doubleList/Controller"
	, "RWidgets/Utilities"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/DocumentList"
	, "templates/SpeciesFilter"
	, "src/component/form/input/FilteringSelectImpl"
	, "templates/LoadingCustom"
], function (
	_SelectInDoubleList
	, Layout
	, Controller
	, Utilities
	, redmicConfig
	, declare
	, lang
	, TemplateListDocument
	, TemplateFilter
	, FilteringSelectImpl
	, TemplateCustom
){
	return declare([Layout, Controller, _SelectInDoubleList], {
		//	summary:
		//		Step

		constructor: function(args) {

			this.config = {
				// WizardStep params
				//label: this.i18n,
				title: this.i18n.documentsAssociatedSpecies,
				title2: this.i18n.documentsSelected,
				_results: {
					taxon: null,
					documents: []
				},

				events: {
					CHANGE_BROWSER_RIGHT_NO_DATA_MESSAGE: "changeBrowserRightNoDataMessage",
					CHANGE_BROWSER_LEFT_NO_DATA_MESSAGE: "changeBrowserLeftNoDataMessage",
					GET_DATA_BROWSER_LEFT: "getDataBrowserLeft"
				},

				// General params
				idProperty: "id",
				_totalSelected: 0,
				documentTarget: redmicConfig.services.document,
				speciesTarget: redmicConfig.services.species,

				_targetBrowserLeft: redmicConfig.services.documentsBySpecies,

				propertyNameFiltering: 'scientificName',
				idPropertyFiltering: 'id',

				ownChannel: "documentStepFiltered",

				documentByMisidentificationTarget: redmicConfig.services.documentByMisidentification,

				inputs: []
			};

			lang.mixin(this, this.config);

			this.target = [this.documentByMisidentificationTarget, this._targetBrowserLeft];
		},

		_setConfigurations: function() {

			this.browserLeftConfig = this._merge([{
				buttonsInTopZone: true,
				//target: this._targetBrowserLeft,
				buttons: {
					"addTotalItemsBrowserLeft": {
						className: "fa-arrow-right",
						title: this.i18n.selectAll
					}
				},
				textSearchConfig: {
					itemLabel: null
				},
				browserConfig: {
					target: this._targetBrowserLeft,
					template: TemplateListDocument,
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: "fa-file-pdf-o",
								btnId: "downloadPdf",
								condition: "url"
							},{
								icon: "fa-info-circle",
								btnId: "details",
								title: "info",
								href: redmicConfig.viewPaths.documentDetails
							},{
								icon: "fa-arrow-right",
								btnId: "addItem",
								classIcon: "blueIcon",
								returnItem: true
							}]
						}
					},
					noDataMessage: TemplateCustom({
						message: this.i18n.noAssociatedDocuments,
						iconClass: "fr fr-no-data"
					}),
					instructionDataMessage: TemplateCustom({
						message: this.i18n.selectSpecies,
						iconClass: "fr fr-crab"
					})
				}
			}, this.browserLeftConfig || {}]);

			this.browserLeftCopyNoDataMessage = this.browserLeftConfig.browserConfig.noDataMessage;

			this.browserLeftConfig.browserConfig.noDataMessage = this.browserLeftConfig.browserConfig.instructionDataMessage;

			this.browserRightConfig = this._merge([{
				buttonsInTopZone: true,
				buttons: {
					"clearItemsBrowserRight": {
						className: "fa-trash-o",
						title: this.i18n.clearSelection
					}
				},
				browserConfig: {
					target: this.getChannel(),
					template: TemplateListDocument,
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: "fa-trash-o",
								btnId: "remove",
								callback: "_removeItem",
								classIcon: "redIcon"
							},{
								icon: "fa-info-circle",
								btnId: "details",
								title: "info",
								href: redmicConfig.viewPaths.documentDetails
							}]
						}
					},
					noDataMessage: null
				}
			}, this.browserRightConfig || {}]);

			this.filteringConfig = this._merge([{
				parentChannel: this.getChannel(),
				idProperty: this.idProperty,
				inputProps: {
					placeHolder: this.i18n.speciesMisidentificationPlaceHolder,
					template: TemplateFilter,
					target: this.speciesTarget,
					labelAttr: this.propertyNameFiltering,
					fields: ['scientificName.raw^3', 'scientificName', 'scientificName.suggest']
				},
				propertyName: this.propertyNameFiltering
			}, this.filteringConfig || {}]);
		},

		_initialize: function() {

			this.filteringInput = new FilteringSelectImpl(this.filteringConfig);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.filteringInput.getChannel("VALUE_CHANGED"),
				callback: "_subChangedInput"
			},{
				channel: this.browserLeft.getChildChannel("iconKeypad", "KEYPAD_INPUT"),
				callback: "_subBrowserKeypadInput"
			},{
				channel: this.browserLeft.getChildChannel("browser", "GOT_DATA"),
				callback: "_subBrowserLeftGotData"
			},{
				channel: this.browserRight.getChildChannel("iconKeypad", "KEYPAD_INPUT"),
				callback: "_subBrowserKeypadInput"
			});
		},

		_definePublications: function () {

			this.publicationsConfig.push({
				event: 'ADDITEM',
				channel: this.browserLeft.getChildChannel("browser", "BUTTON_EVENT")
			},{
				event: 'CHANGE_BROWSER_LEFT_NO_DATA_MESSAGE',
				channel: this.browserLeft.getChildChannel("browser", "UPDATE_NO_DATA_TEMPLATE")
			},{
				event: 'CHANGE_BROWSER_RIGHT_NO_DATA_MESSAGE',
				channel: this.browserRight.getChildChannel("browser", "UPDATE_NO_DATA_TEMPLATE")
			},{
				event: 'GET_DATA_BROWSER_LEFT',
				channel: this.browserLeft.getChildChannel("browser", "GET_DATA")
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.filteringInput.getChannel("SHOW"), {
				node: this.topLeftNode.domNode
			});

			this.browserLeftConfig.browserConfig.noDataMessage = this.browserLeftCopyNoDataMessage;
		},

		_beforeShow: function() {

			this._emitEvt('REFRESH_STATUS');
		},

		_subBrowserKeypadInput: function(res) {

			if (res.inputKey === "addTotalItemsBrowserLeft") {
				this._addTotalItemsInListRight();
			} else if (res.inputKey === "clearItemsBrowserRight") {
				this._clearItemsInListRight();
			}

			this._updateCompletedStatus();
		},

		_addTotalItemsInListRight: function() {

			this._emitEvt("GET_DATA_BROWSER_LEFT");
		},

		_subBrowserLeftGotData: function(response) {

			var data = response.data;

			for (var i = 0; i < data.length; i++) {
				var item = data[i];
				this._addItemInListRight(item[this.idProperty], item);
			}
		},

		_clearItemsInListRight: function() {

			this._publish(this.browserRight.getChildChannel("browser", "CLEAR"));
			this._results.deleteDocument = true;
			this._results.documents = [];
			this._totalSelected = 0;
		},

		_subListBtnEvent: function(response) {

			this.inherited(arguments);

			var btnId = response.btnId,
				idProperty = response[this.idProperty],
				item = response.item;

			if (btnId === "addItem") {
				this._addItemInListRight(idProperty, item);
			} else if (btnId === "remove") {
				this._deleteItemInListRight(idProperty);
			}

			this._updateCompletedStatus();
		},

		_deleteItemInListRight: function(idProperty) {

			this._results.documents = Utilities.without(this._results.documents, idProperty);
			this._results.deleteDocument = true;
			this._totalSelected--;
		},

		_addItemInListRight: function(idProperty, item) {

			if (this._results.documents.indexOf(idProperty) < 0) {
				this._totalSelected++;
				this._results.documents.push(idProperty);

				this._emitEvt("INJECT_ITEM", {
					data: item,
					target: this.getChannel()
				});
			}
		},

		_subChangedInput: function(evt) {

			this._emitEvt('CLEAR_SELECTION');

			if (evt.name === this.propertyNameFiltering && evt.value) {

				if (this._results.taxon === evt.value) {
					return;
				}

				this.target[1] = lang.replace(this.browserLeftTarget, {id: evt.value});

				this._results.taxon = evt.value;

				this._emitEvt('CHANGE_BROWSER_LEFT_NO_DATA_MESSAGE', {
					template: this.browserLeftConfig.browserConfig.noDataMessage
				});

				this._emitEvt('CHANGE_BROWSER_RIGHT_NO_DATA_MESSAGE', {
					template: this.browserRightConfig.browserConfig.instructionDataMessage
				});

				this._publish(this.browserRight.getChildChannel("browser", "CLEAR"));

				this._emitEvt('GET', {
					target: this.target[1],
					id: ""
				});
			} else if (evt.name === this.propertyNameFiltering && !evt.value) {
				this._emitEvt('CHANGE_BROWSER_LEFT_NO_DATA_MESSAGE', {
					template: this.browserLeftConfig.browserConfig.instructionDataMessage
				});
				this._publish(this.browserLeft.getChildChannel ("browser", "CLEAR"));
				this._publish(this.browserRight.getChildChannel ("browser", "CLEAR"));
				this._results.taxon = null;
				this._results.documents = [];
				this._totalSelected = 0;
			}

			this._updateCompletedStatus();
		},

		_clearStep: function() {

			this._results = {
				taxon: null,
				documents: []
			};

			this._isCompleted = false;

			this._publish(this.filteringInput.getChannel("RESET"));

			this._emitEvt('CHANGE_BROWSER_LEFT_NO_DATA_MESSAGE', {
				template: this.browserLeftConfig.browserConfig.instructionDataMessage
			});
		},

		_resetStep: function(initialData) {

			this._results = {
				taxon: null,
				documents: []
			};

			if (this._defaultData) {
				this._instanceDataToResult(this._defaultData);
			} else {
				this._clearStep();
			}
		},

		_instanceDataToResult: function(data) {

			if (!data) {
				return;
			}

			this._defaultData = data;

			var objToSet = {
				toInitValue: true
			};

			lang.mixin(objToSet, data.badIdentity);

			// Seteamos el taxón en filtering select
			this._publish(this.filteringInput.getChannel("SET_VALUE"), objToSet);

			this.target[0] = lang.replace(this.documentByMisidentificationTarget, {id: data.id});

			// Requerimos los documentos asociados a las citas con misidentification obtenido
			this._emitEvt('REQUEST', {
				method: "POST",
				target: this.target[0],
				requesterId: this.getOwnChannel()
			});
		},

		_dataAvailable: function(response) {

			/* Seteamos los documentos obtenidos a partir de la consulta en el grid de la derecha*/
			if (response && response.data) {
				var data = response.data.data || response.data;
				for (var i = 0; i < data.length; i++) {
					var item = data[i].documents[0].document;
					if (item) {
						this._addItemInListRight(item[this.idProperty], item);
					}
				}

				this._updateCompletedStatus();
			}
		},

		_itemAvailable: function(response, resWrapper) {

			this.inherited(arguments);

			if (resWrapper.target === this.target[1]) {
				this._dataToDocuments(response);
			}
		},

		_dataToDocuments: function(response) {

			var data = response.data;

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this._targetBrowserLeft
			});
		}
	});
});
