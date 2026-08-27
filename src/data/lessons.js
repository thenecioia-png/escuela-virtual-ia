// Lecciones organizadas por materia, nivel y estilo de aprendizaje preferido
// Cada lección tiene variantes: visual, auditivo, kinestesico, lector

import { EXTRA_LESSONS } from './lessons-extra';

export const LESSONS = {
  math: {
    sumas_restas: [
      {
        id: 'm_s1',
        title: 'Sumas mágicas',
        visual: {
          instruction: 'Mira estos bloques de colores. ¿Cuántos hay en total?',
          items: [
            { q: '🟥🟥🟥 + 🟦🟦 = ?', options: ['4', '5', '6', '3'], answer: '5', explanation: '3 bloques rojos + 2 bloques azules = 5 bloques' },
            { q: '🍎🍎 + 🍎🍎🍎 = ?', options: ['4', '5', '6', '3'], answer: '5', explanation: '2 manzanas + 3 manzanas = 5 manzanas' },
            { q: '⭐⭐⭐⭐ + ⭐⭐ = ?', options: ['5', '6', '7', '4'], answer: '6', explanation: '4 estrellas + 2 estrellas = 6 estrellas' },
          ],
        },
        auditivo: {
          instruction: 'Escucha atentamente los números y suma en tu mente.',
          items: [
            { q: 'Dos más tres', options: ['4', '5', '6', '3'], answer: '5', explanation: '2 + 3 = 5' },
            { q: 'Uno más cuatro', options: ['4', '5', '6', '3'], answer: '5', explanation: '1 + 4 = 5' },
            { q: 'Tres más tres', options: ['5', '6', '7', '4'], answer: '6', explanation: '3 + 3 = 6' },
          ],
        },
        kinestesico: {
          instruction: 'Imagina que juntas tus dedos. Toca la pantalla para contar.',
          items: [
            { q: 'Levanta 2 dedos de una mano y 3 de la otra. ¿Cuántos en total?', options: ['4', '5', '6', '3'], answer: '5', explanation: '2 dedos + 3 dedos = 5 dedos' },
            { q: 'Salta 1 vez y luego 3 veces. ¿Cuántos saltos?', options: ['3', '4', '5', '2'], answer: '4', explanation: '1 salto + 3 saltos = 4 saltos' },
            { q: 'Da 2 palmadas y luego 2 más. ¿Cuántas palmadas?', options: ['3', '4', '5', '2'], answer: '4', explanation: '2 palmadas + 2 palmadas = 4 palmadas' },
          ],
        },
        lector: {
          instruction: 'Lee el problema y encuentra la respuesta.',
          items: [
            { q: 'María tiene 2 gatos y Juan le regala 3 más. ¿Cuántos gatos tiene María?', options: ['4', '5', '6', '3'], answer: '5', explanation: '2 + 3 = 5 gatos' },
            { q: 'En el árbol hay 4 pájaros y llegan 2 más. ¿Cuántos pájaros hay?', options: ['5', '6', '7', '4'], answer: '6', explanation: '4 + 2 = 6 pájaros' },
            { q: 'Pedro tiene 1 dulce y su mamá le da 3. ¿Cuántos dulces tiene?', options: ['3', '4', '5', '2'], answer: '4', explanation: '1 + 3 = 4 dulces' },
          ],
        },
      },
      {
        id: 'm_s2',
        title: 'Restas divertidas',
        visual: {
          instruction: 'Algunos objetos desaparecen. ¿Cuántos quedan?',
          items: [
            { q: '🍊🍊🍊🍊🍊 - 🍊🍊 = ?', options: ['2', '3', '4', '5'], answer: '3', explanation: '5 naranjas - 2 naranjas = 3 naranjas' },
            { q: '🦋🦋🦋🦋 - 🦋 = ?', options: ['2', '3', '4', '1'], answer: '3', explanation: '4 mariposas - 1 mariposa = 3 mariposas' },
          ],
        },
        auditivo: {
          instruction: 'Escucha y resta mentalmente.',
          items: [
            { q: 'Cinco menos dos', options: ['2', '3', '4', '1'], answer: '3', explanation: '5 - 2 = 3' },
            { q: 'Cuatro menos uno', options: ['2', '3', '4', '1'], answer: '3', explanation: '4 - 1 = 3' },
          ],
        },
        kinestesico: {
          instruction: 'Imagina que escondes objetos. ¿Cuántos quedan visibles?',
          items: [
            { q: 'Tienes 5 monedas en la mano y dejas caer 2. ¿Cuántas quedan?', options: ['2', '3', '4', '1'], answer: '3', explanation: '5 - 2 = 3 monedas' },
            { q: 'Hay 4 pelotas y quitas 1. ¿Cuántas quedan?', options: ['2', '3', '4', '1'], answer: '3', explanation: '4 - 1 = 3 pelotas' },
          ],
        },
        lector: {
          instruction: 'Lee el problema de resta.',
          items: [
            { q: 'Ana tenía 5 lápices y perdió 2. ¿Cuántos tiene ahora?', options: ['2', '3', '4', '1'], answer: '3', explanation: '5 - 2 = 3 lápices' },
            { q: 'En la caja había 4 juguetes y sacamos 1. ¿Cuántos quedan?', options: ['2', '3', '4', '1'], answer: '3', explanation: '4 - 1 = 3 juguetes' },
          ],
        },
      },
    ],
    multiplicacion: [
      {
        id: 'm_m1',
        title: 'Multiplicación con grupos',
        visual: {
          instruction: 'Cuenta los grupos iguales.',
          items: [
            { q: '🍇🍇 | 🍇🍇 | 🍇🍇  → 3 grupos de 2 = ?', options: ['4', '5', '6', '3'], answer: '6', explanation: '3 × 2 = 6 uvas' },
            { q: '🌸🌸🌸 | 🌸🌸🌸  → 2 grupos de 3 = ?', options: ['5', '6', '7', '4'], answer: '6', explanation: '2 × 3 = 6 flores' },
          ],
        },
        auditivo: {
          instruction: 'Repite: "dos veces tres", "tres veces dos".',
          items: [
            { q: 'Dos veces cuatro', options: ['6', '7', '8', '5'], answer: '8', explanation: '2 × 4 = 8' },
            { q: 'Tres veces tres', options: ['6', '7', '8', '9'], answer: '9', explanation: '3 × 3 = 9' },
          ],
        },
        kinestesico: {
          instruction: 'Imagina que haces filas y columnas con tus dedos.',
          items: [
            { q: 'Haz 2 filas de 4 saltos cada una. ¿Cuántos saltos en total?', options: ['6', '7', '8', '5'], answer: '8', explanation: '2 × 4 = 8 saltos' },
            { q: 'Pon 3 montones de 3 piedras cada uno. ¿Cuántas piedras?', options: ['6', '7', '8', '9'], answer: '9', explanation: '3 × 3 = 9 piedras' },
          ],
        },
        lector: {
          instruction: 'Lee y resuelve.',
          items: [
            { q: 'Hay 2 cajas con 5 lápices cada una. ¿Cuántos lápices hay?', options: ['8', '9', '10', '7'], answer: '10', explanation: '2 × 5 = 10 lápices' },
            { q: 'Una mano tiene 5 dedos. ¿Cuántos dedos tienen 2 manos?', options: ['8', '9', '10', '7'], answer: '10', explanation: '2 × 5 = 10 dedos' },
          ],
        },
      },
    ],
    fracciones: [
      {
        id: 'm_f1',
        title: 'Partes iguales',
        visual: {
          instruction: 'Mira la figura dividida en partes iguales.',
          items: [
            { q: '🍕 cortada en 2 partes iguales. Si comes 1 parte, ¿qué fracción comiste?', options: ['1/3', '1/2', '1/4', '2/2'], answer: '1/2', explanation: 'Comiste 1 de 2 partes = 1/2' },
            { q: '🍫 dividido en 4 partes iguales. Si tomas 1 parte, ¿qué fracción es?', options: ['1/3', '1/2', '1/4', '2/4'], answer: '1/4', explanation: 'Tomaste 1 de 4 partes = 1/4' },
          ],
        },
        auditivo: {
          instruction: 'Escucha y responde con la fracción correcta.',
          items: [
            { q: 'Una pizza dividida en 2 partes. Comí una parte. ¿Qué fracción comí?', options: ['1/3', '1/2', '1/4', '2/2'], answer: '1/2', explanation: '1 de 2 partes = 1/2' },
            { q: 'Un chocolate en 4 pedazos. Tomé un pedazo. ¿Qué fracción tomé?', options: ['1/3', '1/2', '1/4', '2/4'], answer: '1/4', explanation: '1 de 4 partes = 1/4' },
          ],
        },
        kinestesico: {
          instruction: 'Imagina que divides algo con tus manos.',
          items: [
            { q: 'Dobla un papel por la mitad. ¿En cuántas partes queda?', options: ['1', '2', '3', '4'], answer: '2', explanation: 'Doblar a la mitad = 2 partes' },
            { q: 'Si compartes una galleta con 3 amigos (4 personas en total), ¿qué parte te toca?', options: ['1/2', '1/3', '1/4', '1/5'], answer: '1/4', explanation: '1 de 4 partes = 1/4' },
          ],
        },
        lector: {
          instruction: 'Lee el problema sobre fracciones.',
          items: [
            { q: 'Un pastel se cortó en 3 pedazos iguales. Sofía comió 1 pedazo. ¿Qué fracción comió?', options: ['1/2', '1/3', '1/4', '2/3'], answer: '1/3', explanation: '1 de 3 partes = 1/3' },
            { q: 'Una barra de pan se partió en 5 rebanadas. Tomé 1. ¿Qué fracción tomé?', options: ['1/4', '1/5', '1/3', '2/5'], answer: '1/5', explanation: '1 de 5 partes = 1/5' },
          ],
        },
      },
    ],
    geometria: [
      {
        id: 'm_g1',
        title: 'Formas y figuras',
        visual: {
          instruction: 'Identifica la forma.',
          items: [
            { q: '¿Qué forma tiene una pelota?', options: ['Cuadrado', 'Triángulo', 'Círculo', 'Rectángulo'], answer: 'Círculo', explanation: 'Una pelota es redonda → Círculo' },
            { q: '¿Qué forma tiene una caja de zapatos?', options: ['Círculo', 'Triángulo', 'Cuadrado', 'Rectángulo'], answer: 'Rectángulo', explanation: 'Una caja de zapatos tiene lados rectos y largos → Rectángulo' },
          ],
        },
        auditivo: {
          instruction: 'Escucha la descripción y adivina la forma.',
          items: [
            { q: 'Tiene 3 lados y 3 esquinas.', options: ['Círculo', 'Cuadrado', 'Triángulo', 'Rectángulo'], answer: 'Triángulo', explanation: '3 lados y 3 esquinas → Triángulo' },
            { q: 'Tiene 4 lados iguales y 4 esquinas.', options: ['Círculo', 'Triángulo', 'Cuadrado', 'Rectángulo'], answer: 'Cuadrado', explanation: '4 lados iguales → Cuadrado' },
          ],
        },
        kinestesico: {
          instruction: 'Imagina que dibujas la forma en el aire con el dedo.',
          items: [
            { q: 'Dibuja en el aire una forma redonda sin esquinas.', options: ['Cuadrado', 'Triángulo', 'Círculo', 'Rectángulo'], answer: 'Círculo', explanation: 'Sin esquinas y redonda → Círculo' },
            { q: 'Dibuja una forma con 4 lados iguales.', options: ['Círculo', 'Triángulo', 'Cuadrado', 'Rectángulo'], answer: 'Cuadrado', explanation: '4 lados iguales → Cuadrado' },
          ],
        },
        lector: {
          instruction: 'Lee y elige la forma correcta.',
          items: [
            { q: 'Una señal de alto tiene 8 lados. ¿Qué forma es?', options: ['Octágono', 'Hexágono', 'Pentágono', 'Heptágono'], answer: 'Octágono', explanation: '8 lados → Octágono' },
            { q: 'Una ventana común tiene 4 lados, con dos más largos que otros. ¿Qué forma es?', options: ['Cuadrado', 'Círculo', 'Rectángulo', 'Triángulo'], answer: 'Rectángulo', explanation: '4 lados con pares iguales → Rectángulo' },
          ],
        },
      },
    ],
    problemas: [
      {
        id: 'm_p1',
        title: 'Problemas del día',
        visual: {
          instruction: 'Lee la situación y resuelve.',
          items: [
            { q: 'Tienes $20. Un helado cuesta $8 y un chicle $3. ¿Cuánto te queda?', options: ['$7', '$8', '$9', '$10'], answer: '$9', explanation: '20 - 8 - 3 = 9' },
            { q: 'En un autobús suben 12 personas, bajan 5 y suben 3. ¿Cuántas hay ahora?', options: ['8', '9', '10', '11'], answer: '10', explanation: '12 - 5 + 3 = 10' },
          ],
        },
        auditivo: {
          instruction: 'Escucha el problema mentalmente.',
          items: [
            { q: 'Tienes quince canicas. Regalas seis y encuentras dos. ¿Cuántas tienes?', options: ['9', '10', '11', '12'], answer: '11', explanation: '15 - 6 + 2 = 11' },
            { q: 'Un árbol tenía ocho pájaros. Llegaron tres y se fueron dos. ¿Cuántos quedan?', options: ['8', '9', '10', '11'], answer: '9', explanation: '8 + 3 - 2 = 9' },
          ],
        },
        kinestesico: {
          instruction: 'Imagina que actúas el problema.',
          items: [
            { q: 'Tienes 10 pasos para llegar a la puerta. Das 3 y retrocedes 1. ¿Cuántos pasos te faltan?', options: ['6', '7', '8', '9'], answer: '8', explanation: 'Das 3 y retrocedes 1: avanzas 2. Te faltan 8 pasos.' },
            { q: 'Salta 4 veces, giras y saltas 3 más. ¿Cuántos saltos en total?', options: ['6', '7', '8', '9'], answer: '7', explanation: '4 + 3 = 7 saltos' },
          ],
        },
        lector: {
          instruction: 'Lee con atención y resuelve paso a paso.',
          items: [
            { q: 'María compró 3 libros a $12 cada uno. Pagó con un billete de $50. ¿Cuánto le devolvieron?', options: ['$12', '$14', '$16', '$18'], answer: '$14', explanation: '3 × 12 = 36. 50 - 36 = 14' },
            { q: 'Un tren tiene 6 vagones. En cada vagón caben 8 personas. ¿Cuántas personas caben en total?', options: ['42', '46', '48', '50'], answer: '48', explanation: '6 × 8 = 48' },
          ],
        },
      },
    ],
  },
  reading: {
    silabas: [
      {
        id: 'r_s1',
        title: 'Uniendo sílabas',
        visual: {
          instruction: 'Une las sílabas y forma la palabra.',
          items: [
            { q: 'MA + MA = ?', options: ['MAMA', 'MAMÁ', 'MMAA', 'AMMA'], answer: 'MAMÁ', explanation: 'MA + MA = MAMÁ' },
            { q: 'PA + PA = ?', options: ['PAPA', 'PAPÁ', 'APAP', 'PPAA'], answer: 'PAPÁ', explanation: 'PA + PA = PAPÁ' },
            { q: 'SO + LA = ?', options: ['SOLA', 'SALO', 'OSLA', 'LASO'], answer: 'SOLA', explanation: 'SO + LA = SOLA' },
          ],
        },
        auditivo: {
          instruction: 'Escucha las sílabas y forma la palabra.',
          items: [
            { q: '¿Qué palabra forman las sílabas "ME" y "SA"?', options: ['MESA', 'SEMA', 'ESMA', 'MAES'], answer: 'MESA', explanation: 'ME + SA = MESA' },
            { q: '¿Qué palabra forman "LU" y "NA"?', options: ['LUNA', 'NALU', 'ULNA', 'ANLU'], answer: 'LUNA', explanation: 'LU + NA = LUNA' },
          ],
        },
        kinestesico: {
          instruction: 'Imagina que escribes las sílabas en el aire.',
          items: [
            { q: 'Escribe "CA" y "SA" en el aire y únelas. ¿Qué palabra es?', options: ['CASA', 'SACA', 'ACAS', 'AASC'], answer: 'CASA', explanation: 'CA + SA = CASA' },
            { q: 'Escribe "LU" y "Z" y únelas. ¿Qué palabra es?', options: ['LUZ', 'ZUL', 'ULZ', 'LZU'], answer: 'LUZ', explanation: 'LU + Z = LUZ' },
          ],
        },
        lector: {
          instruction: 'Lee las sílabas y escribe la palabra completa.',
          items: [
            { q: 'PE + RO = ?', options: ['PERO', 'REPO', 'EPRO', 'OPER'], answer: 'PERO', explanation: 'PE + RO = PERO' },
            { q: 'MA + NO = ?', options: ['MANO', 'NOMA', 'ANMO', 'OMAN'], answer: 'MANO', explanation: 'MA + NO = MANO' },
          ],
        },
      },
    ],
    comprension: [
      {
        id: 'r_c1',
        title: 'Entendiendo historias',
        visual: {
          instruction: 'Lee la historia y responde.',
          items: [
            { q: 'La tortuga caminaba lento pero llegó primero. ¿Por qué?', options: ['Corrió muy rápido', 'La liebre se durmió', 'Usó un auto', 'Voló'], answer: 'La liebre se durmió', explanation: 'En la fábula, la liebre se confió y se durmió.' },
            { q: 'Un niño sembró una semilla. La regó todos los días. ¿Qué pasó?', options: ['Se secó', 'Creció una planta', 'Se la comió un pájaro', 'No pasó nada'], answer: 'Creció una planta', explanation: 'Regar todos los días ayuda a que la planta crezca.' },
          ],
        },
        auditivo: {
          instruction: 'Escucha con atención la historia.',
          items: [
            { q: 'Un lobo quería comerse a tres cerditos. ¿Qué hicieron los cerditos?', options: ['Se escondieron en el bosque', 'Construyeron casas', 'Se fueron de viaje', 'Le dieron comida al lobo'], answer: 'Construyeron casas', explanation: 'Cada cerdito construyó una casa para protegerse.' },
            { q: 'Un patito era diferente a sus hermanos. Al crecer se convirtió en...', options: ['Un pollo', 'Un cisne', 'Un ganso', 'Un águila'], answer: 'Un cisne', explanation: 'El patito feo se convirtió en un hermoso cisne.' },
          ],
        },
        kinestesico: {
          instruction: 'Imagina que actúas la historia.',
          items: [
            { q: 'Actúa que eres una semilla bajo tierra. ¿Qué haces para crecer?', options: ['Te quedas quieto', 'Buscas agua y luz', 'Te mueves de lugar', 'Te escondes más'], answer: 'Buscas agua y luz', explanation: 'Las plantas necesitan agua y luz para crecer.' },
            { q: 'Actúa que eres un árbol. El viento sopla fuerte. ¿Qué haces?', options: ['Te caes', 'Te doblas pero no te rompes', 'Te vas volando', 'Te escondes'], answer: 'Te doblas pero no te rompes', explanation: 'Los árboles fuertes se doblan con el viento.' },
          ],
        },
        lector: {
          instruction: 'Lee el texto con calma.',
          items: [
            { q: 'María encontró una llave dorada debajo de un árbol. La guardó en su bolsillo. ¿Dónde encontró la llave?', options: ['En su casa', 'Debajo de un árbol', 'En el río', 'En la escuela'], answer: 'Debajo de un árbol', explanation: 'El texto dice "debajo de un árbol".' },
            { q: 'Pedro tenía miedo de la oscuridad. Su mamá le regaló una lámpara mágica. ¿Qué le regaló su mamá?', options: ['Un osito', 'Una lámpara mágica', 'Una linterna', 'Una vela'], answer: 'Una lámpara mágica', explanation: 'El texto dice "una lámpara mágica".' },
          ],
        },
      },
    ],
  },
  logic: {
    patrones: [
      {
        id: 'l_p1',
        title: 'Descubriendo patrones',
        visual: {
          instruction: 'Mira la serie y elige qué sigue.',
          items: [
            { q: '🔴🔵🔴🔵🔴 ?', options: ['🔴', '🔵', '🔴🔵', '🔵🔴'], answer: '🔵', explanation: 'El patrón es rojo, azul, rojo, azul... sigue azul.' },
            { q: '🌑🌒🌓🌔 ?', options: ['🌕', '🌖', '🌗', '🌘'], answer: '🌕', explanation: 'La luna va creciendo hasta llena.' },
          ],
        },
        auditivo: {
          instruction: 'Escucha el patrón y completa.',
          items: [
            { q: 'Clap-clap-silencio, clap-clap-silencio, clap-clap... ¿qué sigue?', options: ['clap', 'silencio', 'clap-clap', 'nada'], answer: 'silencio', explanation: 'El patrón es dos palmadas y silencio.' },
            { q: 'Alta-baja-alta-baja-alta... ¿qué sigue?', options: ['alta', 'baja', 'media', 'silencio'], answer: 'baja', explanation: 'El patrón alterna alta y baja.' },
          ],
        },
        kinestesico: {
          instruction: 'Siente el patrón con movimientos.',
          items: [
            { q: 'Salta-salta-giro, salta-salta-giro, salta-salta... ¿qué sigue?', options: ['salta', 'giro', 'salta-salta', 'parar'], answer: 'giro', explanation: 'Dos saltos y un giro.' },
            { q: 'Toca nariz-toca oreja-toca nariz-toca oreja-toca nariz... ¿qué sigue?', options: ['nariz', 'oreja', 'cabeza', 'boca'], answer: 'oreja', explanation: 'Alterna nariz y oreja.' },
          ],
        },
        lector: {
          instruction: 'Lee la secuencia lógica.',
          items: [
            { q: 'A, B, A, B, A, ?', options: ['A', 'B', 'C', 'D'], answer: 'B', explanation: 'Alterna A y B.' },
            { q: '2, 4, 6, 8, ?', options: ['9', '10', '12', '14'], answer: '10', explanation: 'Números pares: +2 cada vez.' },
          ],
        },
      },
    ],
    seriacion: [
      {
        id: 'l_s1',
        title: 'Ordenar y clasificar',
        visual: {
          instruction: 'Ordena de menor a mayor.',
          items: [
            { q: 'Ordena: 🐜 🐘 🐁  → del más pequeño al más grande', options: ['🐜🐁🐘', '🐁🐜🐘', '🐘🐁🐜', '🐜🐘🐁'], answer: '🐜🐁🐘', explanation: 'Hormiga < Ratón < Elefante' },
            { q: 'Ordena: 🌱 🌳 🌿  → del más joven al más viejo', options: ['🌱🌿🌳', '🌿🌱🌳', '🌳🌿🌱', '🌱🌳🌿'], answer: '🌱🌿🌳', explanation: 'Brote < Planta < Árbol' },
          ],
        },
        auditivo: {
          instruction: 'Escucha y ordena.',
          items: [
            { q: 'Pitido corto, pitido largo, pitido mediano. ¿Orden de corto a largo?', options: ['corto-mediano-largo', 'corto-largo-mediano', 'mediano-corto-largo', 'largo-mediano-corto'], answer: 'corto-mediano-largo', explanation: 'Corto < Mediano < Largo' },
            { q: 'Voz baja, voz alta, voz media. ¿Orden de baja a alta?', options: ['baja-media-alta', 'baja-alta-media', 'media-baja-alta', 'alta-media-baja'], answer: 'baja-media-alta', explanation: 'Baja < Media < Alta' },
          ],
        },
        kinestesico: {
          instruction: 'Imagina que ordenas objetos con las manos.',
          items: [
            { q: 'Tienes 3 pelotas: pequeña, mediana, grande. ¿Cómo las apilas de abajo hacia arriba?', options: ['grande-mediana-pequeña', 'pequeña-mediana-grande', 'mediana-pequeña-grande', 'grande-pequeña-mediana'], answer: 'grande-mediana-pequeña', explanation: 'La más grande abajo para que no se caiga.' },
            { q: 'Ordena tus pasos: trote, caminata, carrera. Del más lento al más rápido.', options: ['caminata-trote-carrera', 'trote-caminata-carrera', 'carrera-trote-caminata', 'caminata-carrera-trote'], answer: 'caminata-trote-carrera', explanation: 'Caminar < Trotar < Correr' },
          ],
        },
        lector: {
          instruction: 'Lee y ordena.',
          items: [
            { q: 'Ordena los meses: marzo, enero, febrero', options: ['enero-febrero-marzo', 'marzo-febrero-enero', 'febrero-enero-marzo', 'marzo-enero-febrero'], answer: 'enero-febrero-marzo', explanation: 'Enero → Febrero → Marzo' },
            { q: 'Ordena: bebé, abuelo, niño, adulto', options: ['bebé-niño-adulto-abuelo', 'abuelo-adulto-niño-bebé', 'niño-bebé-adulto-abuelo', 'bebé-adulto-niño-abuelo'], answer: 'bebé-niño-adulto-abuelo', explanation: 'Bebé → Niño → Adulto → Abuelo' },
          ],
        },
      },
    ],
  },
  science: {
    seres_vivos: [
      {
        id: 'sc_sv1',
        title: 'Seres vivos y no vivos',
        visual: {
          instruction: 'Elige si el objeto es vivo o no vivo.',
          items: [
            { q: '🌳', options: ['Vivo', 'No vivo'], answer: 'Vivo', explanation: 'El árbol crece, respira y necesita agua.' },
            { q: '🪨', options: ['Vivo', 'No vivo'], answer: 'No vivo', explanation: 'La piedra no crece ni respira.' },
            { q: '🐕', options: ['Vivo', 'No vivo'], answer: 'Vivo', explanation: 'El perro se mueve, respira y come.' },
          ],
        },
        auditivo: {
          instruction: 'Escucha y responde.',
          items: [
            { q: 'Algo que ladra, respira y corre.', options: ['Vivo', 'No vivo'], answer: 'Vivo', explanation: 'Un perro es un ser vivo.' },
            { q: 'Algo que no se mueve solo y no respira.', options: ['Vivo', 'No vivo'], answer: 'No vivo', explanation: 'Una mesa no es un ser vivo.' },
          ],
        },
        kinestesico: {
          instruction: 'Imagina que interactúas con el objeto.',
          items: [
            { q: 'Puedes abrazarlo y siente que late.', options: ['Vivo', 'No vivo'], answer: 'Vivo', explanation: 'Un corazón que late indica vida.' },
            { q: 'Lo lanzas y no reacciona ni se mueve solo.', options: ['Vivo', 'No vivo'], answer: 'No vivo', explanation: 'Los objetos inanimados no reaccionan solos.' },
          ],
        },
        lector: {
          instruction: 'Lee y decide.',
          items: [
            { q: 'La flor necesita agua y luz del sol para crecer.', options: ['Vivo', 'No vivo'], answer: 'Vivo', explanation: 'Las plantas son seres vivos.' },
            { q: 'La silla se usa para sentarse pero no crece.', options: ['Vivo', 'No vivo'], answer: 'No vivo', explanation: 'La silla es un objeto.' },
          ],
        },
      },
    ],
    cuerpo: [
      {
        id: 'sc_cu1',
        title: 'Mi cuerpo',
        visual: {
          instruction: 'Identifica la parte del cuerpo.',
          items: [
            { q: 'Con esto ves el mundo. 👁️', options: ['Ojos', 'Orejas', 'Nariz', 'Boca'], answer: 'Ojos', explanation: 'Los ojos sirven para ver.' },
            { q: 'Con esto escuchas música. 👂', options: ['Ojos', 'Orejas', 'Nariz', 'Boca'], answer: 'Orejas', explanation: 'Las orejas sirven para oír.' },
          ],
        },
        auditivo: {
          instruction: 'Escucha la función y adivina.',
          items: [
            { q: 'Esta parte del cuerpo te permite oler las flores.', options: ['Ojos', 'Orejas', 'Nariz', 'Boca'], answer: 'Nariz', explanation: 'La nariz sirve para oler.' },
            { q: 'Con esta parte pruebas el sabor de la comida.', options: ['Ojos', 'Orejas', 'Nariz', 'Boca'], answer: 'Boca', explanation: 'La boca sirve para probar sabores.' },
          ],
        },
        kinestesico: {
          instruction: 'Toca la parte de tu cuerpo.',
          items: [
            { q: 'Toca la parte que usas para agarrar cosas.', options: ['Manos', 'Pies', 'Cabeza', 'Brazos'], answer: 'Manos', explanation: 'Las manos agarran objetos.' },
            { q: 'Toca la parte que usas para caminar.', options: ['Manos', 'Pies', 'Cabeza', 'Brazos'], answer: 'Pies', explanation: 'Los pies caminan.' },
          ],
        },
        lector: {
          instruction: 'Lee y responde.',
          items: [
            { q: 'El cerebro está dentro del cráneo y piensa.', options: ['Corazón', 'Cerebro', 'Pulmón', 'Estómago'], answer: 'Cerebro', explanation: 'El cerebro piensa y controla el cuerpo.' },
            { q: 'El corazón bombea sangre por todo el cuerpo.', options: ['Corazón', 'Cerebro', 'Pulmón', 'Estómago'], answer: 'Corazón', explanation: 'El corazón bombea sangre.' },
          ],
        },
      },
    ],
  },
  emotions: {
    identificar: [
      {
        id: 'e_i1',
        title: '¿Cómo te sientes?',
        visual: {
          instruction: 'Mira la cara y elige la emoción.',
          items: [
            { q: '😊', options: ['Triste', 'Feliz', 'Enojado', 'Sorprendido'], answer: 'Feliz', explanation: 'La sonrisa indica felicidad.' },
            { q: '😢', options: ['Triste', 'Feliz', 'Enojado', 'Sorprendido'], answer: 'Triste', explanation: 'Las lágrimas indican tristeza.' },
            { q: '😠', options: ['Triste', 'Feliz', 'Enojado', 'Sorprendido'], answer: 'Enojado', explanation: 'El ceño fruncido indica enojo.' },
          ],
        },
        auditivo: {
          instruction: 'Escucha la situación y adivina la emoción.',
          items: [
            { q: 'Ganaste un premio que querías mucho.', options: ['Triste', 'Feliz', 'Enojado', 'Sorprendido'], answer: 'Feliz', explanation: 'Ganar algo deseado causa felicidad.' },
            { q: 'Tu mascota se perdió y no la encuentras.', options: ['Triste', 'Feliz', 'Enojado', 'Sorprendido'], answer: 'Triste', explanation: 'Perder a alguien querido causa tristeza.' },
          ],
        },
        kinestesico: {
          instruction: 'Imagina que sientes esto en tu cuerpo.',
          items: [
            { q: 'Tu corazón late rápido y quieres gritar.', options: ['Triste', 'Feliz', 'Enojado', 'Sorprendido'], answer: 'Enojado', explanation: 'El enojo hace que el corazón lata rápido.' },
            { q: 'Tu cara se calienta y quieres reír.', options: ['Triste', 'Feliz', 'Enojado', 'Sorprendido'], answer: 'Feliz', explanation: 'La felicidad hace reír.' },
          ],
        },
        lector: {
          instruction: 'Lee la situación y nombra la emoción.',
          items: [
            { q: 'Lucía vio un regalo grande en la mesa que no esperaba. ¿Qué sintió?', options: ['Triste', 'Feliz', 'Enojado', 'Sorprendido'], answer: 'Sorprendido', explanation: 'Algo inesperado causa sorpresa.' },
            { q: 'Pedro rompió su juguete favorito. ¿Cómo se siente?', options: ['Triste', 'Feliz', 'Enojado', 'Sorprendido'], answer: 'Triste', explanation: 'Perder algo querido causa tristeza.' },
          ],
        },
      },
    ],
    empatia: [
      {
        id: 'e_e1',
        title: 'Poniéndome en su lugar',
        visual: {
          instruction: 'Mira la situación y elige la mejor respuesta.',
          items: [
            { q: 'Tu amigo se cayó y se raspó la rodilla. ¿Qué haces?', options: ['Te ríes', 'Lo ayudas a levantarse', 'Te alejas', 'Lo ignoras'], answer: 'Lo ayudas a levantarse', explanation: 'Ayudar a alguien que se cayó es empatía.' },
            { q: 'Tu hermana perdió su dibujo favorito. ¿Qué le dices?', options: ['No importa', 'Lo siento mucho, ¿te ayudo a buscarlo?', 'Dibuja otro', 'Ya te dije que lo cuides'], answer: 'Lo siento mucho, ¿te ayudo a buscarlo?', explanation: 'Mostrar preocupación es empatía.' },
          ],
        },
        auditivo: {
          instruction: 'Escucha la situación y responde con empatía.',
          items: [
            { q: 'Tu amigo está llorando porque extraña a su abuela. ¿Qué dices?', options: ['Deja de llorar', 'Yo también la extrañaría', 'No es para tanto', 'Ve a jugar'], answer: 'Yo también la extrañaría', explanation: 'Validar sus sentimientos es empatía.' },
            { q: 'Un compañero no entiende la tarea y se frustra. ¿Qué haces?', options: ['Dile que es fácil', 'Explícale con paciencia', 'Dile al maestro', 'Ríete de él'], answer: 'Explícale con paciencia', explanation: 'Ayudar con paciencia es empatía.' },
          ],
        },
        kinestesico: {
          instruction: 'Imagina que estás en la situación.',
          items: [
            { q: 'Ves que alguien está solo en el recreo. ¿Qué haces?', options: ['Te unes a jugar con él', 'Lo dejas solo', 'Le dices que busque amigos', 'Te ríes'], answer: 'Te unes a jugar con él', explanation: 'Incluir a otros es empatía.' },
            { q: 'Alguien se ve nervioso antes de presentar. ¿Qué haces?', options: ['Le dices que se calle', 'Le sonríes y le das ánimos', 'Lo ignoras', 'Le dices que se ve tonto'], answer: 'Le sonríes y le das ánimos', explanation: 'Dar ánimos es empatía.' },
          ],
        },
        lector: {
          instruction: 'Lee y responde con empatía.',
          items: [
            { q: 'María llegó nueva a la escuela y no conoce a nadie. ¿Qué puedes hacer?', options: ['Presentarla con tus amigos', 'Ignorarla', 'Hablar mal de ella', 'Esperar a que ella hable'], answer: 'Presentarla con tus amigos', explanation: 'Incluir a alguien nuevo es empatía.' },
            { q: 'Pedro se siente mal porque no ganó el juego. ¿Qué le dices?', options: ['Eres un perdedor', 'La próxima vez lo lograrás, jugaste muy bien', 'Yo gané porque soy mejor', 'No juegues más'], answer: 'La próxima vez lo lograrás, jugaste muy bien', explanation: 'Animar a alguien que perdió es empatía.' },
          ],
        },
      },
    ],
  },
};

// Fusionar las lecciones adicionales que cubren niveles antes vacíos, para que
// TODOS los niveles de todas las materias tengan contenido y la niña siempre
// tenga algo nuevo que estudiar.
for (const [subj, levels] of Object.entries(EXTRA_LESSONS)) {
  if (!LESSONS[subj]) LESSONS[subj] = {};
  Object.assign(LESSONS[subj], levels);
}

export function getLesson(subjectId, levelId, index = 0) {
  const subject = LESSONS[subjectId];
  if (!subject) return null;
  const level = subject[levelId];
  if (!level || !level[index]) return null;
  return level[index];
}

export function getLessonCount(subjectId, levelId) {
  const subject = LESSONS[subjectId];
  if (!subject) return 0;
  const level = subject[levelId];
  return level ? level.length : 0;
}
