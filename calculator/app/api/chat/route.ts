import { NextResponse } from "next/server";

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function normalize(text: string) {
  return text.toLowerCase();
}

function generateReply(message: string) {
  const msg = normalize(message);

  // 🚨 EMERGENCIA DIRECTA
  if (
    msg.includes("me están atacando") ||
    msg.includes("me quieren hacer daño") ||
    msg.includes("emergencia") ||
    msg.includes("ayuda") && msg.includes("ahora")
  ) {
    return pick([
      "Entiendo que estás en una situación de emergencia. Si puedes, llama al número local de emergencias inmediatamente.",
      "Tu seguridad es lo más importante. Intenta ponerte en un lugar seguro y contacta ayuda ahora mismo.",
      "Si estás en peligro inmediato, busca un lugar seguro y llama a emergencias.",
    ]);
  }

  // 🚨 ABUSO / VIOLENCIA
  if (
    msg.includes("me golpean") ||
    msg.includes("me maltratan") ||
    msg.includes("abuso") ||
    msg.includes("violencia")
  ) {
    return pick([
      "Esto que describes es serio. Estamos transfiriendote con un profesional",
    ]);
  }


  if (
    msg.includes("me controla") ||
    msg.includes("no me deja salir") ||
    msg.includes("celoso") ||
    msg.includes("me revisa el celular")
  ) {
    return pick([
      "Eso puede ser una señal de control o abuso. Es importante que hables con alguien de confianza.",
      "Nadie debería controlar tu libertad o privacidad. ¿Hay alguien seguro con quien puedas hablar?",
      "Lo que describes no es saludable. Considera buscar apoyo externo.",
    ]);
  }


  if (
    msg.includes("tengo miedo") ||
    msg.includes("no me siento seguro") ||
    msg.includes("me persiguen")
  ) {
    return pick([
      "Siento que estés pasando por eso. ¿Estás en un lugar seguro ahora mismo?",
      "Si estás en peligro, intenta moverte a un lugar con otras personas.",
      "Tu seguridad es lo más importante ahora.",
    ]);
  }

  if (
    msg.includes("qué hago") ||
    msg.includes("ayuda") ||
    msg.includes("consejo")
  ) {
    return pick([
      "Lo primero es asegurar tu seguridad física. ¿Estás en un lugar seguro?",
      "Podría ayudarte mejor si me cuentas si estás en peligro inmediato.",
      "Si hay riesgo, intenta contactar a alguien cercano o servicios de emergencia.",
    ]);
  }

  if (msg.includes("hola") || msg.includes("hey")) {
    return "Hola. Estoy aquí para ayudarte si estás en una situación difícil o de riesgo.";
  }

  return pick([
    "Gracias por contarme esto. ¿Te encuentras en una situación segura ahora?",
    "Entiendo. Si esto representa un riesgo, intenta buscar apoyo de alguien cercano.",
    "Estoy aquí para ayudarte. ¿Quieres contarme un poco más?",
  ]);
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const reply = generateReply(message);

    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({
      reply: "Ocurrió un error procesando tu mensaje.",
    });
  }
}