define([
	'app/base/views/extensions/_EditionView'
	, 'app/base/views/extensions/_FormInDialogView'
	, 'app/designs/base/_Main'
	, 'app/designs/textSearchList/Controller'
	, 'app/designs/textSearchList/layout/BasicAndButtonsTopZone'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/InfrastructureAttributesList'
], function(
	_EditionView
	, _FormInDialogView
	, _Main
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, templateList
){
	return declare([Layout, Controller, _Main, _EditionView, _FormInDialogView], {
		//	summary:
		//		Vista de los atributos de una infractructura.

		constructor: function(args) {

			this.config = {
				idProperty: 'id',
				attributesByInfrastructureBaseTarget: redmicConfig.services.attributesByInfrastructure,
				infrastructureTarget: redmicConfig.services.infrastructureByActivity,
				initView: true,
				title: '{name}: ' + this.i18n.attributes
			};

			lang.mixin(this, this.config, args);

			this.target = lang.replace(this.attributesByInfrastructureBaseTarget, this.pathVariableId);
		},

		_setMainConfigurations: function() {

			this.browserConfig = this._merge([{
				template: templateList,
				rowConfig: {
					buttonsConfig: {
						listButton: []
					}
				}
			}, this.browserConfig || {}]);

			this.formConfig = this._merge([{
				template: 'dataLoader/infrastructure/views/templates/form/Attributes'
			}, this.formConfig || {}]);

			this.filterConfig = this._merge([{
				initQuery: {
					accessibilityIds: null
				}
			}, this.filterConfig || {}]);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('CONNECT', this._createTarget);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._getInfrastructure();

			this._emitEvt("REFRESH");
		},

		_createTarget: function() {

			var target = lang.replace(this.attributesByInfrastructureBaseTarget, this.pathVariableId);

			if (this.target === target) {
				return;
			}

			this.target = target;

			this._emitEvt('UPDATE_TARGET', {
				target: target,
				refresh: true
			});

			this._getInfrastructure();
		},

		_getInfrastructure: function() {

			this.lastTarget = lang.clone(this.target);

			this.target = lang.replace(this.infrastructureTarget, {
				id: this.pathVariableId.activityid
			});

			this._emitEvt('GET', {
				target: this.target,
				requesterId: this.getOwnChannel(),
				id: this.pathVariableId.id
			});
		},

		_itemAvailable: function(res) {

			if (!this.lastTarget) {
				return this.inherited(arguments);
			}

			this.target = this.lastTarget;
			delete this.lastTarget;

			var properties = res.data.properties;

			this._updateTitle(lang.replace(this.title, properties));
		}
	});
});
