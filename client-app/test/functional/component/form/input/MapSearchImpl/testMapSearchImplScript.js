require([
	'dojo/_base/declare'
	, 'dojo/dom'
	, 'src/component/form/input/MapSearchImpl'
], function(
	declare
	, dom
	, Impl
){

	var input = new Impl({
		parentChannel: 'test',
		inputProps: {}
	});

	input._publish(input.getChannel('SHOW'), {
		node: dom.byId('container')
	});
});
