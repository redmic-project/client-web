define([
	'src/home/item/_DashboardItem'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
], function(
	_DashboardItem
	, declare
	, lang
	, put
) {

	return declare(_DashboardItem, {
		//	summary:
		//		Widget contenedor de enlaces sociales

		constructor: function(args) {

			this.config = {
				items: [{
					url: '/feedback',
					label: 'Feedback',
					icon: 'fa-envelope-o'
				},{
					url: 'https://twitter.com/redmic_project',
					label: 'Twitter',
					icon: 'fa-twitter'
				},{
					url: 'https://www.linkedin.com/company/redmic',
					label: 'LinkedIn',
					icon: 'fa-linkedin'
				},{
					url: 'https://www.youtube.com/@redmic-project',
					label: 'YouTube',
					icon: 'fa-youtube'
				},{
					url: 'https://redmicdev.wordpress.com',
					label: 'WordPress',
					icon: 'fa-wordpress'
				},{
					url: 'https://docs.redmic.es',
					label: 'Docs',
					icon: 'fa-book'
				}],
				className: 'socialPanel'
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._createItems();
		},

		_createItems: function() {

			var parentNode = put(this.contentNode, 'div.' + this.className);

			for (var i = 0; i < this.items.length; i++) {
				this._createItem(parentNode, this.items[i]);
			}
		},

		_createItem: function(parentNode, item) {

			var node = put(parentNode, 'a[href=' + item.url + '][target=_blank]');

			put(node, 'i.fa.' + item.icon + '[title=' + item.label + ']');
		}
	});
});
