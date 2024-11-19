#!/bin/sh

git submodule --quiet sync

if [ "$1" = "remote" ]
then
	echo ''
	echo '***********************************************'
	echo ' Actualiza a la versión más reciente existente'
	if [ -z "$2" ]
	then
		echo ' todos los módulos'
	else
		echo ' el módulo' $2
	fi
	echo '***********************************************'
	echo ''

	git submodule update --remote --init $2

	if [ "$?" -ne "0" ]
	then
		echo ''
		echo '************************************************'
		echo ' Se ha producido un error en el modo automático'
		echo ' Se reintenta actualizar por otra vía'
		echo '************************************************'
		echo ''

		if [ -z "$2" ]
		then
			git submodule foreach 'branch=$(git config -f $toplevel/.gitmodules submodule.$name.branch || echo master);
				git fetch -t; git checkout $branch && git pull origin $branch'
		else
			branch=$(git config -f .gitmodules submodule.$2.branch || echo master)
			cd $2
			git fetch -t
			git checkout $branch && git pull origin $branch
			cd -
		fi

		if [ "$?" -ne "0" ]
		then
			echo ''
			echo '***********************************************'
			echo ' Se ha producido un error al actualizar alguno'
			echo ' de los módulos, revise el log anterior'
			echo '***********************************************'
			echo ''
		fi
	fi
else
	echo ''
	echo '************************************************'
	echo ' Actualiza a la versión definida en el proyecto'
	if [ -z "$1" ]
	then
		echo ' todos los módulos'
	else
		echo ' el módulo' $1
	fi
	echo '************************************************'
	echo ''

	git submodule update --init $1
fi
