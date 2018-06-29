module.exports = function(args) {

	var os = require('os'),
		interfaces = os.networkInterfaces();

	function pushValidAddress(ipList, addressProps) {

		if ('IPv4' !== addressProps.family || addressProps.internal) {
			return;
		}

		ipList.push(addressProps.address);
	}

	function getIp() {

		var ipList = [];

		for (var interfaceName in interfaces) {
			var interfaceItem = interfaces[interfaceName];

			interfaceItem.forEach(pushValidAddress.bind(null, ipList));
		}

		var firstIp = ipList && ipList[0];
		console.log('Found IP addresses:', ipList, ', using:', firstIp);

		return firstIp;
	}

	return {
		getIp: getIp
	};
};
