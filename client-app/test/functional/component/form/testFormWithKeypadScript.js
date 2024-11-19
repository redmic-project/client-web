require([
	'dojo/_base/declare'
	, 'dojo/dom'
	, 'src/component/form/_CreateInternalKeypad'
	, 'src/component/form/FormContainerImpl'
	, 'test/support/resources/DomainModel'
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
			template: 'src/maintenance/domain/form/Domain',
			modelSchema: DomainModel
		});

	form._publish(form.getChannel('SHOW'), {
		node: dom.byId('container')
	});
});
