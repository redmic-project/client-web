module.exports = function(args) {

	var IpGetter = require('./IpGetter')(),
		remoteHost = args.remoteHost || '127.0.0.1',
		remotePort = args.remotePort || '4444',
		remoteTunnel = remoteHost + ':' + remotePort,

		serverUrl = args.serverUrl,
		ownServerHost = args.ownServerHost,
		ownServerPort = args.ownServerPort;

	if (!ownServerHost || !ownServerHost.length) {
		ownServerHost = IpGetter.getIp();
	}

	var ownServerUrl = 'http://' + ownServerHost + ':' + ownServerPort;

	return {
		capabilities: {
			remoteFiles: true
		},
		tunnelOptions: {
			host: remoteTunnel
		},
		serverUrl: serverUrl || ownServerUrl
	};
};
