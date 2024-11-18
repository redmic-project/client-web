module.exports = function(grunt) {

	grunt.config('shell.test-functional-local-parallel', {
		command: function() {

			var serverUrlParam = grunt.option('serverUrl'),
				userParam = grunt.option('user'),
				passParam = grunt.option('pass'),
				serverPort = 9000,
				gruntCommand = 'grunt test-functional-local --headless',

				publicZoneGroups = 'catalog,catalogDetails,viewers,products',
				administrativeZoneGroup = 'administrative,!administrative/taxonomy',
				taxonomyZoneGroup = 'administrative/taxonomy',
				dataLoaderAndAdministrativeDetailsZoneGroup = 'administrativeDetails,dataLoader',
				maintenanceAndAdminDomainsZoneGroup = 'maintenance,!maintenance/domains/taxon' +
					',!maintenance/domains/observations',
				taxonAndObservationDomainsZoneGroup = 'maintenance/domains/observations,maintenance/domains/taxon',

				portParam = ' --ownServerPort=',

				guestCommonTestsParams = ' --role=guest --suitesGroups=',

				guestTestsParams = guestCommonTestsParams + publicZoneGroups,

				specificParamsList = [],
				specificParams,

				userCommonTestsParams = ' --role=administrator --user=' + userParam + ' --pass=' + passParam +
					' --suitesGroups=',

				userZoneGroupsList = [
					publicZoneGroups, administrativeZoneGroup, taxonomyZoneGroup,
					dataLoaderAndAdministrativeDetailsZoneGroup, maintenanceAndAdminDomainsZoneGroup,
					taxonAndObservationDomainsZoneGroup
				],

				commonGuestZoneGroups = guestCommonTestsParams + 'common',
				commonUserZoneGroups = userCommonTestsParams + 'common',

				cmds = [],
				commandsGrunt = '';

			if (serverUrlParam) {
				gruntCommand += ' --serverUrl="' + serverUrlParam + '"';
			}

			for (var i = 0; i < userZoneGroupsList.length; i++) {
				specificParamsList.push(userCommonTestsParams + userZoneGroupsList[i]);
			}

			commandsGrunt = gruntCommand + commonGuestZoneGroups + portParam + serverPort + ' ; ';
			serverPort += 3;

			commandsGrunt += gruntCommand + commonUserZoneGroups + portParam + serverPort + ' ; ';
			serverPort += 3;

			commandsGrunt += gruntCommand + guestTestsParams + portParam + serverPort + ' ; ';
			serverPort += 3;

			var firstPartSpecificParamsList = Math.floor(specificParamsList.length / 2);

			for (i = 0; i < firstPartSpecificParamsList; i++) {
				specificParams = specificParamsList[i];

				cmds.push(gruntCommand + specificParams + portParam + serverPort);
				serverPort += 3;
			}

			commandsGrunt += cmds.join(' & ') + ' ; ';
			cmds = [];

			for (i = firstPartSpecificParamsList; i < specificParamsList.length; i++) {
				specificParams = specificParamsList[i];

				cmds.push(gruntCommand + specificParams + portParam + serverPort);
				serverPort += 3;
			}

			commandsGrunt += cmds.join(' & ');

			return commandsGrunt;
		}
	});
};
