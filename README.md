# Sobre este proyecto
Este proyecto es un visor de archivos en línea con la posibilidad de subir ficheros nuevos y descargarlos en local. Además tendra función multi-usuario y la funcionalidad de compartir archivos entre usuarios.

Esta desarollado usando una API programada en PHP y llamadas a la misma a través de JS. Puede que en un futuro migre el proyecto a NodeJS.

# Versiones

## 0.2.0
**Cambios mayores:**
- Se puede navegar por el sistema de archivos

## 0.3.0
**Cambios mayores:**
- El mayor cambio es que ahora se pueden renombrar los archivos

**Camios menores:**
- Ahora hay un mayor manejo de errores en todas las funciones

## 0.4.0
**Cambios Mayores**
- Ahora hay carpeta de papelera de reciclaje
- Se pueden borrar archivos o directorios completos
- Se pueden borrar definitivamente en la palera

**Cambios Menores**
- Los archivos ocultos ni se muestran ni causan conflicto

## 0.5.0
**Cambios Mayores**
- Ya se pueden ver las imagenes subidas
- Esta preparado para verlo en todos los dispositivos
- Se ha añadido la opcion de crear carpetas nuevas.

**Cambios Menores**
- Ahora cada que se completa la subida de un archivo se recargan para que sea funcional (Antes se quedaba inutil porque no se le asignaban los listener)
- Mejora en la legilibilidad del código
- Todo esta bien documentado y comentado
- *Bug arreglado* Se generaba un error por intentar añadir un listener a un elemento que no existe.

*Pendientes*
Hay que añadir un boton de vaciar papelera de reciclaje y ademas la opcion de restaurar los ficheros a su localizacion original

*Notas:*
Queda crear carpetas, restaurar archivos a su ruta original, si no existe mover a al /
Es necesesario crear un archivo oculto en recycle_bin que contenga información sobre los archivos que haya, o en su defecto una base de datos.

## 0.5.1

### TODO
- [ ] Reproducir videos
- [ ] Mostrar documentos

**Bug resueltos**
- [Grave] Bug que impedía que se mostraran el display
- [Leve] Bug al intentar obtener la altura y ancho de archivos que no son imagenes
- [Leve] Mejorado el tamaño del display para moviles