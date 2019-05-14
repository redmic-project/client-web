require([
	'dojo/_base/declare'
	, 'dojo/Deferred'
	, 'dojo/dom'
	, 'redmic/modules/form/input/UploadFileImpl'
], function(
	declare
	, Deferred
	, dom
	, UploadFileImpl
){

	env = new Deferred();
	env.resolve({
		apiUrl: '/api'
	});

	var input = new UploadFileImpl({
		parentChannel: 'test',
		inputProps: {
			url: '{apiUrl}/save',
			maxFiles: 1,
			acceptedFiles: 'image/*'
		}
	});

	input._publish(input.getChannel('SHOW'), {
		node: dom.byId('container')
	});
});
