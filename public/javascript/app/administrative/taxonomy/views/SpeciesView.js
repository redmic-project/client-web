define([
	'alertify/alertify.min'
	, "app/designs/textSearchFacetsList/main/Species"
	, "app/base/views/extensions/_EditionWizardView"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "RWidgets/Button"
	, "templates/FilterSpeciesForm"
	, "./_AddCompositeTaxon"
], function(
	alertify
	, SpeciesMain
	, _EditionWizardView
	, redmicConfig
	, declare
	, lang
	, Button
	, formTemplate
	, _AddCompositeTaxon
){
	return declare([SpeciesMain, _AddCompositeTaxon, _EditionWizardView], {
		// summary:
		// 		Vista de  especies.

		constructor: function (args) {

			this.config = {
				addPath: this.viewPaths.speciesAdd,
				target: redmicConfig.services.species,
				filtersInTabs: true,
				title: this.i18n.species
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							groupId: "edition",
							icons: [{
								icon: "fa-edit",
								btnId: "edit",
								title: "edit",
								option: "default",
								href: this.viewPaths.speciesEdit
							},{
								icon: "fa-refresh",
								btnId: "update",
								condition: "aphia",
								title: "update"
							}]
						},{
							icon: "fa-info-circle",
							btnId: "details",
							title: 'info',
							href: this.viewPaths.speciesDetails
						}]
					}
				}
			}, this.browserConfig || {}]);
		},

		_updateCallback: function(evt) {

			var obj = {
				target: redmicConfig.services.wormsUpdate,
				data: {}
			};

			obj.data[this.idProperty] = evt[this.idProperty];

			this._emitEvt('SAVE', obj);
		},

		postCreate: function() {

			this.inherited(arguments);

			this.updateAllButton = new Button({
				iconClass: "fa fa-refresh",
				'class': "warning",
				'title': this.i18n.updateAllSpecies,
				onClick: lang.hitch(this, this._updateAllButtonCallback)
			}).placeAt(this.buttonsNode);
		},

		_updateAllButtonCallback: function() {

			alertify.confirm(
				this.i18n.updateAllSpeciesConfirmationTitle, this.i18n.updateAllSpeciesConfirmationMessage,
				lang.hitch(this, this._updateAll),
				lang.hitch(this, function() {})).set("labels", {
					ok: this.i18n.ok,
					cancel: this.i18n.cancel
				});
		},

		_updateAll: function() {

			this._publish(this._buildChannel(this.taskChannel, this.actions.WORMS_RUN));
		}
	});
});
