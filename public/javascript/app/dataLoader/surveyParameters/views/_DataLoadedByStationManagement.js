define([
	"app/dataLoader/base/_GeographicBase"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	_GeographicBase
	, declare
	, lang
	, aspect
){
	return declare(_GeographicBase, {
		//	summary:
		//		Base de vistas de gestión de datos cargados en estaciones para una actividad concreta.
		//	description:
		//

		constructor: function(args) {

			this.config = {};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setConfigurations", lang.hitch(this,
				this._setDataLoadedByStationManagementConfigurations));
		},

		_setDataLoadedByStationManagementConfigurations: function() {

			this.browserConfig = this._merge([{
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-map-marker",
							title: "map centering",
							btnId: "mapCentering",
							returnItem: true
						},{
							icon: "fa-table",
							btnId: "table",
							title: "table",
							href: this.dataDefinitionsPath
						},{
							groupId: "edition",
							icons: [{
								icon: "fa-edit",
								btnId: "edit",
								title: "edit",
								option: "default",
								href: this.editPath
							},{
								icon: "fa-upload",
								btnId: "load",
								title: "load",
								href: this.loadPath
							}]
						}]
					}
				}
			}, this.browserConfig || {}]);

			this.filterConfig = this._merge([{
				initQuery: {
					vFlags: null,
					qFlags: null
				}
			}, this.filterConfig || {}]);
		},

		_replaceVariablesInTargetAndPaths: function() {

			this.inherited(arguments);

			this.dataDefinitionsPath = this._replaceVariablesInStringWithItem(this.dataDefinitionsPath);
		},

		_replaceVariablesInString: function(str) {

			return lang.replace(str, {
				activityid: this.pathVariableId,
				id: "{" + this.idProperty + "}"
			});
		}
	});
});
