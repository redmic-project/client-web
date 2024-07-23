define([
	"app/base/views/extensions/_EditionFormList"
	, "app/components/steps/_RememberDeleteItems"
	, "app/designs/formList/main/FormListByStep"
	, "app/designs/formList/layout/Layout"
	, "app/edition/views/ParameterEditionView"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_ShowInPopup"
	, "templates/DataDefinitionList"
], function (
	_EditionFormList
	, _RememberDeleteItems
	, Main
	, Layout
	, ParameterEditionView
	, redmicConfig
	, declare
	, lang
	, _ShowInPopup
	, TemplateList
){
	return declare([Layout, Main, _EditionFormList, _RememberDeleteItems], {
		//	summary:
		//		Step de Data definition.

		constructor: function (args) {

			this.config = {
				// WizardStep params
				label: this.i18n.dataDefinition,
				title: this.i18n.dataDefinitionsAssociated,
				propertyName: "properties/measurements",
				propToRead: "properties/measurements",
				propsToClean: ['id', 'localId'],
				// General params
				target: redmicConfig.services.dataDefinition,

				ownChannel: "dataDefinitionSetStep"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.formConfig = this._merge([{
				modelTarget: redmicConfig.services.measurement
			}, this.formConfig || {}]);

			this.browserConfig = this._merge([{
				browserConfig: {
					template: TemplateList,
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								groupId: "edition",
								icons: [{
									icon: "fa-copy",
									btnId: "copy",
									title: "copy"
								}]
							}]
						}
					}
				}
			}, this.browserConfig || {}]);

			this.addParameterConfig = this._merge([{
				parentChannel: this.getChannel(),
				title: this.i18n.addSurveyStation,
				width: 10,
				height: "lg",
				lockBackground: true,
				pathVariableId: "new"
			}, this.addConfig || {}]);
		},

		postCreate: function() {

			this._once(this.form.getChannel('SHOWN'), lang.hitch(this, function() {

				this._publish(this.form.getChannel("SET_METHOD"), {
					"_onNewParameter": lang.hitch(this, this._onNewParameter)
				});
			}));

			this.inherited(arguments);
		},

		_onNewParameter: function() {

			if (!this._wizardParameter) {
				this._wizardParameter = new declare(ParameterEditionView).extend(_ShowInPopup)(this.addParameterConfig);
				this._setSubscription({
					channel : this._wizardParameter.getChannel("EDITION_SUCCESS"),
					callback: "_subEditionSuccess"
				});
			}

			this._publish(this._wizardParameter.getChannel("SHOW"));
		},

		_subEditionSuccess: function(res) {

			this._publish(this.form.getChannel("SET_PROPERTY_VALUE"), {
				propertyName: "parameter",
				value: res.body || res
			});
		}
	});
});
