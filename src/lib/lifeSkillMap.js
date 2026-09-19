// Mapa de dominio por habilidad — Áreas de la vida diaria.
// Extiende el sistema de src/lib/skillMap.js (matemáticas) con áreas prácticas:
// dinero (RD$), tiempo, medidas, lectura comprensiva y ciencias básicas.
// Reutiliza el MISMO motor (recordAttempt, skillStatus, accuracy, localStorage):
// las habilidades de estas áreas conviven en el mismo mapa por estudiante,
// con ids prefijados por área (dinero_*, tiempo_*, ...).

import { MATH_SKILLS, loadSkillMap, recordAttempt, skillStatus, accuracy } from './skillMap';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickOne = (arr) => arr[rand(0, arr.length - 1)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Opciones de texto: la correcta + distractores dados (toma hasta 3, mezcla).
function choice(correct, wrongs) {
  const options = shuffle([correct, ...shuffle(wrongs).slice(0, 3)]);
  return { options, answer: correct };
}

// Opciones de dinero en RD$: la correcta + 3 cantidades cercanas.
function moneyMcq(correct, spread = 25) {
  const fmt = (n) => `RD$${n}`;
  const options = new Set([correct]);
  let guard = 0;
  while (options.size < 4 && guard < 60) {
    const delta = rand(1, spread) * (Math.random() < 0.5 ? -1 : 1);
    const cand = correct + delta;
    if (cand > 0 && cand !== correct) options.add(cand);
    guard++;
  }
  return { options: shuffle([...options].map(fmt)), answer: fmt(correct) };
}

// ============================== DINERO (RD$) ==============================
const MONEDAS = [1, 5, 10, 25];
const BILLETES = [50, 100, 200, 500, 1000, 2000];
const COMPRAS = [
  { item: 'un jugo de chinola', precio: 35 },
  { item: 'una empanada', precio: 25 },
  { item: 'un chin chin', precio: 15 },
  { item: 'una fundita de chicharrones', precio: 50 },
  { item: 'un lápiz', precio: 20 },
  { item: 'un cuaderno', precio: 85 },
  { item: 'un helado de fundita', precio: 10 },
  { item: 'un batido de lechosa', precio: 60 },
  { item: 'una yaniqueque', precio: 30 },
  { item: 'un limber', precio: 15 },
];

const DINERO_SKILLS = [
  {
    id: 'dinero_reconocer',
    name: 'Conozco las monedas y los billetes',
    emoji: '🪙',
    prereq: [],
    gen: () => {
      if (Math.random() < 0.5) {
        const a = pickOne(MONEDAS);
        let b = pickOne(MONEDAS);
        if (b === a) b = MONEDAS[(MONEDAS.indexOf(a) + 1) % MONEDAS.length];
        const total = a + b;
        return {
          q: `Juntas una moneda de RD$${a} y una moneda de RD$${b}. ¿Cuánto dinero tienes?`,
          ...moneyMcq(total, 15),
          explanation: `RD$${a} + RD$${b} = RD$${total}. Suma el valor de las dos monedas.`,
        };
      }
      const grupo = shuffle(BILLETES).slice(0, 4); // 4 billetes distintos
      const mayor = Math.max(...grupo);
      return {
        q: `¿Cuál de estos billetes vale MÁS?`,
        ...choice(`RD$${mayor}`, grupo.filter((x) => x !== mayor).map((x) => `RD$${x}`)),
        explanation: `El billete de RD$${mayor} es el de más valor: entre más grande el número, más vale.`,
      };
    },
  },
  {
    id: 'dinero_sumar',
    name: 'Sumar dinero al comprar',
    emoji: '🛒',
    prereq: ['dinero_reconocer'],
    gen: () => {
      const c1 = pickOne(COMPRAS);
      let c2 = pickOne(COMPRAS);
      if (c2.item === c1.item) c2 = COMPRAS[(COMPRAS.indexOf(c1) + 3) % COMPRAS.length];
      const total = c1.precio + c2.precio;
      return {
        q: `En el colmado compras ${c1.item} de RD$${c1.precio} y ${c2.item} de RD$${c2.precio}. ¿Cuánto pagas en total?`,
        ...moneyMcq(total, 20),
        explanation: `RD$${c1.precio} + RD$${c2.precio} = RD$${total}. Junta las dos cantidades sumando.`,
      };
    },
  },
  {
    id: 'dinero_cambio',
    name: 'Calcular el cambio (la devuelta)',
    emoji: '💵',
    prereq: ['dinero_sumar'],
    gen: () => {
      const pago = pickOne([100, 200, 500]);
      const costo = pago === 100 ? rand(20, 90) : pago === 200 ? pickOne([95, 115, 125, 150, 175]) : pickOne([225, 250, 275, 350, 425]);
      const cambio = pago - costo;
      return {
        q: `Compras algo de RD$${costo} y pagas con un billete de RD$${pago}. ¿Cuánto te tienen que devolver?`,
        ...moneyMcq(cambio, 30),
        explanation: `RD$${pago} - RD$${costo} = RD$${cambio}. La devuelta es lo que falta para llegar a RD$${pago}.`,
      };
    },
  },
  {
    id: 'dinero_comparar',
    name: 'Comparar precios',
    emoji: '⚖️',
    prereq: ['dinero_sumar'],
    gen: () => {
      const { item } = pickOne(COMPRAS);
      const p1 = rand(4, 30) * 5;
      let p2 = rand(4, 30) * 5;
      while (p2 === p1) p2 = rand(4, 30) * 5;
      const barato = Math.min(p1, p2);
      return {
        q: `En un colmado ${item} cuesta RD$${p1} y en otro cuesta RD$${p2}. Si quieres gastar menos, ¿cuál precio escoges?`,
        ...choice(`RD$${barato}`, [`RD$${Math.max(p1, p2)}`, `RD$${barato + 5}`, `RD$${barato + 10}`]),
        explanation: `RD$${barato} es el precio más bajo. Comparar precios te ayuda a cuidar tu dinero.`,
      };
    },
  },
  {
    id: 'dinero_presupuesto',
    name: 'Presupuesto: ¿me alcanza?',
    emoji: '🐷',
    prereq: ['dinero_cambio', 'dinero_comparar'],
    gen: () => {
      const tienes = pickOne([200, 300, 500]);
      const a = Math.round((tienes * 0.4) / 5) * 5;
      const sobran = Math.random() < 0.5;
      const b = sobran
        ? Math.round(((tienes - a) * 0.6) / 5) * 5 // sí alcanza
        : Math.round(((tienes - a) * 1.1 + 25) / 5) * 5; // no alcanza
      const total = a + b;
      const si = total <= tienes;
      return {
        q: `Tienes RD$${tienes}. Quieres comprar algo de RD$${a} y otra cosa de RD$${b}. ¿Te alcanza el dinero?`,
        ...choice(
          si ? `Sí, y me sobran RD$${tienes - total}` : `No, me faltan RD$${total - tienes}`,
          si ? [`No, me faltan RD$${tienes - a}`, 'Sí, y no me sobra nada', `No, me faltan RD$${b}`]
             : ['Sí, y me sobra dinero', 'Sí, justo justo', `No, me faltan RD$${a}`]
        ),
        explanation: `RD$${a} + RD$${b} = RD$${total}. ${si ? `Como RD$${total} es menos que RD$${tienes}, sí te alcanza y te sobran RD$${tienes - total}.` : `Como RD$${total} es más que RD$${tienes}, no te alcanza: te faltan RD$${total - tienes}.`}`,
      };
    },
  },
];

// ============================== EL TIEMPO ==============================
const HORAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const TIEMPO_SKILLS = [
  {
    id: 'tiempo_en_punto',
    name: 'Leer la hora en punto',
    emoji: '🕐',
    prereq: [],
    gen: () => {
      const h = pickOne(HORAS);
      const otras = shuffle(HORAS.filter((x) => x !== h)).slice(0, 3);
      return {
        q: `El reloj tiene la aguja corta en el ${h} y la aguja larga en el 12. ¿Qué hora es?`,
        ...choice(`Las ${h} en punto (${h}:00)`, otras.map((x) => `Las ${x} en punto (${x}:00)`)),
        explanation: `Cuando la aguja larga está en el 12, es la hora en punto: la aguja corta dice qué hora es.`,
      };
    },
  },
  {
    id: 'tiempo_media_cuartos',
    name: 'Y media, y cuarto y menos cuarto',
    emoji: '🕝',
    prereq: ['tiempo_en_punto'],
    gen: () => {
      const h = pickOne([2, 3, 4, 5, 6, 7, 8, 9]);
      const tipo = pickOne(['media', 'cuarto', 'menos']);
      if (tipo === 'media') {
        return {
          q: `La aguja corta pasó el ${h} y la larga está en el 6. ¿Qué hora es?`,
          ...choice(`Las ${h} y media (${h}:30)`, [`Las ${h} en punto (${h}:00)`, `Las ${h} y cuarto (${h}:15)`, `Las ${h + 1} en punto (${h + 1}:00)`]),
          explanation: `Cuando la aguja larga está en el 6 ya pasó media hora: son las ${h} y media.`,
        };
      }
      if (tipo === 'cuarto') {
        return {
          q: `La aguja larga está en el 3 y la corta pasó el ${h}. ¿Qué hora es?`,
          ...choice(`Las ${h} y cuarto (${h}:15)`, [`Las ${h} y media (${h}:30)`, `Las ${h} en punto (${h}:00)`, `Cuarto para las ${h + 1}`]),
          explanation: `La aguja larga en el 3 son 15 minutos, o sea un cuarto: las ${h} y cuarto.`,
        };
      }
      return {
        q: `Falta un cuarto de hora para las ${h + 1}. ¿Qué hora es?`,
        ...choice(`Las ${h} y 45 (${h}:45)`, [`Las ${h + 1} y cuarto`, `Las ${h} y cuarto (${h}:15)`, `Las ${h + 1} en punto`]),
        explanation: `Un cuarto antes de las ${h + 1} son las ${h} y 45, porque 60 - 15 = 45 minutos.`,
      };
    },
  },
  {
    id: 'tiempo_falta_paso',
    name: '¿Cuánto falta? ¿Cuánto pasó?',
    emoji: '⏳',
    prereq: ['tiempo_media_cuartos'],
    gen: () => {
      if (Math.random() < 0.5) {
        const inicio = pickOne([7, 8, 9, 10, 2, 3, 4]);
        const minutos = pickOne([15, 30, 45]);
        return {
          q: `Son las ${inicio}:00 y la clase empieza a las ${inicio}:${minutos}. ¿Cuántos minutos faltan?`,
          ...choice(`${minutos} minutos`, [`${60 - minutos} minutos`, '60 minutos', '5 minutos']),
          explanation: `De las ${inicio}:00 a las ${inicio}:${minutos} pasan ${minutos} minutos.`,
        };
      }
      const h = pickOne([7, 8, 9, 2, 3, 4]);
      const pasaron = pickOne([30, 60]);
      return {
        q: `Empezaste a jugar a las ${h}:00 y terminaste a las ${pasaron === 60 ? h + 1 : h}:${pasaron === 60 ? '00' : '30'}. ¿Cuánto tiempo jugaste?`,
        ...choice(pasaron === 60 ? '1 hora' : 'Media hora (30 minutos)', [pasaron === 60 ? 'Media hora (30 minutos)' : '1 hora', '15 minutos', '2 horas']),
        explanation: pasaron === 60 ? `De las ${h}:00 a las ${h + 1}:00 pasa 1 hora completa.` : `De las ${h}:00 a las ${h}:30 pasan 30 minutos, o sea media hora.`,
      };
    },
  },
  {
    id: 'tiempo_dias_meses',
    name: 'Días de la semana y meses',
    emoji: '📅',
    prereq: ['tiempo_en_punto'],
    gen: () => {
      const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      if (Math.random() < 0.5) {
        const i = rand(0, 6);
        const siguiente = dias[(i + 1) % 7];
        const otros = shuffle(dias.filter((d) => d !== siguiente && d !== dias[i])).slice(0, 3);
        return {
          q: `Si hoy es ${dias[i]}, ¿qué día es mañana?`,
          ...choice(siguiente, otros),
          explanation: `Después del ${dias[i]} viene el ${siguiente}. Los días van: ${dias.join(', ')}.`,
        };
      }
      const j = rand(0, 11);
      const mesSig = meses[(j + 1) % 12];
      const otrosM = shuffle(meses.filter((m) => m !== mesSig && m !== meses[j])).slice(0, 3);
      return {
        q: `¿Qué mes viene después de ${meses[j]}?`,
        ...choice(mesSig, otrosM),
        explanation: `Después de ${meses[j]} viene ${mesSig}. El año tiene 12 meses.`,
      };
    },
  },
];

// ============================== MEDIDAS DE LA VIDA DIARIA ==============================
const MEDIDAS_SKILLS = [
  {
    id: 'medidas_unidades',
    name: 'Litros, metros y kilos: ¿qué mide qué?',
    emoji: '📏',
    prereq: [],
    gen: () => pickOne([
      {
        q: 'Para cocinar moro, ¿con qué medimos el agua que echamos a la olla?',
        ...choice('Litros', ['Metros', 'Kilos', 'Horas']),
        explanation: 'Los líquidos como el agua, el jugo o la leche se miden en litros.',
      },
      {
        q: '¿Con qué medimos qué tan lejos queda la escuela de tu casa?',
        ...choice('Metros o kilómetros', ['Litros', 'Kilos', 'Pesos']),
        explanation: 'Las distancias se miden en metros si son cortas y en kilómetros si son largas.',
      },
      {
        q: 'En el colmado pides habichuelas por peso. ¿Con qué las miden?',
        ...choice('Libras o kilos', ['Litros', 'Metros', 'Cuartos de hora']),
        explanation: 'Las cosas que pesan (arroz, habichuelas, pollo) se miden en libras o kilos.',
      },
      {
        q: '¿Con qué medimos la estatura, o sea qué tan alta es una persona?',
        ...choice('Metros y centímetros', ['Litros', 'Kilos', 'Minutos']),
        explanation: 'La estatura se mide en metros y centímetros: por ejemplo, 1 metro y 30 centímetros.',
      },
      {
        q: 'Compras una botella grande de agua para la casa. ¿Cómo sabes cuánta agua trae?',
        ...choice('Mirando cuántos litros tiene', ['Pesándola en metros', 'Midiéndola con un reloj', 'Contando los kilos']),
        explanation: 'El agua se mide en litros: una botella grande suele tener 5 litros, por ejemplo.',
      },
    ]),
  },
  {
    id: 'medidas_comparar',
    name: 'Comparar cantidades y mitades',
    emoji: '⚖️',
    prereq: ['medidas_unidades'],
    gen: () => pickOne([
      {
        q: '¿Qué es más largo: 1 metro o 50 centímetros?',
        ...choice('1 metro', ['50 centímetros', 'Son iguales', 'Ninguno de los dos']),
        explanation: '1 metro son 100 centímetros, así que 1 metro es el doble de 50 centímetros.',
      },
      {
        q: 'Una botella tiene 1 litro de jugo y otra tiene medio litro. ¿Cuál tiene más jugo?',
        ...choice('La de 1 litro', ['La de medio litro', 'Las dos tienen igual', 'No se puede saber']),
        explanation: 'Medio litro es la mitad de un litro, así que la botella de 1 litro tiene más.',
      },
      {
        q: '¿Qué pesa más: 1 kilo de arroz o 2 kilos de habichuelas?',
        ...choice('Los 2 kilos de habichuelas', ['El kilo de arroz', 'Pesan igual', 'El arroz siempre pesa más']),
        explanation: '2 kilos es más que 1 kilo, sin importar qué cosa sea.',
      },
      {
        q: 'Si partes 1 metro de cinta por la mitad, ¿cuánto mide cada pedazo?',
        ...choice('50 centímetros', ['1 metro', '10 centímetros', '25 metros']),
        explanation: 'La mitad de 100 centímetros (1 metro) son 50 centímetros.',
      },
      {
        q: 'Mamá compró 2 litros de leche y tu tía compró 1 litro. ¿Quién compró más?',
        ...choice('Mamá, porque 2 litros es más que 1 litro', ['Tu tía', 'Las dos compraron igual', 'Tu tía, porque 1 es más que 2']),
        explanation: '2 litros es el doble de 1 litro, así que mamá compró más leche.',
      },
    ]),
  },
  {
    id: 'medidas_problemas',
    name: 'Problemas de medidas de verdad',
    emoji: '🍚',
    prereq: ['medidas_comparar'],
    gen: () => {
      const problemas = [
        () => {
          const total = pickOne([2, 3, 4]);
          const echado = rand(1, total - 1);
          const falta = total - echado;
          return {
            q: `La receta del moro lleva ${total} litros de agua y ya echaste ${echado}. ¿Cuántos litros faltan?`,
            ...choice(`${falta} ${falta === 1 ? 'litro' : 'litros'}`, [`${total} litros`, `${echado + 1} litros`, `${total + echado} litros`]),
            explanation: `${total} - ${echado} = ${falta}. Resta lo que ya echaste al total de la receta.`,
          };
        },
        () => {
          const ida = pickOne([100, 200, 300]);
          return {
            q: `De tu casa al colmado hay ${ida} metros. Si vas y vuelves caminando, ¿cuántos metros caminas en total?`,
            ...choice(`${ida * 2} metros`, [`${ida} metros`, `${ida + 2} metros`, `${ida / 2} metros`]),
            explanation: `Ir y volver es ${ida} + ${ida} = ${ida * 2} metros.`,
          };
        },
        () => {
          const sacos = pickOne([3, 4, 5]);
          const kilos = pickOne([2, 5]);
          return {
            q: `Tu abuelo cosechó ${sacos} sacos de plátanos y cada saco pesa ${kilos} kilos. ¿Cuántos kilos cosechó en total?`,
            ...choice(`${sacos * kilos} kilos`, [`${sacos + kilos} kilos`, `${kilos} kilos`, `${sacos * kilos + kilos} kilos`]),
            explanation: `${sacos} × ${kilos} = ${sacos * kilos}. Multiplica los sacos por los kilos de cada uno.`,
          };
        },
        () => {
          const litros = pickOne([3, 5]);
          const vasos = litros * 2;
          return {
            q: `Con 1 litro de jugo salen 2 vasos. ¿Cuántos vasos salen con ${litros} litros?`,
            ...choice(`${vasos} vasos`, [`${litros} vasos`, `${litros + 2} vasos`, '1 vaso']),
            explanation: `${litros} × 2 = ${vasos}. Cada litro da 2 vasos.`,
          };
        },
      ];
      return pickOne(problemas)();
    },
  },
];

// ============================== LECTURA COMPRENSIVA ==============================
// Banco curado: textos cortos de temas dominicanos, con 3 preguntas cada uno:
// literal (lo dice el texto), inferencia (hay que deducirlo), idea (idea principal).
export const LECTURA_TEXTOS = [
  {
    titulo: 'El conuco de mi abuelo',
    texto: 'Mi abuelo tiene un conuco en las lomas de San José. Cada sábado madruga para sembrar plátanos, yuca y maíz. Yo lo ayudo a regar las matas con un cubo que llenamos en el río. Cuando crece la cosecha, mi abuela cocina un sancocho bien grande y comemos toda la familia junta.',
    preguntas: [
      { tipo: 'literal', q: '¿Qué siembra el abuelo en el conuco?', ...choice('Plátanos, yuca y maíz', ['Arroz y habichuelas', 'Flores y mangos', 'Caña de azúcar']), explanation: 'El texto dice que siembra plátanos, yuca y maíz.' },
      { tipo: 'inferencia', q: '¿Por qué crees que el abuelo madruga los sábados?', ...choice('Porque quiere aprovechar el día para trabajar el conuco', ['Porque no le gusta dormir', 'Porque va a la playa', 'Porque se pierde el camino']), explanation: 'Madrugar es levantarse muy temprano: así tiene más horas de sol para trabajar la tierra.' },
      { tipo: 'idea', q: '¿De qué trata este texto?', ...choice('De cómo el abuelo trabaja su conuco y la familia disfruta la cosecha', ['De una receta de sancocho', 'De un río de San José', 'De ir a la escuela los sábados']), explanation: 'El texto cuenta la vida del conuco del abuelo y cómo termina en comida para la familia.' },
    ],
  },
  {
    titulo: 'Un día en Boca Chica',
    texto: 'El domingo fuimos a la playa de Boca Chica. El agua estaba clarita y tranquila, como una piscina grande. Mi papá me enseñó a flotar boca arriba y mi hermano hizo un castillo de arena. Al mediodía comimos pescado frito con tostones en un kiosquito, y antes de irnos vimos el sol esconderse detrás del mar.',
    preguntas: [
      { tipo: 'literal', q: '¿Qué comieron en la playa?', ...choice('Pescado frito con tostones', ['Moro con pollo', 'Yaniqueques con huevo', 'Helados de fundita']), explanation: 'El texto dice que comieron pescado frito con tostones en un kiosquito.' },
      { tipo: 'inferencia', q: '¿Por qué el agua de Boca Chica era buena para aprender a flotar?', ...choice('Porque estaba tranquila y sin olas fuertes', ['Porque estaba muy fría', 'Porque era muy profunda', 'Porque tenía muchos peces']), explanation: 'Dice que el agua estaba tranquila, como una piscina: eso ayuda a aprender sin miedo.' },
      { tipo: 'idea', q: '¿Cuál es la idea principal?', ...choice('La familia pasó un día bonito en la playa', ['Cómo hacer castillos de arena', 'Qué se vende en los kioscos', 'Cómo nadar como los peces']), explanation: 'Todo el texto cuenta el paseo de la familia a la playa y lo bien que la pasaron.' },
    ],
  },
  {
    titulo: 'Mi primera semana de escuela',
    texto: 'Esta semana empecé en mi nueva escuela. Al principio tenía un poco de miedo porque no conocía a nadie. Pero mi maestra, doña Carmen, me recibió con una sonrisa y me sentó junto a una niña que se llama Altagracia. Ahora somos muy amigas y jugamos a las muñecas en cada recreo.',
    preguntas: [
      { tipo: 'literal', q: '¿Cómo se llama la maestra?', ...choice('Doña Carmen', ['Doña Altagracia', 'Doña María', 'Doña Juana']), explanation: 'El texto dice que la maestra se llama doña Carmen.' },
      { tipo: 'inferencia', q: '¿Cómo se siente ahora la niña del texto?', ...choice('Feliz, porque ya tiene una amiga', ['Triste, porque quiere irse', 'Enojada con la maestra', 'Con mucho miedo todavía']), explanation: 'Aunque empezó con miedo, al final cuenta que juega contenta con su nueva amiga.' },
      { tipo: 'idea', q: '¿De qué trata el texto?', ...choice('De cómo la niña pasó del miedo a hacer una amiga en su escuela nueva', ['De los juegos del recreo', 'De las maestras dominicanas', 'De cómo se llama su amiga']), explanation: 'La historia va del miedo del primer día a la alegría de tener una amiga.' },
    ],
  },
  {
    titulo: 'El colmado de don Pepe',
    texto: 'En la esquina de mi barrio está el colmado de don Pepe. Allí se vende de todo: arroz, aceite, habichuelas, jabón y hasta chicles. Don Pepe conoce a todo el mundo por su nombre y a veces fía, o sea, deja que la gente pague después. Cuando voy a comprar, siempre me regala una menta.',
    preguntas: [
      { tipo: 'literal', q: '¿Qué le regala don Pepe a la niña?', ...choice('Una menta', ['Un chicle', 'Un helado', 'Un refresco']), explanation: 'El texto dice que don Pepe siempre le regala una menta.' },
      { tipo: 'inferencia', q: '¿Qué significa que don Pepe "fía"?', ...choice('Que deja que la gente se lleve las cosas y pague después', ['Que regala todo gratis', 'Que no vende a los niños', 'Que cierra temprano']), explanation: 'El mismo texto lo explica: fiar es dejar que la gente pague después.' },
      { tipo: 'idea', q: '¿Cuál es la idea principal?', ...choice('El colmado de don Pepe es un lugar importante y querido del barrio', ['Cómo se hace el arroz', 'Los precios del aceite', 'Por qué cierran los colmados']), explanation: 'El texto describe el colmado y el cariño que don Pepe tiene a la gente del barrio.' },
    ],
  },
  {
    titulo: 'La gallina Josefina',
    texto: 'En el patio de mi casa vive Josefina, una gallina blanca que pone un huevo cada mañana. Mi mamá me manda a buscarlo apenas me levanto. El huevo está calientito cuando lo recojo. Con los huevos de Josefina, mamá me hace revoltillo con cebolla para el desayuno antes de irme a la escuela.',
    preguntas: [
      { tipo: 'literal', q: '¿De qué color es Josefina?', ...choice('Blanca', ['Negra', 'Colorada', 'Pinta']), explanation: 'El texto dice que Josefina es una gallina blanca.' },
      { tipo: 'inferencia', q: '¿Por qué el huevo está calientito?', ...choice('Porque la gallina acaba de ponerlo', ['Porque está al sol', 'Porque lo calientan en la estufa', 'Porque la niña lo aprieta']), explanation: 'Lo recoge apenas se levanta, recién puesto por la gallina: por eso está caliente.' },
      { tipo: 'idea', q: '¿De qué trata el texto?', ...choice('De una gallina del patio que da huevos para el desayuno', ['De cómo cocinar revoltillo', 'De las escuelas del campo', 'De comprar huevos en el colmado']), explanation: 'El texto cuenta la rutina con la gallina Josefina y sus huevos.' },
    ],
  },
  {
    titulo: 'El río Yaque',
    texto: 'El río Yaque del Norte es el río más largo de la República Dominicana. Nace en las montañas frías de Constanza y corre hasta el mar. Muchos campesinos usan su agua para regar el arroz y los plátanos. Cuando llueve mucho, el río crece y hay que cuidarse de las crecidas.',
    preguntas: [
      { tipo: 'literal', q: '¿Dónde nace el río Yaque del Norte?', ...choice('En las montañas de Constanza', ['En Boca Chica', 'En el mar', 'En Santo Domingo']), explanation: 'El texto dice que nace en las montañas frías de Constanza.' },
      { tipo: 'inferencia', q: '¿Por qué hay que cuidarse cuando el río crece?', ...choice('Porque el agua puede subir demasiado y causar daños', ['Porque el río se vuelve dulce', 'Porque se seca', 'Porque llegan los peces grandes']), explanation: 'Una crecida es cuando el río sube mucho por la lluvia y puede inundar.' },
      { tipo: 'idea', q: '¿Cuál es la idea principal?', ...choice('El río Yaque es un río importante que ayuda a los campesinos, pero hay que respetarlo', ['Cómo nadar en un río', 'Las montañas de Constanza', 'Cómo sembrar arroz']), explanation: 'El texto explica qué es el río, para qué sirve y el cuidado que hay que tener.' },
    ],
  },
  {
    titulo: 'El mangú de los domingos',
    texto: 'En mi casa, el desayuno del domingo es sagrado: mangú con los tres golpes. Mi mamá hierve los plátanos verdes y los maja con un poquito del agua caliente y mantequilla. Encima pone queso frito doradito, salami y huevo, con cebollita roja por arriba. Toda la familia se sienta junta a la mesa y nadie tiene prisa.',
    preguntas: [
      { tipo: 'literal', q: '¿Qué son "los tres golpes"?', ...choice('Queso frito, salami y huevo', ['Arroz, habichuelas y carne', 'Café, pan y mantequilla', 'Plátano, yuca y batata']), explanation: 'El texto los nombra: queso frito doradito, salami y huevo.' },
      { tipo: 'inferencia', q: '¿Por qué dice que el desayuno del domingo es "sagrado"?', ...choice('Porque es una tradición familiar que nunca se pierde', ['Porque se come en la iglesia', 'Porque nadie puede hablar', 'Porque solo lo hace mamá']), explanation: 'Que algo sea sagrado en una familia quiere decir que es una tradición muy importante que siempre se respeta.' },
      { tipo: 'idea', q: '¿De qué trata el texto?', ...choice('De la tradición familiar de comer mangú los domingos', ['De una receta de cocina solamente', 'De comprar plátanos verdes', 'De por qué hay que madrugar']), explanation: 'Más que la receta, el texto celebra la tradición de la familia reunida los domingos.' },
    ],
  },
  {
    titulo: 'Cuando viene la tormenta',
    texto: 'Cuando el cielo se pone gris y se escucha el trueno, mi abuela apaga el televisor y guarda agua en cubos por si se va la luz. Nos sentamos en la galería a ver caer la lluvia sobre las matas de plátano. Después de la tormenta, el aire huele a tierra mojada y a veces sale el arcoíris.',
    preguntas: [
      { tipo: 'literal', q: '¿Qué hace la abuela cuando se escucha el trueno?', ...choice('Apaga el televisor y guarda agua en cubos', ['Sale a correr al patio', 'Enciende todas las luces', 'Va al colmado']), explanation: 'El texto dice que apaga el televisor y guarda agua por si se va la luz.' },
      { tipo: 'inferencia', q: '¿Por qué guardan agua en cubos?', ...choice('Porque cuando se va la luz puede faltar el agua', ['Porque quieren bañarse afuera', 'Porque la lluvia es sucia', 'Porque las plantas tienen sed']), explanation: 'En muchas casas, cuando se va la luz la bomba de agua no funciona: por eso se guarda agua antes.' },
      { tipo: 'idea', q: '¿Cuál es la idea principal?', ...choice('Cómo la familia se prepara y disfruta cuando llueve', ['Que las tormentas son peligrosas siempre', 'Cómo se forma el arcoíris', 'Que hay que ver televisión']), explanation: 'El texto cuenta la rutina bonita de la familia cuando llega la tormenta.' },
    ],
  },
  {
    titulo: 'Mi hermanito aprende a caminar',
    texto: 'Mi hermanito Tomás tiene un año y está aprendiendo a caminar. Primero se para agarrándose de la silla, luego da dos pasitos temblorosos y cae sentado riendo. Mi mamá lo aplaude y él vuelve a intentarlo. Ayer caminó solo desde el sofá hasta mis brazos y toda la casa gritó de alegría.',
    preguntas: [
      { tipo: 'literal', q: '¿Cuántos años tiene Tomás?', ...choice('Un año', ['Dos años', 'Cinco años', 'Diez años']), explanation: 'El texto dice que Tomás tiene un año.' },
      { tipo: 'inferencia', q: '¿Por qué la mamá aplaude cuando Tomás cae?', ...choice('Para animarlo a seguir intentando', ['Porque se cayó fuerte', 'Porque no le gusta que camine', 'Para asustarlo']), explanation: 'Aplaudir es su manera de decirle que lo está haciendo bien y que no se rinda.' },
      { tipo: 'idea', q: '¿De qué trata el texto?', ...choice('De cómo Tomás aprende a caminar con el apoyo de su familia', ['De los juegos del sofá', 'De cómo cuidar sillas', 'De los gritos de la casa']), explanation: 'El texto celebra el esfuerzo del hermanito y el cariño de la familia.' },
    ],
  },
  {
    titulo: 'La guagua de las seis',
    texto: 'Para llegar a la escuela a tiempo, mi papá y yo cogemos la guagua de las seis de la mañana. El conductor, que todos llaman El Rápido, cobra el pasaje y canta merengue bajito mientras maneja. Por la ventana veo amanecer sobre los semáforos y los colmados que apenas están abriendo.',
    preguntas: [
      { tipo: 'literal', q: '¿Cómo le dicen al conductor de la guagua?', ...choice('El Rápido', ['El Merenguero', 'Don Pepe', 'El Chofer']), explanation: 'El texto dice que todos lo llaman El Rápido.' },
      { tipo: 'inferencia', q: '¿Por qué cogen la guagua tan temprano?', ...choice('Para no llegar tarde a la escuela', ['Porque les gusta el frío', 'Porque la guagua es gratis de mañana', 'Para ver los semáforos']), explanation: 'El texto empieza diciendo que es para llegar a la escuela a tiempo.' },
      { tipo: 'idea', q: '¿Cuál es la idea principal?', ...choice('El viaje diario en guagua a la escuela y lo que se ve en el camino', ['Cómo manejar una guagua', 'La historia del merengue', 'Cuándo abren los colmados']), explanation: 'El texto describe el recorrido de cada mañana y sus detalles.' },
    ],
  },
];

function lecturaGen(tipo) {
  const planas = LECTURA_TEXTOS.flatMap((t) =>
    t.preguntas.filter((p) => p.tipo === tipo).map((p) => ({ ...p, texto: t.texto, titulo: t.titulo }))
  );
  const p = pickOne(planas);
  return {
    passage: p.texto,
    passageTitle: p.titulo,
    q: p.q,
    options: shuffle([...p.options]),
    answer: p.answer,
    explanation: p.explanation,
  };
}

const LECTURA_SKILLS = [
  {
    id: 'lectura_literal',
    name: 'Entiendo lo que dice el texto',
    emoji: '📖',
    prereq: [],
    gen: () => lecturaGen('literal'),
  },
  {
    id: 'lectura_inferencia',
    name: 'Adivino lo que el texto no dice',
    emoji: '🔍',
    prereq: ['lectura_literal'],
    gen: () => lecturaGen('inferencia'),
  },
  {
    id: 'lectura_idea',
    name: 'Encuentro la idea principal',
    emoji: '💡',
    prereq: ['lectura_inferencia'],
    gen: () => lecturaGen('idea'),
  },
];

// ============================== CIENCIAS BÁSICAS ==============================
const CIENCIAS_BANCO = {
  cuerpo: [
    { q: '¿Qué órgano del cuerpo usamos para respirar?', ...choice('Los pulmones', ['El corazón', 'El estómago', 'El cerebro']), explanation: 'Los pulmones se llenan de aire cuando respiramos y nos dan el oxígeno que necesitamos.' },
    { q: '¿Qué hace el corazón todo el día sin parar?', ...choice('Empuja la sangre a todo el cuerpo', ['Digerir la comida', 'Pensar y recordar', 'Respirar por nosotros']), explanation: 'El corazón es como una bomba: empuja la sangre para que llegue a cada parte del cuerpo.' },
    { q: '¿Con qué parte del cuerpo probamos el dulce del mango?', ...choice('Con la lengua', ['Con la nariz', 'Con las manos', 'Con los oídos']), explanation: 'La lengua tiene los sabores: dulce, salado, agrio y amargo.' },
    { q: '¿Para qué sirven los huesos del cuerpo?', ...choice('Para sostenernos y proteger órganos como el cerebro', ['Para hacernos más pesados', 'Para producir comida', 'Para nada, solo estorban']), explanation: 'Los huesos son como las varillas de una casa: nos sostienen y protegen lo que hay dentro.' },
    { q: '¿Qué sentido usas cuando escuchas el canto del gallo en la mañana?', ...choice('El oído', ['La vista', 'El olfato', 'El tacto']), explanation: 'Escuchamos con los oídos: ese es el sentido del oído.' },
    { q: '¿Por qué es bueno lavarse las manos antes de comer?', ...choice('Para quitar los microbios que causan enfermedades', ['Para que no se enfríe la comida', 'Porque sí, sin razón', 'Para que las manos huelan rico']), explanation: 'En las manos hay microbios que no se ven; lavarse con jabón los quita y evita enfermedades.' },
    { q: '¿Qué parte del cuerpo nos ayuda a pensar, aprender y recordar?', ...choice('El cerebro', ['El hígado', 'Las rodillas', 'Las uñas']), explanation: 'El cerebro es el jefe del cuerpo: con él pensamos, aprendemos y soñamos.' },
    { q: '¿Cuántos sentidos tenemos y cuáles son?', ...choice('Cinco: vista, oído, olfato, gusto y tacto', ['Tres: vista, gusto y tacto', 'Siete sentidos diferentes', 'Uno solo: la vista']), explanation: 'Tenemos cinco sentidos para conocer el mundo: ver, oír, oler, probar y tocar.' },
  ],
  animales: [
    { q: '¿Cuál de estos animales pone huevos?', ...choice('La gallina', ['El perro', 'La vaca', 'El gato']), explanation: 'Las gallinas, los patos y las aves en general ponen huevos; perros, vacas y gatos tienen crías directas.' },
    { q: '¿Dónde vive el pez y cómo respira?', ...choice('En el agua, respirando por las branquias', ['En los árboles, por la nariz', 'Bajo tierra, por la boca', 'En el aire, por los pulmones']), explanation: 'Los peces viven en el agua y sacan el oxígeno del agua con sus branquias.' },
    { q: '¿Qué animal es un mamífero?', ...choice('La vaca', ['El lagarto', 'La gallina', 'El sábalo']), explanation: 'La vaca es mamífero: sus crías maman leche de su mamá, igual que los gatos, los perros y las personas.' },
    { q: '¿Qué come una vaca en el potrero?', ...choice('Hierba (es herbívora)', ['Carne de otros animales', 'Pescado frito', 'Piedras y tierra']), explanation: 'Los animales que comen plantas, como la vaca y el caballo, se llaman herbívoros.' },
    { q: '¿Para qué le sirven las alas a un pájaro?', ...choice('Para volar', ['Para nadar', 'Para escuchar mejor', 'Para cargar comida']), explanation: 'Las alas le permiten al pájaro volar por el aire.' },
    { q: '¿Cómo nacen los perritos?', ...choice('De la pancita de su mamá', ['De un huevo', 'De una semilla', 'De una mata']), explanation: 'Los perros son mamíferos: las crías crecen dentro de la mamá y nacen directamente.' },
    { q: '¿Qué animal dominicano es un reptil que vive en lagunas y se parece a un lagarto gigante?', ...choice('El cocodrilo', ['El manatí', 'La cigüa', 'El pollito']), explanation: 'En lagunas como el Lago Enriquillo vive el cocodrilo americano, un reptil grande.' },
    { q: '¿Qué hacen las abejas que nos ayuda a nosotros?', ...choice('Hacen miel y ayudan a que las plantas den frutos', ['Nos dan leche', 'Nos cuidan la casa', 'Ponen huevos de gallina']), explanation: 'Las abejas hacen miel y, al ir de flor en flor, ayudan a que las plantas den frutos.' },
  ],
  plantas: [
    { q: '¿Qué necesita una planta para crecer sana?', ...choice('Agua, luz del sol y tierra', ['Solo agua y nada más', 'Oscuridad total', 'Sal y azúcar']), explanation: 'Las plantas necesitan agua, la luz del sol y los nutrientes de la tierra.' },
    { q: '¿Por dónde toma el agua una planta?', ...choice('Por las raíces', ['Por las flores', 'Por el tallo de arriba', 'Por los frutos']), explanation: 'Las raíces están bajo la tierra y absorben el agua con sus nutrientes.' },
    { q: '¿Para qué sirven las hojas verdes de la mata de plátano?', ...choice('Para tomar la luz del sol y hacer su comida', ['Para volar', 'Para asustar a los pájaros', 'Para nada']), explanation: 'Con la luz del sol, las hojas preparan el alimento de la planta. Por eso son tan importantes.' },
    { q: '¿Qué parte de la planta se convierte en el mango que comemos?', ...choice('La flor, que después da el fruto', ['La raíz', 'El tronco', 'La sombra']), explanation: 'Las flores, cuando son polinizadas, se convierten en frutos como el mango o la guayaba.' },
    { q: '¿Qué es una semilla?', ...choice('La parte de la planta de la que puede nacer una mata nueva', ['Un bicho que come hojas', 'Una piedra del río', 'Agua guardada']), explanation: 'Dentro de cada semilla, como la de habichuela o maíz, hay una plantita esperando crecer.' },
    { q: '¿Por qué los campesinos riegan las matas cuando no llueve?', ...choice('Porque sin agua las plantas se secan y mueren', ['Porque a las plantas les gusta el ruido', 'Para que crezcan de noche', 'Porque el agua las hace dulces']), explanation: 'El agua es vida para las plantas: si no llueve, hay que regarlas para que no se sequen.' },
    { q: '¿Qué planta dominicana nos da la caña para hacer azúcar?', ...choice('La caña de azúcar', ['El plátano', 'El coco', 'La yuca']), explanation: 'De los tallos jugosos de la caña se saca el dulce con que se hace el azúcar.' },
    { q: '¿De dónde sacan las plantas el aire que usan para vivir?', ...choice('Del aire, por unos huequitos pequeños en las hojas', ['De la tierra solamente', 'Del agua de la lluvia', 'No usan aire']), explanation: 'Las hojas toman aire por unos poros pequeñitos y devuelven el oxígeno que nosotros respiramos.' },
  ],
  agua_clima: [
    { q: '¿En qué tres estados puede estar el agua?', ...choice('Líquida, sólida (hielo) y vapor', ['Solo líquida', 'Dulce y salada', 'Caliente y fría']), explanation: 'El agua puede ser líquida, hielo (sólida) o vapor cuando hierve.' },
    { q: '¿De dónde viene el agua de la lluvia?', ...choice('De las nubes, que se forman con el vapor del mar y los ríos', ['De los pozos de la tierra', 'De las plantas', 'De las tuberías']), explanation: 'El sol calienta el agua, sube como vapor, forma nubes y luego cae como lluvia: es el ciclo del agua.' },
    { q: '¿Por qué no debemos botar basura en los ríos?', ...choice('Porque ensucia el agua y mata a los peces', ['Porque el río se enoja', 'Porque la basura flota bonito', 'No pasa nada si boto basura']), explanation: 'El agua sucia daña a los animales y a las personas que la usan para beber y cocinar.' },
    { q: '¿Qué tiempo hace cuando el cielo está lleno de nubes grises y cae agua?', ...choice('Está lloviendo', ['Hace sol', 'Hay sequía', 'Está nevando']), explanation: 'Las nubes grises cargadas de agua traen la lluvia.' },
    { q: 'En la República Dominicana, ¿en qué meses hay más huracanes?', ...choice('Entre junio y noviembre', ['En diciembre y enero', 'Nunca hay huracanes', 'Todo el año igual']), explanation: 'La temporada de huracanes va de junio a noviembre; por eso hay que estar preparados.' },
    { q: '¿Qué debemos hacer en casa cuando avisan que viene una tormenta fuerte?', ...choice('Guardar agua, comida y linternas, y alejarse de las ventanas', ['Salir a jugar al patio', 'Abrir todas las ventanas', 'Ir a la playa a ver las olas']), explanation: 'Estar preparados con agua, comida y luz, y mantenerse seguros dentro de casa, es lo correcto.' },
    { q: '¿Qué es la sequía?', ...choice('Cuando pasa mucho tiempo sin llover y el agua escasea', ['Cuando llueve todos los días', 'Cuando hace mucho frío', 'Cuando el mar sube']), explanation: 'En la sequía no llueve por mucho tiempo: los ríos bajan y las plantas se secan.' },
    { q: '¿Por qué hace más fresco en Constanza que en la capital?', ...choice('Porque está en las montañas, y en las montañas el aire es más frío', ['Porque nieva todos los días', 'Porque está cerca del mar', 'Porque hay más nubes siempre']), explanation: 'Mientras más alto, más fresco: las montañas de Constanza son altas y por eso hace fresco allá.' },
  ],
};

function cienciasGen(tema) {
  const p = pickOne(CIENCIAS_BANCO[tema]);
  return { q: p.q, options: shuffle([...p.options]), answer: p.answer, explanation: p.explanation };
}

const CIENCIAS_SKILLS = [
  {
    id: 'ciencias_cuerpo',
    name: 'Mi cuerpo y cómo funciona',
    emoji: '🫀',
    prereq: [],
    gen: () => cienciasGen('cuerpo'),
  },
  {
    id: 'ciencias_animales',
    name: 'Los animales',
    emoji: '🐄',
    prereq: ['ciencias_cuerpo'],
    gen: () => cienciasGen('animales'),
  },
  {
    id: 'ciencias_plantas',
    name: 'Las plantas',
    emoji: '🌱',
    prereq: ['ciencias_animales'],
    gen: () => cienciasGen('plantas'),
  },
  {
    id: 'ciencias_agua',
    name: 'El agua y el clima',
    emoji: '🌧️',
    prereq: ['ciencias_plantas'],
    gen: () => cienciasGen('agua_clima'),
  },
];

// ============================== ÁREAS ==============================
export const LIFE_AREAS = [
  { id: 'dinero', name: 'El dinero', emoji: '💰', blurb: 'Pesos dominicanos de verdad: colmado, cambio y presupuesto.', skills: DINERO_SKILLS },
  { id: 'tiempo', name: 'El tiempo', emoji: '⏰', blurb: 'Leer el reloj y organizar el día.', skills: TIEMPO_SKILLS },
  { id: 'medidas', name: 'Las medidas', emoji: '📏', blurb: 'Litros, metros y kilos en la vida diaria.', skills: MEDIDAS_SKILLS },
  { id: 'lectura', name: 'La lectura', emoji: '📚', blurb: 'Cuentos cortos de nuestra tierra y sus preguntas.', skills: LECTURA_SKILLS },
  { id: 'ciencias', name: 'Las ciencias', emoji: '🔬', blurb: 'El cuerpo, los animales, las plantas y el clima.', skills: CIENCIAS_SKILLS },
];

// Todas las áreas del sistema (matemáticas primero, luego la vida diaria).
export const ALL_AREAS = [
  { id: 'matematicas', name: 'Las matemáticas', emoji: '🧮', blurb: 'Sumas, restas, tablas y divisiones.', skills: MATH_SKILLS },
  ...LIFE_AREAS,
];

export const getAreaBySkill = (skillId) => ALL_AREAS.find((a) => a.skills.some((s) => s.id === skillId)) || null;
export const getAnySkill = (skillId) => {
  const area = getAreaBySkill(skillId);
  return area ? area.skills.find((s) => s.id === skillId) : null;
};

// ---- Estado del camino (la misma lógica que getSkillPathState, para cualquier área) ----
export function getAreaPathState(studentId, area) {
  const skills = area.skills;
  const map = loadSkillMap(studentId);
  const statuses = {};
  let lastWithData = -1;
  skills.forEach((s, i) => {
    if ((map[s.id]?.attempts || 0) > 0) lastWithData = i;
  });
  skills.forEach((s, i) => {
    const raw = skillStatus(map[s.id]);
    statuses[s.id] = raw === 'sin_datos' && i < lastWithData ? 'dominada' : raw;
  });
  const isUnlocked = (skill) => skill.prereq.every((p) => statuses[p] === 'dominada');
  const current = skills.find((s) => isUnlocked(s) && statuses[s.id] !== 'dominada') || null;
  const mastered = skills.filter((s) => statuses[s.id] === 'dominada');
  const locked = skills.filter((s) => !isUnlocked(s) && statuses[s.id] !== 'dominada' && s !== current);
  const weak = skills.filter((s) => statuses[s.id] === 'necesita_ayuda');
  const hasData = lastWithData >= 0;
  return { map, statuses, current, mastered, locked, weak, hasData };
}

// ¿Hay datos en ALGUNA área? (para decidir si mostrar el diagnóstico)
export function anyAreaHasData(studentId) {
  return ALL_AREAS.some((a) => getAreaPathState(studentId, a).hasData);
}

// ---- Práctica programática para CUALQUIER habilidad (mates o vida diaria) ----
export function generateAnyPracticeLesson(skillId, count = 8) {
  const skill = getAnySkill(skillId);
  if (!skill) return null;
  const area = getAreaBySkill(skillId);
  const items = Array.from({ length: count }, () => skill.gen());
  return {
    id: `practice-${skillId}-${Date.now()}`,
    skillId,
    title: `Práctica: ${skill.name}`,
    subjectName: area.name,
    instruction: `Vamos a practicar: ${skill.name.toLowerCase()}. ¡Tú puedes!`,
    explanation: null,
    items,
    totalItems: items.length,
    adaptations: [],
  };
}

// Pasos del diagnóstico multi-área: después de mates, 2 preguntas por cada área
// nueva (primera y segunda habilidad), para ubicar el punto de partida sin cansar.
export const LIFE_DIAGNOSTIC_STEPS = LIFE_AREAS.flatMap((area) =>
  area.skills.slice(0, 2).map((skill) => ({ area, skill }))
);

// ---- Resumen para el tutor IA: todas las áreas ----
export function getFullSkillSummaryForTutor(studentId) {
  const partes = [];
  for (const area of ALL_AREAS) {
    const state = getAreaPathState(studentId, area);
    if (!state.hasData) continue;
    const dominadas = state.mastered.map((s) => s.name).join(', ');
    const debiles = area.skills
      .filter((s) => {
        const st = state.map[s.id];
        return st && st.attempts > 0 && st.correct / st.attempts < 0.8;
      })
      .map((s) => `${s.name} (${accuracy(state.map[s.id])}% de acierto)`)
      .join(', ');
    let linea = `${area.name}:`;
    if (dominadas) linea += ` domina [${dominadas}].`;
    if (debiles) linea += ` necesita ayuda en [${debiles}].`;
    if (state.current) linea += ` Trabaja ahora: ${state.current.name}.`;
    const errores = area.skills
      .flatMap((s) => (state.map[s.id]?.recentErrors || []).slice(0, 1).map((e) => `falló "${e.q}" (dijo ${e.wrong}, era ${e.answer})`))
      .slice(0, 2);
    if (errores.length > 0) linea += ` Errores recientes: ${errores.join(' | ')}.`;
    partes.push(linea);
  }
  if (partes.length === 0) {
    return 'La estudiante aún no tiene datos de habilidades; es nueva o no ha hecho el diagnóstico.';
  }
  return partes.join(' ');
}

// ---- Resumen para el panel de padres: todas las áreas con % y recomendación ----
export function getFullParentSkillSummary(studentId) {
  const areas = ALL_AREAS.map((area) => {
    const state = getAreaPathState(studentId, area);
    const rows = area.skills.map((s) => ({
      ...s,
      stat: state.map[s.id] || null,
      status: state.statuses[s.id],
      accuracy: accuracy(state.map[s.id]),
    }));
    // % del área: promedio de aciertos de las habilidades con datos (0 si no hay)
    const conDatos = rows.filter((r) => r.stat && r.stat.attempts > 0);
    const percent = conDatos.length > 0
      ? Math.round(conDatos.reduce((a, r) => a + r.accuracy, 0) / conDatos.length)
      : null;
    let recommendation = null;
    if (state.weak.length > 0) {
      recommendation = `Practicar "${state.weak[0].name}" unos 10 minutos al día hasta que se sienta segura.`;
    } else if (state.current) {
      recommendation = `Su siguiente paso es "${state.current.name}". 10 minutos al día de práctica corta y constante.`;
    } else if (state.hasData) {
      recommendation = `Ha dominado todo el camino de ${area.name.toLowerCase()}. ¡Puede pasar a retos más avanzados!`;
    }
    return { area, rows, recommendation, hasData: state.hasData, percent, current: state.current, mastered: state.mastered, weak: state.weak };
  });
  const hasData = areas.some((a) => a.hasData);
  // Recomendación global: la primera área con algo que practicar
  const prioridad = areas.find((a) => a.weak.length > 0) || areas.find((a) => a.current);
  const recommendation = prioridad
    ? `${prioridad.area.name}: ${prioridad.recommendation}`
    : hasData
      ? 'Ha dominado todos los caminos. ¡Increíble trabajo!'
      : null;
  return { areas, hasData, recommendation };
}

// Re-exportamos recordAttempt para que los componentes nuevos lo importen de un
// solo lugar si lo prefieren (mismo motor de localStorage para todas las áreas).
export { recordAttempt };
