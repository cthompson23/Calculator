# 🧮 Calculator

## 🚨 Idea
**Calculator** es una calculadora aparentemente normal que oculta un sistema de emergencia discreto y avanzado.

La app tiene dos modos de activación:
- 🔢 Código secreto (ej. `911`)
- ⌨️ **Hold prolongado de la barra espaciadora (Space Hold)**

Ambos activan un protocolo de emergencia silencioso.

---

## ⚠️ Modo de emergencia (Space Hold System)

Si el usuario mantiene presionada la barra espaciadora durante unos segundos:

La aplicación activa un sistema automático de seguridad que recopila y envía:

### 📡 Información enviada
- Nombre del usuario
- Ubicación en tiempo real
- Nivel de batería del dispositivo
- Estado de conectividad (online / offline)
- Estado del sistema (timestamp del evento)
- 📹 Grabación de video en tiempo real (si está disponible)
- (Opcional) audio ambiental

### 🚨 Activación progresiva
- 0–3s: indicador visual de progreso
- 3s+: activación automática del modo emergencia
- Se envía información a red de contactos

---

## 🎯 Problema
En situaciones de riesgo:
- No es posible abrir apps específicas
- No se puede marcar números de emergencia
- El atacante puede estar observando el dispositivo
- La víctima necesita una acción **discreta y natural**

---

## 💡 Solución
Una calculadora que oculta un sistema de emergencia basado en:
- Interacciones normales del teclado
- Activación por presión prolongada
- Envío automático de datos críticos

Esto permite pedir ayuda sin levantar sospechas.

---

## ⚙️ Cómo funciona

### 1. Código secreto
- El usuario escribe `911`
- Se activa el modo emergencia inmediato

### 2. Space Hold (modo silencioso)
- Mantener presionada la barra espaciadora
- Se activa un temporizador de seguridad
- Al cumplirse el umbral:
  - Se inicia grabación de video
  - Se envía ubicación
  - Se notifica a contactos de emergencia
  - Se envía estado del dispositivo

---

## 🌐 Red de emergencia
Incluye:
- Contactos personales del usuario
- Servicios de emergencia (ej. 911)
- (Futuro) sistemas institucionales de respuesta rápida

---

## 🔥 Diferenciación
A diferencia de otras soluciones:
- No requiere abrir una app de emergencia
- Funciona desde una interfaz cotidiana (calculadora)
- Permite activación **sin interacción explícita visible**
- Incluye captura de evidencia (video + estado del dispositivo)

---

## 📱 Pantallas
1. **Calculadora principal**
   - Interfaz normal
   - Input secreto (`911`)

2. **Modo emergencia activo**
   - Estado de envío de datos
   - Indicador de grabación

3. **Configuración**
   - Red de contactos
   - Permisos (cámara, ubicación, batería)

---

## ⚙️ Funcionalidades clave
- Activación por código (`911`)
- Activación por **hold spacebar**
- Envío de:
  - ubicación en tiempo real
  - batería
  - estado de conexión
  - identidad del usuario
- Grabación de video automática
- Funcionamiento offline con envío diferido
- Rate limiting y protección contra activaciones falsas

---

## 🧱 Consideraciones técnicas
- Permisos de cámara y geolocalización
- Streaming o buffer de video seguro
- Encriptación de datos enviados
- Fallback offline (cola de eventos)
- Prevención de activaciones accidentales
- Optimización de batería en segundo plano

---

## 📊 Impacto esperado
- Reducción del tiempo de reacción en emergencias críticas
- Mayor probabilidad de obtener evidencia (video)
- Alternativa discreta a botones SOS tradicionales
- Mejora en seguridad personal en entornos de riesgo

---

## 💰 Modelo de sostenibilidad (ideas)
- Contratos con gobiernos (seguridad pública)
- Integraciones con ONGs de protección
- Licencias institucionales
- Infraestructura de alertas y video en tiempo real

---

## 🏁 Estrategia de producto
### Competencia
- Botones SOS nativos en teléfonos
- Apps de seguridad personal

### Nuestra ventaja
- Activación invisible (calculadora)
- Doble trigger (código + hold)
- Captura de evidencia (video + datos del dispositivo)
- Diseñado para situaciones donde el usuario NO puede hablar ni interactuar libremente

---

## 🧪 MVP / Demo
- Calculadora funcional
- Código `911` activa alerta
- Hold spacebar activa modo emergencia
- Simulación de envío de:
  - ubicación
  - batería
  - estado online/offline
- Mock de grabación de video

---

## ⚠️ Nota importante
Este sistema requiere diseño responsable en:
- privacidad de video y datos personales
- consentimiento explícito del usuario
- prevención de abuso del sistema
- falsos positivos en activación por teclado
