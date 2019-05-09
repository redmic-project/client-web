module.exports = function(args) {

	var remoteHost = args.remoteHost || '192.168.40.6',
		remotePort = args.remotePort || '4444',
		remoteTunnel = remoteHost + ':' + remotePort,

		config = {
			tunnelOptions: {
				host: remoteTunnel
			}
		};

	return config;
};
