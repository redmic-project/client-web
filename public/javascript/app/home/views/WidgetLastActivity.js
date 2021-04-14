define([
	"app/redmicConfig"
	, "app/base/views/_LoadingWidget"
	, "app/home/views/_DashboardItem"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/base/_Store"
	, "templates/ActivityList"
], function(
	redmicConfig
	, _LoadingWidget
	, _DashboardItem
	, declare
	, lang
	, put
	, _Filter
	, _Store
	, templateList
) {
	return declare([_DashboardItem, _Filter, _Store, _LoadingWidget], {
		//	summary:
		//		Widget para la creación de un elemento Last Activity del modulo Initial
		//
		// description:
		//

		constructor: function(args){

			this.config = {
				icon: 'fa-refresh',
				maxItems: 10,
				target: redmicConfig.services.activity
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);
		},

		load: function(args) {

			this._emitEvt('ADD_TO_QUERY', {
				query: {
					from: 0,
					size: this.maxItems,
					sorts: [{
						field: "id",
						order: "DESC"
					}]
				},
				requesterId: this.getOwnChannel()
			});
		},

		_dataAvailable: function(data) {

			data = data.data.data;

			if (data.length) {
				for (var i = 0; i < data.length; i++) {
					var containerActivity = put(this.contentNode, "div.lastActivityModule");

					var spanNode = put(containerActivity, "span");

					spanNode.innerHTML = templateList({data: data[i], i18n: this.i18n});

					spanNode.setAttribute('title', data[i].name);

					put(containerActivity, 'a[href="/catalog/activity-info/' +
						data[i].id + '"][d-state-url=true] .fa.fa-info-circle');
				}
			}
		}
	});
});
