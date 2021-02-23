module.exports = function(args) {

	var remoteHost = args.remoteHost || '127.0.0.1',
		remotePort = args.remotePort || '4444',
		remoteTunnel = remoteHost + ':' + remotePort,

		config = {
			tunnelOptions: {
				host: remoteTunnel
			}
		};

	return config;
};
