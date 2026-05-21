# Calculator
Idea: app de socorro

Que sea secreta: una calculadora que en realidad manda las coordenadas actuales a una red de contactos (1) y un mensaje informando que se está en una situación de peligro.

## Por considerar:
1. Tiene que ser accesible.
2. Tiene que ser usable.
3. Cualquiera ha de ser capaz de usarlo (que la alfabetización digial no sea un problema).

## Qué nos diferencia:
¿Qué tiene esto de diferente a nada más llamar al 911?
Al ser la interfaz una calculadora, es bastante natural y muy intuitivo.

Ya hay 1 en CR, pero aún así nosotros estamos atacando una vulnerabilidad que es la falta de discreción de la app Emergencias 911 CR.

Trabaja offline.


## Ideas de diseño de UI:
1. Que sea dark-themed para que así emita menos luz y sea más sutil.


## Funcionalidad:
1. Toco 2 botones
2. Se llaman las autoridades, la red de contactos
3. Off-line
4. (Posible): chatbot especializado sobre cómo salir de la situación con IA para respuestas rápidas (2)
5. Se envía el porcentaje de batería para saber si el teléfono del usuario ya no está disponible y su ubicación al momento de agotarse la batería.

## Detalles de implementación:
1. Rate limiter

## Pantallas:
1. Pantalla principal: calculadora
2. Pantalla de configuraciones: configurar la red de contactos, mi perfil
3. Pantalla de chats

(1) La red de contactos es: autoridades oficiales, 911, contactos cercanos del usuario
(2) El modelo de IA contará con información verificada profesionalmente y será sensible al tono de la conversación para identificar el nivel de riesgo de la situación del usuario.


*

