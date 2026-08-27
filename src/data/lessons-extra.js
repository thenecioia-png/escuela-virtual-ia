// Lecciones adicionales para los niveles que antes estaban VACÍOS.
// Se fusionan con LESSONS en lessons.js (merge in-place) para que TODOS los
// niveles de todas las materias tengan contenido y la niña nunca se quede
// sin qué estudiar. Cada lección solo define la variante `visual`; el motor
// usa `lesson[learningStyle] || lesson.visual` como fallback.

export const EXTRA_LESSONS = {
  writing: {
    trazos: [
      {
        id: 'w_t1',
        title: 'Trazos mágicos',
        visual: {
          instruction: 'Mira la línea y di cómo es.',
          items: [
            { q: 'Una línea que va de izquierda a derecha, derechita, se llama…', options: ['Línea recta', 'Círculo', 'Curva', 'Punto'], answer: 'Línea recta', explanation: 'Va derecha, sin doblarse, como un palito acostado.' },
            { q: 'Una línea que se dobla suave, como un tobogán, se llama…', options: ['Línea recta', 'Curva', 'Cuadrado', 'Punto'], answer: 'Curva', explanation: 'Se dobla suavemente, como una media luna.' },
            { q: '¿Con qué trazo empiezas a escribir la letra «O»?', options: ['Un círculo', 'Una línea recta', 'Un punto', 'Una cruz'], answer: 'Un círculo', explanation: 'La «O» es redonda, empiezas dibujando un círculo.' },
          ],
        },
      },
      {
        id: 'w_t2',
        title: 'Caminos de tiza',
        visual: {
          instruction: 'Elige el trazo correcto para cada figura.',
          items: [
            { q: 'Para dibujar un triángulo necesitas…', options: ['Tres líneas rectas', 'Un círculo', 'Dos puntos', 'Una espiral'], answer: 'Tres líneas rectas', explanation: 'El triángulo tiene tres lados rectos.' },
            { q: 'Una línea que sube y baja como una montaña se llama…', options: ['Zigzag', 'Círculo', 'Recta', 'Punto'], answer: 'Zigzag', explanation: 'Sube y baja con picos, como el techo de una casa.' },
            { q: '¿Qué trazo usas para escribir el número «1»?', options: ['Una línea recta', 'Un círculo', 'Una curva', 'Un zigzag'], answer: 'Una línea recta', explanation: 'El número 1 es una rayita derecha.' },
          ],
        },
      },
    ],
    letras: [
      {
        id: 'w_l1',
        title: 'El abecedario',
        visual: {
          instruction: 'Elige la letra correcta.',
          items: [
            { q: '¿Cuál es la primera letra del abecedario?', options: ['A', 'B', 'Z', 'M'], answer: 'A', explanation: 'El abecedario empieza con la letra A.' },
            { q: '¿Qué letra tiene forma de serpiente?', options: ['S', 'O', 'T', 'L'], answer: 'S', explanation: 'La S se curva como una serpiente.' },
            { q: '¿Cuál letra es una vocal?', options: ['E', 'B', 'M', 'P'], answer: 'E', explanation: 'Las vocales son A, E, I, O, U.' },
          ],
        },
      },
      {
        id: 'w_l2',
        title: 'Vocales y consonantes',
        visual: {
          instruction: 'Mira la letra y elige.',
          items: [
            { q: '¿Cuál de estas es una vocal?', options: ['I', 'R', 'S', 'T'], answer: 'I', explanation: 'I es vocal. Las vocales: A, E, I, O, U.' },
            { q: '¿Cuál letra suena «mmmm»?', options: ['M', 'O', 'A', 'E'], answer: 'M', explanation: 'La M suena «mmm», es una consonante.' },
            { q: 'La palabra «SOL» empieza con la letra…', options: ['S', 'L', 'O', 'N'], answer: 'S', explanation: 'S-O-L: la primera letra es S.' },
          ],
        },
      },
    ],
    palabras: [
      {
        id: 'w_p1',
        title: 'Formando palabras',
        visual: {
          instruction: 'Completa la palabra correctamente.',
          items: [
            { q: '«CA + SA» forma la palabra…', options: ['CASA', 'SACA', 'CASAO', 'ASA'], answer: 'CASA', explanation: 'CA + SA = CASA, el lugar donde vivimos.' },
            { q: '¿Qué palabra está bien escrita?', options: ['MESA', 'MSEA', 'MAES', 'SEMA'], answer: 'MESA', explanation: 'M-E-S-A: se escribe MESA.' },
            { q: '«LU + NA» forma la palabra…', options: ['LUNA', 'NALU', 'ULNA', 'LANU'], answer: 'LUNA', explanation: 'LU + NA = LUNA, la vemos de noche.' },
          ],
        },
      },
      {
        id: 'w_p2',
        title: 'Palabras con sílabas',
        visual: {
          instruction: 'Une las sílabas y elige la palabra correcta.',
          items: [
            { q: '«PE + LO + TA» forma…', options: ['PELOTA', 'TAPELO', 'PETALO', 'LOPETA'], answer: 'PELOTA', explanation: 'PE + LO + TA = PELOTA.' },
            { q: '«PA + TO» forma…', options: ['PATO', 'TOPA', 'APOT', 'OPAT'], answer: 'PATO', explanation: 'PA + TO = PATO, un ave que nada.' },
            { q: '¿Cuál palabra tiene dos sílabas?', options: ['GA-TO', 'SOL', 'PAN', 'LUZ'], answer: 'GA-TO', explanation: 'GA-TO tiene dos partes: GA y TO.' },
          ],
        },
      },
    ],
    oraciones: [
      {
        id: 'w_o1',
        title: 'Armando oraciones',
        visual: {
          instruction: 'Elige la oración correcta.',
          items: [
            { q: '¿Cuál oración está bien ordenada?', options: ['El gato come pescado', 'Gato el come pescado', 'Pescado come gato el', 'Come el pescado gato'], answer: 'El gato come pescado', explanation: '«El gato come pescado» tiene sujeto, verbo y orden correcto.' },
            { q: 'Toda oración empieza con…', options: ['Mayúscula', 'Minúscula', 'Un número', 'Un dibujo'], answer: 'Mayúscula', explanation: 'Siempre empezamos las oraciones con letra mayúscula.' },
            { q: 'Al final de una oración ponemos…', options: ['Un punto', 'Un dibujo', 'Una coma siempre', 'Nada'], answer: 'Un punto', explanation: 'Cerramos la oración con un punto final.' },
          ],
        },
      },
    ],
    textos: [
      {
        id: 'w_tx1',
        title: 'Pequeños escritores',
        visual: {
          instruction: 'Lee y elige la parte correcta del texto.',
          items: [
            { q: '¿Qué va primero al contar una historia?', options: ['El inicio', 'El final', 'El problema', 'La despedida'], answer: 'El inicio', explanation: 'Toda historia empieza por el inicio.' },
            { q: '«Había una vez…» es una frase para…', options: ['Empezar un cuento', 'Terminar un cuento', 'Saludar', 'Despedirse'], answer: 'Empezar un cuento', explanation: '«Había una vez» abre los cuentos.' },
            { q: 'Un texto tiene letras que juntas forman…', options: ['Palabras y oraciones', 'Solo dibujos', 'Solo números', 'Nada'], answer: 'Palabras y oraciones', explanation: 'Las letras forman palabras y las palabras, oraciones.' },
          ],
        },
      },
    ],
  },

  reading: {
    palabras: [
      {
        id: 'r_p1',
        title: 'Leyendo palabras',
        visual: {
          instruction: 'Lee la palabra y elige su dibujo.',
          items: [
            { q: '¿Qué palabra empieza igual que «MESA»?', options: ['Mano', 'Sol', 'Pato', 'Luna'], answer: 'Mano', explanation: 'Mano empieza con M, igual que Mesa.' },
            { q: '¿Cuál palabra rima con «GATO»?', options: ['PATO', 'SOL', 'LUNA', 'PAN'], answer: 'PATO', explanation: 'GATO y PATO terminan en «-ato».' },
            { q: '¿Qué palabra es más larga?', options: ['Mariposa', 'Sol', 'Pan', 'Luz'], answer: 'Mariposa', explanation: 'Mariposa tiene más letras que las demás.' },
          ],
        },
      },
    ],
    oraciones: [
      {
        id: 'r_o1',
        title: 'Leyendo oraciones',
        visual: {
          instruction: 'Lee la oración y responde.',
          items: [
            { q: '«El perro ladra en el patio.» ¿Quién ladra?', options: ['El perro', 'El gato', 'El niño', 'El pájaro'], answer: 'El perro', explanation: 'La oración dice que el perro ladra.' },
            { q: '«Ana come una manzana roja.» ¿Qué come Ana?', options: ['Una manzana', 'Una pera', 'Un plátano', 'Una naranja'], answer: 'Una manzana', explanation: 'La oración dice «una manzana roja».' },
            { q: '¿Cuál es una oración completa?', options: ['El sol brilla', 'El sol', 'Brilla', 'Sol brillar'], answer: 'El sol brilla', explanation: 'Tiene sujeto («El sol») y verbo («brilla»).' },
          ],
        },
      },
    ],
    inferencia: [
      {
        id: 'r_i1',
        title: 'Adivina qué pasó',
        visual: {
          instruction: 'Piensa y adivina la respuesta.',
          items: [
            { q: 'Luis salió con un paraguas. ¿Qué tiempo hace?', options: ['Está lloviendo', 'Hace mucho sol', 'Hay nieve', 'Hace calor'], answer: 'Está lloviendo', explanation: 'Llevar paraguas nos dice que probablemente llueve.' },
            { q: 'María se puso un abrigo y una bufanda. ¿Qué hace?', options: ['Hace frío', 'Hace calor', 'Va a nadar', 'Va a la playa'], answer: 'Hace frío', explanation: 'Abrigo y bufanda indican frío.' },
            { q: 'El vaso se cayó y se escuchó «¡pum!». ¿Qué pasó?', options: ['Se rompió el vaso', 'Se llenó de agua', 'Nadie lo oyó', 'Estaba vacío'], answer: 'Se rompió el vaso', explanation: 'El sonido «pum» sugiere que algo se rompió.' },
          ],
        },
      },
    ],
  },

  logic: {
    clasificacion: [
      {
        id: 'l_c1',
        title: '¿Cuál no pertenece?',
        visual: {
          instruction: 'Elige el elemento que no va con los demás.',
          items: [
            { q: '🍎 🍌 🍇 🚗  → ¿cuál no pertenece?', options: ['🚗', '🍎', '🍌', '🍇'], answer: '🚗', explanation: 'El carro no es una fruta como las demás.' },
            { q: '🐶 🐱 🐦 🪑  → ¿cuál no pertenece?', options: ['🪑', '🐶', '🐱', '🐦'], answer: '🪑', explanation: 'La silla no es un animal.' },
            { q: 'Rojo, Azul, Verde, Pelota → ¿cuál no pertenece?', options: ['Pelota', 'Rojo', 'Azul', 'Verde'], answer: 'Pelota', explanation: 'Pelota es un objeto; los otros son colores.' },
          ],
        },
      },
    ],
    analogias: [
      {
        id: 'l_a1',
        title: 'Analogías divertidas',
        visual: {
          instruction: 'Completa la relación.',
          items: [
            { q: 'Pájaro es a volar como pez es a…', options: ['Nadar', 'Correr', 'Saltar', 'Volar'], answer: 'Nadar', explanation: 'Así como el pájaro vuela, el pez nada.' },
            { q: 'Día es a sol como noche es a…', options: ['Luna', 'Cama', 'Sueño', 'Estrella de mar'], answer: 'Luna', explanation: 'De día brilla el sol; de noche, la luna.' },
            { q: 'Manzana es a fruta como zanahoria es a…', options: ['Verdura', 'Dulce', 'Color', 'Comida'], answer: 'Verdura', explanation: 'La manzana es fruta; la zanahoria es verdura.' },
          ],
        },
      },
    ],
    silogismos: [
      {
        id: 'l_si1',
        title: 'Pensamiento lógico',
        visual: {
          instruction: 'Piensa y saca la conclusión.',
          items: [
            { q: 'Todos los perros ladran. Toby es un perro. Entonces Toby…', options: ['Ladra', 'Maúlla', 'Vuela', 'Nada'], answer: 'Ladra', explanation: 'Si todos los perros ladran y Toby es perro, Toby ladra.' },
            { q: 'Todas las flores necesitan agua. La rosa es una flor. La rosa…', options: ['Necesita agua', 'No necesita nada', 'Necesita comida', 'Es de metal'], answer: 'Necesita agua', explanation: 'Si toda flor necesita agua, la rosa también.' },
            { q: 'Los pájaros tienen plumas. El colibrí es un pájaro. El colibrí…', options: ['Tiene plumas', 'Tiene pelo', 'Tiene escamas', 'No tiene nada'], answer: 'Tiene plumas', explanation: 'Todo pájaro tiene plumas, y el colibrí es pájaro.' },
          ],
        },
      },
    ],
  },

  science: {
    materia: [
      {
        id: 'sc_m1',
        title: 'Sólido, líquido y gas',
        visual: {
          instruction: 'Elige el estado de la materia.',
          items: [
            { q: 'El hielo es agua en estado…', options: ['Sólido', 'Líquido', 'Gaseoso', 'Ninguno'], answer: 'Sólido', explanation: 'El hielo es agua congelada, en estado sólido.' },
            { q: 'El agua que bebemos es…', options: ['Líquida', 'Sólida', 'Gaseosa', 'Polvo'], answer: 'Líquida', explanation: 'El agua que tomamos es un líquido.' },
            { q: 'El vapor que sale de la olla es…', options: ['Gas', 'Sólido', 'Líquido', 'Piedra'], answer: 'Gas', explanation: 'El vapor es agua en estado gaseoso.' },
          ],
        },
      },
    ],
    planetas: [
      {
        id: 'sc_p1',
        title: 'Nuestro sistema solar',
        visual: {
          instruction: 'Elige la respuesta sobre el espacio.',
          items: [
            { q: '¿Qué estrella nos da luz y calor?', options: ['El Sol', 'La Luna', 'Marte', 'Una nube'], answer: 'El Sol', explanation: 'El Sol es la estrella que nos da luz y calor.' },
            { q: '¿En qué planeta vivimos?', options: ['La Tierra', 'Marte', 'Júpiter', 'La Luna'], answer: 'La Tierra', explanation: 'Vivimos en el planeta Tierra.' },
            { q: 'La Tierra gira alrededor de…', options: ['El Sol', 'La Luna', 'Marte', 'Las nubes'], answer: 'El Sol', explanation: 'La Tierra orbita alrededor del Sol.' },
          ],
        },
      },
    ],
    experimentos: [
      {
        id: 'sc_e1',
        title: 'Pequeños científicos',
        visual: {
          instruction: 'Piensa qué pasará en cada experimento.',
          items: [
            { q: 'Si pones un cubito de hielo al sol, ¿qué pasa?', options: ['Se derrite', 'Se congela más', 'Se vuelve piedra', 'No pasa nada'], answer: 'Se derrite', explanation: 'El calor del sol derrite el hielo.' },
            { q: 'Si sueltas una piedra en el agua, la piedra…', options: ['Se hunde', 'Flota', 'Vuela', 'Desaparece'], answer: 'Se hunde', explanation: 'La piedra es pesada y se hunde.' },
            { q: '¿Qué flota en el agua?', options: ['Un corcho', 'Una piedra', 'Un clavo', 'Una moneda'], answer: 'Un corcho', explanation: 'El corcho es liviano y flota.' },
          ],
        },
      },
    ],
  },

  emotions: {
    nombrar: [
      {
        id: 'e_n1',
        title: 'Nombrando emociones',
        visual: {
          instruction: 'Mira la situación y nombra la emoción.',
          items: [
            { q: 'Recibiste un regalo que soñabas. ¿Cómo te sientes?', options: ['Contento', 'Triste', 'Enojado', 'Aburrido'], answer: 'Contento', explanation: 'Recibir algo deseado nos hace sentir felices.' },
            { q: 'Tu mejor amigo se muda lejos. ¿Qué sientes?', options: ['Tristeza', 'Alegría', 'Aburrimiento', 'Calma'], answer: 'Tristeza', explanation: 'Separarse de alguien querido da tristeza.' },
            { q: 'Alguien rompió tu juguete sin permiso. ¿Qué sientes?', options: ['Enojo', 'Felicidad', 'Sueño', 'Hambre'], answer: 'Enojo', explanation: 'Que rompan tus cosas puede dar enojo.' },
          ],
        },
      },
    ],
    regulacion: [
      {
        id: 'e_r1',
        title: 'Calmando mis emociones',
        visual: {
          instruction: 'Elige la mejor forma de calmarte.',
          items: [
            { q: 'Estás muy enojado. ¿Qué te ayuda?', options: ['Respirar profundo', 'Gritar a todos', 'Romper cosas', 'Pegar'], answer: 'Respirar profundo', explanation: 'Respirar profundo calma el cuerpo y la mente.' },
            { q: 'Te sientes nervioso antes de una prueba. ¿Qué haces?', options: ['Respirar y pensar positivo', 'Esconderte', 'Llorar', 'No ir'], answer: 'Respirar y pensar positivo', explanation: 'Respirar y confiar en ti ayuda a estar tranquilo.' },
            { q: 'Cuando estás triste, ¿qué te hace sentir mejor?', options: ['Hablar con alguien que te quiere', 'Quedarte solo siempre', 'Guardarlo todo', 'No contarlo'], answer: 'Hablar con alguien que te quiere', explanation: 'Compartir lo que sentimos nos hace sentir mejor.' },
          ],
        },
      },
    ],
    conflictos: [
      {
        id: 'e_c1',
        title: 'Resolviendo problemas juntos',
        visual: {
          instruction: 'Elige la mejor forma de resolver el conflicto.',
          items: [
            { q: 'Dos niños quieren el mismo juguete. ¿Qué es mejor?', options: ['Turnarse para jugar', 'Pelear por él', 'Romperlo', 'Esconderlo'], answer: 'Turnarse para jugar', explanation: 'Turnarse es justo y evita peleas.' },
            { q: 'Tu amigo te empujó sin querer. ¿Qué haces?', options: ['Decirle cómo te sentiste', 'Empujarlo más fuerte', 'Gritarle', 'Dejar de hablarle para siempre'], answer: 'Decirle cómo te sentiste', explanation: 'Hablar con calma resuelve mejor los problemas.' },
            { q: 'No estás de acuerdo con tu hermano. ¿Qué haces?', options: ['Hablar y buscar un acuerdo', 'Gritar más fuerte', 'Encerrarte', 'Llorar'], answer: 'Hablar y buscar un acuerdo', explanation: 'Dialogar ayuda a llegar a un acuerdo.' },
          ],
        },
      },
    ],
  },
};
