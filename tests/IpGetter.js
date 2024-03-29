module.exports = function() {

	var os = require('os'),
		interfaces = os.networkInterfaces(),
		localIpExpr = /(^10\.)|(^192\.168\.)/gi;

	function pushValidAddress(ipList, addressProps) {

		var addr = addressProps.address,
			family = addressProps.family,
			isIpV4 = family === 'IPv4' || family === 4;

		if (!isIpV4 || addressProps.internal || !localIpExpr.test(addr)) {
			return;
		}
		ipList.push(addr);
	}

	function getIp() {

		var ipList = [];

		for (var interfaceName in interfaces) {
			var interfaceItem = interfaces[interfaceName];
			interfaceItem.forEach(pushValidAddress.bind(null, ipList));
		}

		var firstIp = ipList && ipList[0];
		console.log('Found local IP addresses:', ipList, ', using:', firstIp);

		return firstIp;
	}

	return {
		getIp: getIp
	};
};
