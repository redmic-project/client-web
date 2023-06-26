# REDMIC web client

| Metric | Master | Dev |
|:-:|:-:|:-:|
| CI status | [![pipeline status](https://gitlab.com/redmic-project/client/web/badges/master/pipeline.svg)](https://gitlab.com/redmic-project/client/web/commits/master) | [![pipeline status](https://gitlab.com/redmic-project/client/web/badges/dev/pipeline.svg)](https://gitlab.com/redmic-project/client/web/commits/dev) |
| Test coverage | - | [![coverage report](https://gitlab.com/redmic-project/client/web/badges/dev/coverage.svg)](https://gitlab.com/redmic-project/client/web/commits/dev) |

Cliente web de REDMIC.

## Entorno de desarrollo

Una vez clonado el repositorio en el entorno local de desarrollo y satisfechas las dependencias base del sistema, es posible instalar las dependencias necesarias que define el proyecto y arrancar el servicio:

```sh
yarn install

OAUTH_URL=https://redmic.grafcan.es/api/oauth \
OAUTH_CLIENT_ID=app \
OAUTH_CLIENT_SECRET=secretKey \
API_URL=https://redmic.grafcan.es/api \
PRODUCTION=0 \
npm start -- --port=80
```

Para poder arrancar usando el puerto 80, es necesario tener los permisos adecuados. Si el comando anterior falla por este motivo, ejecutar una vez lo siguiente para conceder permisos a NodeJS e intentarlo de nuevo:

```sh
apt-get install libcap2-bin
setcap cap_net_bind_service=+ep `readlink -f \`which node\``
```

Si todo ha ido correctamente, el servicio *REDMIC web* estará accesible en <http://localhost>.

Es posible personalizar los puntos de conexión hacia la parte servidora y otros ajustes, según se necesite.

Para facilitar las tareas repetitivas, se han creado una serie de tareas ejecutables mediante **Grunt**. Más información en <https://gitlab.com/redmic-project/client/web/-/wikis/grunt>.

## Compilación

Para optimizar la ejecución es necesario realizar un proceso de "compilación" de la aplicación.

Más información en <https://gitlab.com/redmic-project/client/web/-/wikis/dojo-compile>.

## Páginas estáticas

Para permitir el consumo de la aplicación desde clientes que no soportan ejecución Javascript, existe una funcionalidad de pre-renderizado de las páginas, que sólo actúa cuando se identifica a este tipo de clientes.

Esto es útil para clientes como los bots de redes sociales, que necesitan tener la página ya procesada para extraer los diferentes meta-tags asociados. De esta manera, podrán crear enlaces enriquecidos hacia la plataforma cuando los usuarios compartan contenido.

Para activarlo, basta con lanzar previamente el servicio (Prerender)[https://gitlab.com/redmic-project/client/prerender] e indicar dónde está accesible mediante la variable `PRERENDER_URL`. En caso de que el cliente no lo requiera o que no se encuentre el servicio activo, simplemente se responderá con contenido dinámico.

## Testeo

Se ha preparado una batería de pruebas, tanto unitarias como funcionales, que permiten evaluar el estado del proyecto a medida que se aplican cambios en la base de código.

Más información en <https://gitlab.com/redmic-project/client/web/-/wikis/test-main>.

### Ejemplos de ejecución de tests locales

Como ejemplo de ejecución de tests locales (unitarios y funcionales), veamos los comandos para probar la implementación de modelos y la funcionalidad de los módulos de REDMIC.

* Tests unitarios de implementación de modelos, en navegador Google Chrome sin interfaz y con omisión de análisis de cobertura:

```sh
grunt test-unit-local \
  --suites=tests/unit/redmic/modules/model/testModelImpl \
  --browser=chrome \
  --headless \
  --coverage=false
```

* Tests funcionales de módulos, en navegador Google Chrome (con interfaz):

```sh
grunt test-functional-local \
  --functionalSuites=tests/functional/modules/**/!(*Script).js \
  --browser=chrome
```

### Entorno Selenium local

Para lanzar los tests denominados como remotos, pero en un entorno local, es posible desplegar la infraestructura requerida mediante los siguientes comandos:

```sh
# Se requiere tener instalado Docker en el entorno local

# Crea red de intercomunicación entre los servicios
docker network create selenium-net

# Lanza el hub central de Selenium
docker run --rm -d \
  --name selenium-hub \
  --net selenium-net \
  -p 4444:4444 \
  selenium/hub:4.1.3

# Lanza un nodo de navegador Chrome
docker run --rm -d \
  --name selenium-chrome \
  --net selenium-net \
  --shm-size=2G \
  -e SE_EVENT_BUS_HOST=selenium-hub \
  -e SE_EVENT_BUS_PUBLISH_PORT=4442 \
  -e SE_EVENT_BUS_SUBSCRIBE_PORT=4443 \
  -e VNC_NO_PASSWORD=true \
  selenium/node-chrome:99.0

# Lanza un nodo de navegador Firefox
docker run --rm -d \
  --name selenium-firefox \
  --net selenium-net \
  --shm-size=2G \
  -e SE_EVENT_BUS_HOST=selenium-hub \
  -e SE_EVENT_BUS_PUBLISH_PORT=4442 \
  -e SE_EVENT_BUS_SUBSCRIBE_PORT=4443 \
  -e VNC_NO_PASSWORD=true \
  selenium/node-firefox:98.0
```

Si todo ha ido correctamente, el servicio *Selenium Hub* estará accesible en <http://localhost:4444> con 2 nodos añadidos, formando un *Selenium Grid* funcional.

Hay que prestar atención a los tags desplegados para cada imagen. En el ejemplo, se usan:

* `selenium/hub:4.1.3` (versión **4.1.3** de **Selenium Hub**, ver más en <https://hub.docker.com/r/selenium/hub>).
* `selenium/node-chrome:99.0` (versión **99.0** de **Google Chrome**, ver más en <https://hub.docker.com/r/selenium/node-chrome>).
* `selenium/node-firefox:98.0` (versión **98.0** de **Mozilla Firefox**, ver más en <https://hub.docker.com/r/selenium/node-firefox>).

Existen otras etiquetas más específicas (consultar en los enlaces anteriores) si se quiere fijar con más certeza las versiones usadas, al igual que imágenes para otros navegadores (disponibles en <https://hub.docker.com/u/selenium>). También hay disponibles multitud de opciones para configurar el entorno de testeo, consultar documentación en <https://github.com/SeleniumHQ/docker-selenium>.

### Ejemplos de ejecución de tests remotos en entorno local

Como ejemplo de ejecución de tests remotos (unitarios y funcionales), pero apuntando al entorno local, veamos los comandos para probar la implementación de modelos y la funcionalidad de los módulos de REDMIC. Es decir, se ejecutan las mismas pruebas que en los ejemplos locales, pero ahora se aprovecha la infraestructura desplegada en el punto anterior.

* Tests unitarios de implementación de modelos, en navegador Mozilla Firefox sin interfaz y con omisión de análisis de cobertura:

```sh
grunt test-unit-remote \
  --suites=tests/unit/redmic/modules/model/testModelImpl \
  --browser=firefox \
  --headless \
  --coverage=false
```

* Tests funcionales de módulos, en navegador Google Chrome sin interfaz:

```sh
grunt test-functional-remote \
  --functionalSuites=tests/functional/modules/**/!(*Script).js \
  --browser=chrome \
  --headless
```

### Ejemplo de ejecución de tests funcionales remotos de servicio local en entorno local

Este caso concreto de entorno de testeo es especial, ya que para que los tests puedan ejecutarse, el servicio a testear debe ser accesible por el navegador remoto, que se ha lanzado en la preparación del entorno Selenium local.

Suponiendo que el servicio a testear se encuentra en `http://localhost`, se debe adaptar la ruta al mismo en los parámetros de testeo para que sea accesible desde dentro del contenedor del navegador, ya que ese *localhost* no es el mismo en la máquina host que dentro del contenedor.

Por suerte, los contenedores funcionando sobre GNU/Linux tienen disponible una dirección IP que corresponde al host en el que se despliegan asignada a la interfaz `docker0`, por defecto `172.17.0.1`. Se puede consultar desde dentro del contenedor (en el nodo de Chrome, por ejemplo) si tiene dicha IP con los comandos:

```sh
$ docker exec -it selenium-chrome /bin/sh

> ip addr show docker0
```

Otra solución multiplataforma (a partir de Docker v20.10) a usar esa dirección IP, consiste en añadir el siguiente parámetro al lanzamiento del contenedor del navegador: `--add-host=host.docker.internal:host-gateway`. De esta manera, podríamos acceder al servicio desde dentro del contenedor haciendo referencia a `http://host.docker.internal`, pero como requiere cambios en el lanzamiento de la infraestructura previa, optamos por la primera opción.

Por ejemplo, para lanzar tests funcionales del grupo de suites `common` sobre el servicio arrancado en el host (escuchando en el puerto 80) con rol de invitado, en navegador Google Chrome (con interfaz):

```sh
grunt test-functional-remote \
  --serverUrl="http://172.17.0.1" \
  --role=guest \
  --suitesGroups="common" \
  --browser=chrome
```

También es posible lanzar estos tests bajo un usuario concreto. Por ejemplo, para lanzar tests funcionales del grupo de suites `common` sobre el servicio arrancado en el host (escuchando en el puerto 80) con rol de administrador, usando el usuario `test@redmic.es` con password `changeMe`, en navegador Mozilla Firefox (con interfaz):

```sh
grunt test-functional-remote \
  --serverUrl="http://172.17.0.1" \
  --role=administrator \
  --user="test@redmic.es" \
  --pass="changeMe" \
  --suitesGroups="common" \
  --browser=firefox
```
