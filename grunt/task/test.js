module.exports = function(grunt) {

	var commonTasks = ['defineTestConfig'],

		commonOptionParameters = [
			'"--ownServerPort=port" para redefinir puerto del servidor de intern (por defecto, 9000)'
			, '"--ownSocketPort=port" para redefinir puerto del socket de intern (por defecto, "ownServerPort" + 1)'
			, '"--ownTunnelPort=port" para redefinir puerto del túnel selenium (por defecto, "ownServerPort" + 2)'
			, '"--suitesGroups=suitesFolderName" para indicar grupos de suites ejecutar desde la raíz correspondiente'
			, '"--browser" para elegir navegadores a usar, soporta definiciones múltiples y lista separada por comas ' +
				'(por defecto, chrome)'
			, '"--seleniumVersion=version" para definir una versión del túnel Selenium (por defecto, automática)'
			, '"--chromeVersion=version" para definir una versión del driver para Chrome (por defecto, automática)'
			, '"--firefoxVersion=version" para definir una versión del driver para Firefox (por defecto, automática)'
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
};
