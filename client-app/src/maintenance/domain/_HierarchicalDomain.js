define([
	'app/designs/textSearchList/main/Domain'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, "src/component/browser/HierarchicalImpl"
], function(
	DomainMain
	, declare
	, lang
	, aspect
	, HierarchicalImpl
){
	return declare(DomainMain, {
		//	summary:
		//		Base de vistas de dominio con listado jerárquico.

		constructor: function(args) {

			this.config = {
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_setConfigurations', lang.hitch(this, this._setHierarchicalDomainConfigurations));
		},

		_setHierarchicalDomainConfigurations: function() {

			this.browserBase.shift();

			this.browserBase.unshift(HierarchicalImpl);

			this.filterConfig = this._merge([{
				initQuery: {
					size: null,
					from: null
				}
			}, this.filterConfig || {}]);

			this.formConfig = this._merge([{
				template: 'src/maintenance/domain/form/HierarchicalDomain'
			}, this.formConfig || {}]);

			this.browserConfig = this._merge([{
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-plus',
							btnId: 'addNewChildElement',
							title: 'addNewChildElement',
							returnItem: true
						}]
					}
				},
				orderConfig: {
					options: [
						{value: 'code'}
					]
				}
			}, this.browserConfig || {}], {
				arrayMergingStrategy: 'concatenate'
			});
		},

		_addNewChildElementCallback: function(evt) {

			var parentId = evt[this.idProperty];

			this._publish(this.editor.getChildChannel('modelInstance', 'SET_PROPERTY_VALUE'), {
				parent: parentId
			});

			this._emitEvt('ADD');
		}
	});
});
