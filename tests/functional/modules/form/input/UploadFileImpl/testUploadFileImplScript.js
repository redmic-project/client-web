require([
	'dojo/_base/declare'
	, 'dojo/dom'
	, 'redmic/modules/form/input/UploadFileImpl'
], function(
	declare
	, dom
	, UploadFileImpl
){

	var input = new UploadFileImpl({
		parentChannel: 'test',
		inputProps: {
			url: '/api/save',
			maxFiles: 1,
			acceptedFiles: 'image/*'
		}
	});

	input._publish(input.getChannel('SHOW'), {
		node: dom.byId('container')
	});
});
