#!/bin/sh

cp .gitmodules .gitmodules.old
echo ''
echo 'Copia de seguridad del fichero .gitmodules en .gitmodules.old'
echo ''
echo '*******************************************************************'
echo ' Antes de ejecutar addModules a continuación, recuerde especificar'
echo ' en el fichero .gitmodules los módulos deseados'
echo '*******************************************************************'

git config -f .gitmodules --get-regexp '^submodule\..*\.path$' |
	while read path_key path
	do
		if [ -z "$1" ] || [ "$1" = "$path" ]
		then
			echo ''
			echo 'Borrando módulo' $path

			echo '   ... sección en .gitmodules'
			git config -f .gitmodules --remove-section submodule.$path
			git add .gitmodules

			echo '   ... sección en .git/config'
			git config -f .git/config --remove-section submodule.$path

			echo '   ... caché'
			git rm --cached --quiet $path

			echo '   ... repositorio local'
			rm -rf ./.git/modules/$path

			echo '   ... directorio'
			rm -rf $path
		fi
	done
