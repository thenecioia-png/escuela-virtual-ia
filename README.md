# 🦉 Escuela Virtual Inteligente

Una aplicación de aprendizaje adaptativo para niños y niñas, diseñada con **inteligencia artificial pedagógica**, **modelos de enseñanza diversos** y **adaptaciones para necesidades especiales**.

> **Cada niño aprende diferente.** Esta app lo sabe y se adapta.

## ✨ Características principales

### 🧠 Perfilado Cognitivo Completo
- **Evaluación interactiva de 3 fases** que "conoce" al niño/a
- Detección de **estilo de aprendizaje VARK** (Visual, Auditivo, Kinestésico, Lector)
- Identificación de **necesidades especiales** (dislexia, discalculia, TDAH, TEA)
- Evaluación de **ritmo de procesamiento** y **regulación emocional**
- Check-in emocional antes de cada sesión

### 📚 Múltiples Modelos Pedagógicos
- **Adaptativo IA**: El motor elige automáticamente el mejor método
- **Montessori**: Aprendizaje sensorial y autodirigido
- **Gamificación**: Misiones, niveles y recompensas
- **Multi-sensorial**: Ver, oír, tocar y moverse simultáneamente
- **Diseño Universal (UDL)**: Múltiples formas de presentar el mismo contenido
- **Aula Invertida**: Explorar primero, practicar después

### ♿ Adaptaciones de Accesibilidad
- **Fuente OpenDyslexic** para lectores con dislexia
- **Texto grande** y alto contraste
- **Pictogramas** como apoyo visual
- **Reducción de animaciones** y sonidos
- **Duración de sesiones personalizable** (5-30 min)
- **Descansos automáticos** según necesidad
- **Ritmo de aprendizaje** ajustable

### 🎯 Motor Adaptativo 2.0
- Ajusta dificultad en tiempo real según rendimiento
- Detecta frustración y cambia estrategia automáticamente
- Recomienda breaks basados en perfil de atención
- Mensajes de ánimo personalizados según estado emocional
- Prioriza áreas débiles y refuerza fortalezas

### 📊 Panel para Padres/Maestros
- Progreso detallado por materia
- **Perfil de aprendizaje completo** con necesidades identificadas
- **Adaptaciones activas** visibles y editables
- Historial emocional del niño/a
- Consejos personalizados para apoyar en casa

## 🚀 Tecnologías

- **React 19** + **Vite**
- **Tailwind CSS v4**
- **Framer Motion** para animaciones accesibles
- **Lucide React** para iconografía
- **OpenDyslexic** para fuente accesible
- Almacenamiento local (localStorage) para progreso offline

## 🛠️ Instalación y desarrollo

```bash
npm install
npm run dev
```

## 🏗️ Build para producción

```bash
npm run build
```

## 📁 Estructura del proyecto

```
src/
├── App.jsx                    # Flujo principal de la app
├── components/
│   ├── Layout.jsx             # Navegación y header
│   ├── Onboarding/
│   │   ├── Welcome.jsx        # Pantalla de bienvenida
│   │   ├── ProfileCreator.jsx # Crear perfil básico
│   │   └── NeedsAssessment.jsx # Evaluación de necesidades (NUEVO)
│   ├── Student/
│   │   ├── Dashboard.jsx      # Panel del estudiante
│   │   ├── LessonPlayer.jsx   # Reproductor de lecciones
│   │   ├── ProgressRing.jsx   # Anillo de progreso
│   │   ├── EmotionalCheckIn.jsx # Check-in emocional (NUEVO)
│   │   └── AccessibilitySettings.jsx # Ajustes accesibles (NUEVO)
│   └── Parent/
│       └── ParentDashboard.jsx # Panel para padres
├── data/
│   ├── lessons.js             # Lecciones con variantes VARK
│   └── subjects.js            # Materias y niveles
├── hooks/
│   ├── useStudentProfile.js   # Perfil extendido con necesidades
│   ├── useProgress.js         # Progreso y logros
│   └── useAdaptiveEngine.js   # Motor adaptativo 2.0
└── utils/
    └── storage.js             # Persistencia local
```

## 🧩 Materias disponibles

- 🔢 **Matemáticas**: Sumas, restas, multiplicación, fracciones, geometría, problemas
- 📖 **Lectura**: Sílabas, comprensión, inferencia
- ✏️ **Escritura**: Trazos, letras, palabras, oraciones
- 🧩 **Lógica**: Patrones, seriación, clasificación
- 🔬 **Ciencias**: Seres vivos, cuerpo humano, materia
- ❤️ **Emociones**: Identificación, empatía, regulación

## 🌈 Inclusión y accesibilidad

Esta app está diseñada pensando en que **todas las personas no aprenden igual**:

- Los niños con **dislexia** reciben fuente especial, más espaciado y apoyo auditivo
- Los niños con **discalculia** trabajan con manipulativos visuales y menos abstracción
- Los niños con **TDAH** tienen sesiones cortas, movimiento frecuente y recompensas inmediatas
- Los niños con **TEA** disfrutan de rutinas claras, pictogramas y predecibilidad
- Los niños con **procesamiento lento** tienen más tiempo y repeticiones
- Los niños con **regulación emocional intensa** reciben check-ins frecuentes y solo refuerzo positivo

## 📝 Nota importante

La evaluación de necesidades **no es un diagnóstico médico**. Es una herramienta pedagógica para adaptar la experiencia de aprendizaje. Si sospechas que tu hijo/a tiene una dificultad de aprendizaje, consulta con un profesional.

---

Hecho con 💚 para que cada niño y niña aprenda a su manera.
