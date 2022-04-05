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

sudo \
  OAUTH_URL=https://redmic.grafcan.es/api/oauth \
  OAUTH_CLIENT_SECRET=secretKey \
  API_URL=https://redmic.grafcan.es/api \
  PRODUCTION=0 \
  npm start -- --port=80
```

Si todo ha ido correctamente, el servicio *REDMIC web* estará accesible en <http://localhost>.

Es posible personalizar los puntos de conexión hacia la parte servidora y otros ajustes, según se necesite.

Para facilitar las tareas repetitivas, se han creado una serie de tareas ejecutables mediante **Grunt**. Más información en <https://gitlab.com/redmic-project/client/web/-/wikis/grunt>.

## Compilación

Para optimizar la ejecución es necesario realizar un proceso de "compilación" de la aplicación.

Más información en <https://gitlab.com/redmic-project/client/web/-/wikis/dojo-compile>.

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
  selenium/node-chrome:99.0

# Lanza un nodo de navegador Firefox
docker run --rm -d \
  --name selenium-firefox \
  --net selenium-net \
  --shm-size=2G \
  -e SE_EVENT_BUS_HOST=selenium-hub \
  -e SE_EVENT_BUS_PUBLISH_PORT=4442 \
  -e SE_EVENT_BUS_SUBSCRIBE_PORT=4443 \
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
