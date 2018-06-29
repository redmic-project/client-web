require([
	'dojo/_base/declare'
	, 'dojo/dom'
	, 'redmic/modules/form/_CreateInternalKeypad'
	, 'redmic/modules/form/FormContainerImpl'
	, 'tests/support/resources/DomainModel'
], function(
	declare
	, dom
	, _CreateInternalKeypad
	, FormContainerImpl
	, DomainModel
) {

	var formDefinition = declare([FormContainerImpl, _CreateInternalKeypad]),
		form = new formDefinition({
			parentChannel: 'test',
			target: 'test',
			template: 'maintenance/domains/templates/forms/Domain',
			modelSchema: DomainModel
		});

	form._publish(form.getChannel('SHOW'), {
		node: dom.byId('container')
	});
});
