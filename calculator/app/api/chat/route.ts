import { NextResponse } from "next/server";

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function normalize(text: string) {
  return text.toLowerCase();
}

function generateReply(message: string) {
  const msg = normalize(message);


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

   if (
    msg.includes("le moleste") ||
    msg.includes("celoso") ||
    msg.includes("vestido") ||
    msg.includes("ropa") ||
    msg.includes("no quiere que") ||
    msg.includes("me prohíbe") ||
    msg.includes("controla")
  ) {
    return pick([
      "Lo que describes puede ser una forma de control o manipulación emocional. En una relación sana, nadie debería decidir lo que puedes usar o cómo vestirte.",
      
      "Es importante que sepas que sentirte limitada en tu forma de vestir por tu pareja puede ser una señal de una dinámica poco saludable o controladora.",
      
      "Ninguna pareja debería hacerte sentir culpable por tu forma de vestir. Eso puede ser un comportamiento de control emocional, y no es algo que debas normalizar.",
      
      "Que a tu pareja le moleste tu forma de vestir no debería convertirse en una regla sobre lo que puedes o no puedes hacer. Tus decisiones personales deben ser respetadas.",
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