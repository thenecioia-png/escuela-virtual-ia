import { useState } from 'react';
import { motion } from 'framer-motion';
import { Accessibility, Type, Contrast, Volume2, VolumeX, Image, Clock, Zap, Moon, Sun, Save, RotateCcw, Eye } from 'lucide-react';

export default function AccessibilitySettings({ profile, onUpdate, onClose }) {
  const [settings, setSettings] = useState(profile.accessibility || {});
  const [saved, setSaved] = useState(false);

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const updateValue = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    onUpdate(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetToRecommended = () => {
    const recs = profile.getRecommendedAdaptations ? profile.getRecommendedAdaptations() : [];
    const newSettings = { ...settings };
    recs.forEach((rec) => {
      if (rec.type === 'font' && rec.value === 'opendyslexic') newSettings.dyslexicFont = true;
      if (rec.type === 'spacing') newSettings.largeText = true;
      if (rec.type === 'pictograms') newSettings.showPictograms = true;
      if (rec.type === 'session_duration') newSettings.sessionDuration = rec.value;
      if (rec.type === 'movement_breaks') newSettings.breakFrequency = rec.value;
      if (rec.type === 'sensory_reduce') { newSettings.reduceMotion = true; newSettings.reduceSound = true; }
    });
    setSettings(newSettings);
    setSaved(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Accessibility size={22} className="text-forest-500" />
          <h2 className="text-xl font-black text-forest-900">Ajustes de accesibilidad</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-sm text-forest-500 hover:text-forest-700 font-bold">
            Cerrar
          </button>
        )}
      </div>

      {/* Visual */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <h3 className="font-bold text-forest-800 mb-3 flex items-center gap-2">
          <Eye size={16} className="text-sky-500" /> Visual
        </h3>
        <div className="space-y-3">
          <ToggleRow
            icon={Type}
            label="Texto grande"
            description="Aumenta el tamaño de letra en toda la app"
            active={settings.largeText}
            onToggle={() => toggle('largeText')}
          />
          <ToggleRow
            icon={Type}
            label="Fuente OpenDyslexic"
            description="Fuente especial para facilitar la lectura"
            active={settings.dyslexicFont}
            onToggle={() => toggle('dyslexicFont')}
          />
          <ToggleRow
            icon={Contrast}
            label="Alto contraste"
            description="Mayor diferencia entre colores de fondo y texto"
            active={settings.highContrast}
            onToggle={() => toggle('highContrast')}
          />
          <ToggleRow
            icon={Image}
            label="Pictogramas"
            description="Muestra iconos junto al texto"
            active={settings.showPictograms}
            onToggle={() => toggle('showPictograms')}
          />
          <ToggleRow
            icon={settings.reduceMotion ? Moon : Sun}
            label="Reducir animaciones"
            description="Menos movimiento en pantalla"
            active={settings.reduceMotion}
            onToggle={() => toggle('reduceMotion')}
          />
        </div>
      </div>

      {/* Audio */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <h3 className="font-bold text-forest-800 mb-3 flex items-center gap-2">
          <Volume2 size={16} className="text-violet-500" /> Audio
        </h3>
        <ToggleRow
          icon={settings.reduceSound ? VolumeX : Volume2}
          label="Modo silencioso"
          description="Sin efectos de sonido ni música"
          active={settings.reduceSound}
          onToggle={() => toggle('reduceSound')}
        />
      </div>

      {/* Ritmo */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <h3 className="font-bold text-forest-800 mb-3 flex items-center gap-2">
          <Clock size={16} className="text-amber-500" /> Ritmo y duración
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-forest-700 mb-2 block">
              Duración máxima de sesión: <span className="text-amber-600">{settings.sessionDuration || 15} min</span>
            </label>
            <input
              type="range"
              min={5}
              max={30}
              step={5}
              value={settings.sessionDuration || 15}
              onChange={(e) => updateValue('sessionDuration', parseInt(e.target.value))}
              className="w-full h-2 bg-forest-200 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs text-forest-400 mt-1">
              <span>5 min</span>
              <span>30 min</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-forest-700 mb-2 block">Frecuencia de descansos</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'often', label: 'Cada 5 min', desc: 'Movimiento' },
                { value: 'medium', label: 'Cada 10 min', desc: 'Estándar' },
                { value: 'rarely', label: 'Cada 15 min', desc: 'Largo' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateValue('breakFrequency', opt.value)}
                  className={`p-3 rounded-xl text-sm font-bold border-2 transition-all ${
                    settings.breakFrequency === opt.value
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-forest-600 border-forest-200 hover:border-amber-300'
                  }`}
                >
                  {opt.label}
                  <span className="block text-xs font-normal opacity-80">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-forest-700 mb-2 block">Ritmo de aprendizaje</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'self', label: 'A mi ritmo', desc: 'Sin presión' },
                { value: 'guided', label: 'Con guía', desc: 'Sugerencias' },
                { value: 'structured', label: 'Estructurado', desc: 'Pasos claros' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateValue('pacing', opt.value)}
                  className={`p-3 rounded-xl text-sm font-bold border-2 transition-all ${
                    settings.pacing === opt.value
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-forest-600 border-forest-200 hover:border-amber-300'
                  }`}
                >
                  {opt.label}
                  <span className="block text-xs font-normal opacity-80">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Refuerzo */}
      <div className="glass-card rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-forest-800 mb-3 flex items-center gap-2">
          <Zap size={16} className="text-sun-500" /> Tipo de refuerzo positivo
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'badges', label: 'Medallas y estrellas', emoji: '🏅' },
            { value: 'animations', label: 'Animaciones divertidas', emoji: '✨' },
            { value: 'voice', label: 'Voz de ánimo', emoji: '🗣️' },
            { value: 'simple', label: 'Mensaje sencillo', emoji: '💬' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateValue('positiveReinforcement', opt.value)}
              className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold border-2 transition-all ${
                settings.positiveReinforcement === opt.value
                  ? 'bg-sun-500 text-white border-sun-500'
                  : 'bg-white text-forest-600 border-forest-200 hover:border-sun-300'
              }`}
            >
              <span>{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={resetToRecommended}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-white text-forest-600 border-2 border-forest-200 hover:border-forest-400 transition-all"
        >
          <RotateCcw size={16} />
          Usar recomendaciones
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-forest-500 text-white hover:bg-forest-600 transition-all shadow-lg"
        >
          <Save size={16} />
          {saved ? '¡Guardado! ✅' : 'Guardar cambios'}
        </motion.button>
      </div>
    </div>
  );
}

function ToggleRow({ icon: Icon, label, description, active, onToggle }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${active ? 'bg-forest-500 text-white' : 'bg-forest-50 text-forest-500'}`}>
          <Icon size={16} />
        </div>
        <div>
          <p className="text-sm font-bold text-forest-800">{label}</p>
          <p className="text-xs text-forest-400">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-7 rounded-full transition-colors ${active ? 'bg-forest-500' : 'bg-forest-200'}`}
      >
        <motion.div
          animate={{ x: active ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}


