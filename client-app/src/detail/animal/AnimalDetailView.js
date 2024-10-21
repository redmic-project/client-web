define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/browser/_Framework'
	, 'src/component/browser/ListImpl'
	, 'src/component/browser/bars/Total'
	, 'templates/AnimalSpecimenTag'
	, 'templates/AnimalInfo'
	, 'app/designs/details/main/_DetailsBase'
], function(
	redmicConfig
	, declare
	, lang
	, _Framework
	, ListImpl
	, Total
	, TemplateAnimalSpecimenTag
	, TemplateInfo
	, _DetailsBase
) {

	return declare(_DetailsBase, {
		//	summary:
		//		Vista de detalle de animales.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.animal,
				activitiesTargetBase: redmicConfig.services.activityAnimals,
				templateInfo: TemplateInfo,
				pathParent: redmicConfig.viewPaths.animalCatalog,
				specimenTagsTarget: 'specimenTags'
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.viewPathsWidgets = {
				activities: redmicConfig.viewPaths.activityDetails
			};
		},

		_setMainConfigurations: function() {

			this.widgetConfigs = this._merge([{
				specimenTagList: this._getSpecimenTagsConfig()
			}, this.widgetConfigs || {}]);

			this.inherited(arguments);
		},

		_getSpecimenTagsConfig: function() {

			return {
				width: 3,
				height: 2,
				type: declare([ListImpl, _Framework]),
				props: {
					title: 'specimenTags',
					target: this.specimenTagsTarget,
					template: TemplateAnimalSpecimenTag,
					bars: [{
						instance: Total
					}]
				}
			};
		},

		_clearModules: function() {

			this.inherited(arguments);

			this._publish(this._getWidgetInstance('specimenTagList').getChannel('CLEAR'));
		},

		_itemAvailable: function(res, resWrapper) {

			if (resWrapper.target === this.target[0]) {
				this._dataToSpecimenTags(res);
				return;
			}

			this.inherited(arguments);
		},

		_dataToSpecimenTags: function(response) {

			var data = response.data,
				specimenTags = data.specimenTags;

			if (specimenTags && specimenTags.length) {
				this._emitEvt('INJECT_DATA', {
					data: specimenTags,
					target: this.specimenTagsTarget
				});
			}
		}
	});
});
