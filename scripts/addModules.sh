#!/bin/sh

echo ''
echo '********************************************************'
echo ' Sincroniza módulos presentes en el fichero .gitmodules'
echo '********************************************************'
echo ''
git submodule sync

echo ''
echo '***************************************************'
echo ' Añade módulos presentes en el fichero .gitmodules'
echo '***************************************************'
git config -f .gitmodules --get-regexp '^submodule\..*\.path$' |
	while read path_key path
	do
		echo ''
		echo 'Añadiendo módulo' $path

		url_key=$(echo $path_key | sed 's/\.path/.url/')
		url=$(git config -f .gitmodules --get "$url_key")
		branch_key=$(echo $path_key | sed 's/\.path/.branch/')
		branch=$(git config -f .gitmodules --get "$branch_key")

		git submodule add --force -b $branch $url $path
	done

echo ''
echo '********************************************************'
echo ' Actualiza módulos a la versión definida en el proyecto'
echo '********************************************************'
echo ''
git submodule update --init

echo ''
echo '*****************************'
echo ' Estado final de los módulos'
echo '*****************************'
echo ''
git submodule status
