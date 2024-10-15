define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'app/base/views/extensions/_EditionWizardView'
], function(
	declare
	, lang
	, aspect
	, _EditionWizardView
) {

	return declare(_EditionWizardView, {
		//	summary:
		//		Extensión de vista de catálogo de actividades para añadir funcionalidad relativa a la edición de
		//		registros.

		constructor: function(args) {

			this.config = {
				addPath: this.viewPaths.activityAdd
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_setConfigurations', lang.hitch(this, this._setActivityEditionConfigurations));
			aspect.before(this, '_setBrowserButtons', lang.hitch(this, this._setActivityEditionBrowserButtons));
		},

		_setActivityEditionConfigurations: function() {

			if (!this.listButtonsEdition) {
				console.warn('Tried to add activity load data button, but edition buttons config was not found!');
				return;
			}

			this.listButtonsEdition.push({
				icon: 'fa-keyboard-o',
				btnId: 'goToChildren',
				href: [
					lang.replace(this.viewPaths.activityGeoDataAdd, {
						activityid: '{id}',
						id: 'new'
					}),
					this.viewPaths.activityCitation,
					this.viewPaths.activitySurveyStation,
					this.viewPaths.activityObjectCollection,
					this.viewPaths.activityTracking,
					this.viewPaths.activityInfrastructure,
					this.viewPaths.activityArea
				],
				chooseHref: function(item) {

					var activityTypeId = item.activityType.id,
						activityCategory = item.activityCategory,
						validActivityTypeCitation = [2, 10];

					if (activityCategory === 'ci' || validActivityTypeCitation.indexOf(activityTypeId) !== -1) {
						return 1;
					}
					if (activityCategory === 'ft') {
						return 2;
					}
					if (activityCategory === 'oc') {
						return 3;
					}
					if (['at', 'pt', 'tr'].indexOf(activityCategory) !== -1) {
						return 4;
					}
					if (activityCategory === 'if') {
						return 5;
					}
					if (activityCategory === 'ar') {
						return 6;
					}

					return 0;
				},
				title: 'data-loader'
			});
		},

		_setActivityEditionBrowserButtons: function() {

			if (!this.listButtonsEdition) {
				console.warn('Tried to add activity edition buttons, but edition buttons config was not found!');
				return;
			}

			var findIndexCallback = lang.hitch(this, function(button) {

				return button.groupId && button.groupId === this._editionGroupId;
			});

			var editionButtonIndex = this.listButtonsEdition.findIndex(findIndexCallback);

			if (editionButtonIndex !== -1) {
				this.listButtonsEdition[editionButtonIndex].icons.push({
					icon: 'fa-edit',
					btnId: 'edit',
					title: 'edit',
					option: 'default',
					href: this.viewPaths.activityEdit
				},{
					icon: 'fa-copy',
					btnId: 'copy',
					title: 'copy',
					href: this.viewPaths.activityAdd
				});
			} else {
				console.warn('Tried to add activity edition buttons, but edition button group config was not found!');
			}
		}
	});
});
