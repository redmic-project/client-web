define([
	'src/maintenance/domain/_HierarchicalDomain'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/ThematicTypeList'
], function(
	_HierarchicalDomain
	, declare
	, lang
	, ThematicTypeListTemplate
){
	return declare(_HierarchicalDomain, {
		//	summary:
		//		Vista de ThematicType.

		constructor: function(args) {

			this.config = {
				title: this.i18n['thematic-type'],
				target: this.services.thematicType
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.formConfig = this._merge([{
				template: 'src/maintenance/domain/form/ThematicType'
			}, this.formConfig || {}]);

			this.browserConfig = this._merge([{
				template: ThematicTypeListTemplate,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-tint',
							btnId: 'colorPicker',
							title: 'color',
							condition: function(item) {

								return item.colour;
							},
							startup: lang.hitch(this, this._startupColorIcon)
						}]
					}
				}
			}, this.browserConfig || {}]);
		},

		_startupColorIcon: function(nodeIcon, item) {

			if (item.colour) {
				nodeIcon.setAttribute('style', 'color:' + item.colour + ' !important; text-shadow: 0px 0px 3px white;');
			}
		}
	});
});
