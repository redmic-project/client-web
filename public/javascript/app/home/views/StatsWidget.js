define([
	'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/base/_Store'
	, 'redmic/modules/browser/_ButtonsInRow'
	, 'redmic/modules/browser/ListImpl'
	, 'templates/AdministrativeStatisticsList'
], function(
	redmicConfig
	, declare
	, lang
	, _Module
	, _Show
	, _Store
	, _ButtonsInRow
	, ListImpl
	, ListTemplate
) {

	return declare([_Module, _Show, _Store], {
		//	summary:
		//		Widget contenedor de estadísticas públicas de la plataforma

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.administrativeStatistics,
				_browserTarget: 'browserStatistics',
				'class': 'statsPanel',
				_titleRightButtonsList: []
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.browserConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this._browserTarget,
				template: ListTemplate,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-arrow-right',
							btnId: 'details',
							title: this.i18n.info,
							href: '/admin/{href}'
						}]
					}
				}
			}, this.browserConfig || {}]);

			var browserDefinition = declare([ListImpl, _ButtonsInRow]);
			this.browser = new browserDefinition(this.browserConfig);
		},

		_afterShow: function() {

			if (this._getPreviouslyShown()) {
				return;
			}

			this._publish(this.browser.getChannel('SHOW'), {
				node: this.domNode
			});

			this._emitEvt('REQUEST', this._getRequestObj());
		},

		_getRequestObj: function() {

			return {
				target: this.target,
				method: 'GET',
				type: 'API',
				requesterId: this.getOwnChannel()
			};
		},

		_dataAvailable: function(res, resWrapper) {

			var data = res.data;

			if (!data) {
				return;
			}

			var id = 1;

			for (var item in data) {
				var result = {};
				result.data = data[item];
				result.name = item;
				result.id = id;

				if ('activityOutProject' === item) {
					result.href = 'activity';
				} else if ('projectOutProgram' === item) {
					result.href = 'project';
				} else {
					result.href = item;
				}

				this._emitEvt('INJECT_ITEM', {
					data: result,
					target: this._browserTarget
				});

				id++;
			}
		}
	});
});
