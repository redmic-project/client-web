define([
	"app/designs/textSearchFacetsList/_AddComposite"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "templates/FilterSpeciesForm"
], function(
	_AddComposite
	, declare
	, lang
	, aspect
	, formTemplate
){
	return declare(_AddComposite, {
		// summary:
		//

		constructor: function (args) {

			this.config = {
				addCompositeTaxonActions: {
					WORMS_RUN: "wormsRun"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixAddCompositeTaxonEventsAndActions));
			aspect.before(this, "_afterSetConfigurations",	lang.hitch(this, this._setAddCompositeTaxonConfigurations));
		},

		_setAddCompositeTaxonConfigurations: function() {

			this.compositeConfig = this._merge([{
				formConfig: {
					template: formTemplate,
					formContainerConfig: {
						ignoreNonexistentProperty: false
					},
					valueChanged: lang.hitch(this, this.valueChangedForm)
				}
			}, this.compositeConfig || {}]);
		},

		_mixAddCompositeTaxonEventsAndActions: function() {

			lang.mixin(this.actions, this.addCompositeTaxonActions);

			delete this.addCompositeTaxonActions;
		},

		valueChangedForm: function(response) {

			var name = "isAphia",
				obj = {
					aphia: null
				};

			if (response.name != name) {
				return;
			}

			if (response.value) {
				obj.aphia = 'isNull';
			}

			this._emitEvt('ADD_TO_QUERY', {
				query: {
					terms: obj
				},
				omitRefresh: true
			});
		}
	});
});
