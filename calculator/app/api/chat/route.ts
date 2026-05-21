import { NextResponse } from "next/server";

function randomItem(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateReply(message: string) {
  const msg = message.toLowerCase();

  // Emergencia
  if (
    msg.includes("ayuda") ||
    msg.includes("socorro") ||
    msg.includes("emergencia")
  ) {
    return randomItem([
      "Estoy notificando a tus contactos de emergencia.",
      "Tu alerta fue enviada correctamente.",
      "Se detectó una posible emergencia.",
    ]);
  }

  // Peligro
  if (
    msg.includes("peligro") ||
    msg.includes("arma") ||
    msg.includes("asalto") ||
    msg.includes("robo")
  ) {
    return randomItem([
      "Zona marcada como potencialmente peligrosa.",
      "Gracias por reportar esta situación.",
      "El incidente fue registrado.",
    ]);
  }

  // Ubicación
  if (
    msg.includes("ubicacion") ||
    msg.includes("ubicación") ||
    msg.includes("gps")
  ) {
    return randomItem([
      "Compartiendo ubicación en tiempo real.",
      "Tu ubicación fue actualizada.",
      "Ubicación enviada a tus contactos.",
    ]);
  }

  // Saludos
  if (
    msg.includes("hola") ||
    msg.includes("buenas") ||
    msg.includes("hey")
  ) {
    return randomItem([
      "Hola ¿Cómo puedo ayudarte?",
      "¡Hola! Estoy aquí para ayudarte.",
      "Hola, ¿qué sucede?",
    ]);
  }

  // Despedidas
  if (
    msg.includes("gracias") ||
    msg.includes("bye") ||
    msg.includes("adios")
  ) {
    return randomItem([
      "Estoy para ayudarte.",
      "Cuídate mucho.",
      "Gracias por usar SafeZone.",
    ]);
  }

  // Preguntas
  if (msg.includes("?")) {
    return randomItem([
      "Estoy analizando tu consulta.",
      "Procesando información...",
      "Intentaré ayudarte con eso.",
    ]);
  }

  // Fallback inteligente
  return randomItem([
    "Mensaje recibido correctamente.",
    "Entendido.",
    "Procesando información.",
    "Tu reporte fue guardado.",
    "Gracias por la información.",
  ]);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message;

    const reply = generateReply(message);

    return NextResponse.json({
      reply,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      reply: "Ocurrió un error.",
    });
  }
}