let logger;

function onOwnRequestResponse(bindParams, internalRes) {

	let chunks = [];

	internalRes.on('data', (function(nestedChunks, chunk) {

		nestedChunks.push(chunk);
	}).bind(this, chunks));

	internalRes.on('end', (function(nestedBindParams, nestedChunks) {

		let content = "";

		for (let i = 0; i < nestedChunks.length; i++) {
			content += nestedChunks[i].toString();
		}

		const originalRes = nestedBindParams.originalRes,
			onSuccess = nestedBindParams.onSuccess || onOwnRequestSuccess,
			onError = nestedBindParams.onError || onOwnRequestError,
			afterResponse = nestedBindParams.afterResponse;

		if (this.statusCode < 400) {
			onSuccess.bind(this)(originalRes, content);
		} else {
			onError.bind(this)(originalRes, content);
		}

		if (afterResponse) {
			afterResponse(this.statusCode, content);
		}
	}).bind(internalRes, bindParams, chunks));
}

function onOwnRequestSuccess(originalRes, content) {

	originalRes.status(this.statusCode).send(content);

	const internalUrl = this.req.protocol + '//' + this.req.host + this.req.path,
		internalRequestMessage = `INTERNAL ${this.req.method} ${internalUrl} ${this.statusCode}`;

	logger.info(internalRequestMessage);
}

function onOwnRequestError(originalRes, err) {

	originalRes.set('Content-Type', 'application/json');

	originalRes.status(500).send({
		code: 'Server error',
		description: 'Something went wrong at server. Please, try again.'
	});

	const errorMessage = err instanceof Object ? err.toString() : err;
	logger.error(errorMessage);
}

module.exports = function(loggerParameter) {

	logger = loggerParameter;

	return {
		onOwnRequestResponse: onOwnRequestResponse,
		onOwnRequestError: onOwnRequestError
	};
};
