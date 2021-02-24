module.exports = function(grunt) {

	var commonTasks = ['defineTestConfig'],

		commonOptionParameters = [
			'"--ownServerPort=port" para redefinir puerto del servidor de intern (por defecto, 9000)'
			, '"--ownSocketPort=port" para redefinir puerto del socket de intern (por defecto, "ownServerPort" + 1)'
			, '"--ownTunnelPort=port" para redefinir puerto del túnel selenium (por defecto, "ownServerPort" + 2)'
			, '"--suitesGroups=suitesFolderName" para indicar grupos de suites ejecutar desde la raíz correspondiente'
			, '"--browser" para elegir navegadores a usar, soporta definiciones múltiples y lista separada por comas ' +
				'(por defecto, chrome)'
			, '"--headless" para ejecutar sin interfaz'
		],

		remoteOptionParameters = [
			'"--remoteHost=host" para redefinir la dirección del servicio de testeo remoto'
			, '"--remotePort=port" para redefinir el puerto del servicio de testeo remoto'
			, '"--ownServerHost=host" para redefinir dirección del servidor de intern, para indicarle al túnel remoto'
		],

		unitOptionParameters = [
			'"--suites=suitesFilePath" para indicar que ficheros de suites ejecutar (inhabilita "suitesGroups")'
			, '"--coverage=pathsToCover" para indicar que rutas incluir en la cobertura (por defecto, en todas)'
		],

		functionalOptionParameters = [
			'"--functionalSuites=suitesFilePath" para indicar ficheros de suites a ejecutar (inhabilita "suitesGroups")'
			, '"--role=userRole" para definir el nivel de permisos del usuario'
			, '"--user=userEmail" para definir el nombre de acceso del usuario'
			, '"--pass=userPassword" para definir el password de acceso del usuario'
			, '"--serverUrl=url" para definir la dirección de la aplicación a testear'
		];

	grunt.registerTask('test-unit-local',
		['Ejecuta los tests unitarios en entorno local']
			.concat(commonOptionParameters)
			.concat(unitOptionParameters)
			.join('\n'),
		commonTasks.concat(['intern:test-unit-local']));

	grunt.registerTask('test-functional-local',
		['Ejecuta los tests funcionales en entorno local']
			.concat(commonOptionParameters)
			.concat(functionalOptionParameters)
			.join('\n'),
		commonTasks.concat(['intern:test-functional-local']));

	grunt.registerTask('test-unit-remote',
		['Ejecuta los tests unitarios en entorno remoto']
			.concat(commonOptionParameters)
			.concat(unitOptionParameters)
			.concat(remoteOptionParameters)
			.join('\n'),
		commonTasks.concat(['intern:test-unit-remote']));

	grunt.registerTask('test-functional-remote',
		['Ejecuta los tests funcionales en entorno remoto']
			.concat(commonOptionParameters)
			.concat(functionalOptionParameters)
			.concat(remoteOptionParameters)
			.join('\n'),
		commonTasks.concat(['intern:test-functional-remote']));

	grunt.registerTask('test', ['test-unit-local']);

	grunt.registerTask('test-functional-local-parallel',
		'Ejecuta los tests funcionales en entorno local de manera paralela',
		function() {

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

		grunt.task.run('shell:test-functional-local-parallel');
	});
};
