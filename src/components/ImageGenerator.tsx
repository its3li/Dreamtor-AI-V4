import { Sparkles, Wand2, Settings, Lightbulb, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ImageSettings } from '../types';
import { modelOptions } from '../services/imageService';

interface ImageGeneratorProps {
  onGenerate: (prompt: string, model: string, settings: Partial<ImageSettings>) => Promise<void>;
  isGenerating: boolean;
  message: string;
}

// Add prompt suggestions
const promptSuggestions = [
  "A magical forest with glowing mushrooms",
  "A futuristic cityscape at sunset",
  "A cute robot making coffee",
  "An underwater palace with mermaids",
  "A steampunk flying machine"
];

export function ImageGenerator({ onGenerate, isGenerating, message }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState('balanced');
  const [aspectRatio, setAspectRatio] = useState<'square' | 'vertical' | 'horizontal'>('square');
  const [imageCount, setImageCount] = useState(2);
  const [useRandomSeed, setUseRandomSeed] = useState(true);
  const [seed, setSeed] = useState<number>(-1);
  const [showPromptSuggestions, setShowPromptSuggestions] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('promptHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  const aspectRatioOptions = [
    {
      value: 'square',
      label: 'Square',
      dimensions: '1024×1024',
      description: 'Perfect for social media posts'
    },
    {
      value: 'vertical',
      label: 'Vertical',
      dimensions: '1080×1920',
      description: 'Ideal for TikTok, Reels, and Stories'
    },
    {
      value: 'horizontal',
      label: 'Horizontal',
      dimensions: '1920×1080',
      description: 'Perfect for YouTube thumbnails and videos'
    }
  ] as const;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    // Save to history
    const newHistory = [prompt, ...promptHistory.slice(0, 9)];
    setPromptHistory(newHistory);
    localStorage.setItem('promptHistory', JSON.stringify(newHistory));
    
    onGenerate(prompt, selectedModel, {
      aspectRatio,
      imageCount,
      seed: useRandomSeed ? -1 : seed
    });
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative glass-morphism rounded-2xl sm:rounded-3xl overflow-hidden p-4 sm:p-6">
        <div className="relative">
          {/* Settings Button */}
          <div className="absolute -right-1 -top-1 sm:-right-2 sm:-top-2 z-10 flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 flex items-center justify-center transition-all duration-300"
              title="Prompt History"
            >
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300/70 hover:text-purple-300 transition-colors" />
            </button>
            <button
              onClick={() => setShowPromptSuggestions(!showPromptSuggestions)}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 flex items-center justify-center transition-all duration-300"
              title="Prompt Suggestions"
            >
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300/70 hover:text-purple-300 transition-colors" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 flex items-center justify-center transition-all duration-300"
              title="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300/70 hover:text-purple-300 transition-colors" />
            </button>
          </div>

          {/* Input Area */}
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-gray-900/30">
            <Sparkles className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-purple-300/70" />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!isGenerating && prompt.trim()) {
                    handleGenerate();
                  }
                }
              }}
              placeholder="Describe your image..."
              className="w-full bg-transparent text-white/90 placeholder-purple-300/50 py-3 sm:py-4 px-10 sm:px-12 focus:outline-none min-h-[100px] sm:min-h-[120px] text-sm sm:text-base resize-none"
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* Prompt Suggestions */}
        <AnimatePresence>
          {showPromptSuggestions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-2"
            >
              <div className="text-sm font-medium text-purple-300/70 mb-2">Try these prompts:</div>
              <div className="flex flex-wrap gap-2">
                {promptSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(suggestion)}
                    className="text-sm bg-purple-600/10 hover:bg-purple-600/20 text-white/80 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prompt History */}
        <AnimatePresence>
          {showHistory && promptHistory.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-2"
            >
              <div className="text-sm font-medium text-purple-300/70 mb-2">Recent prompts:</div>
              <div className="flex flex-col gap-2">
                {promptHistory.map((historyPrompt, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(historyPrompt)}
                    className="text-left text-sm bg-purple-600/10 hover:bg-purple-600/20 text-white/80 px-3 py-1.5 rounded-lg transition-colors truncate"
                  >
                    {historyPrompt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {/* Style Selection */}
              <div className="settings-section">
                <label className="block text-xs sm:text-sm font-medium text-purple-300/70 mb-2 sm:mb-3">
                  Style
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {modelOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedModel(option.id)}
                      className={`p-3 sm:p-4 rounded-xl text-left transition-all duration-300 ${
                        selectedModel === option.id
                          ? 'bg-purple-600/20 border border-purple-300/20'
                          : 'bg-gray-900/30 hover:bg-purple-600/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm sm:text-base text-white/90">{option.label}</div>
                          <div className="text-xs sm:text-sm text-purple-300/50">{option.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Selection */}
              <div className="settings-section">
                <label className="block text-xs sm:text-sm font-medium text-purple-300/70 mb-2 sm:mb-3">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {aspectRatioOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setAspectRatio(option.value)}
                      className={`p-3 sm:p-4 rounded-xl text-left transition-all duration-300 ${
                        aspectRatio === option.value
                          ? 'bg-purple-600/20 border border-purple-300/20'
                          : 'bg-gray-900/30 hover:bg-purple-600/10'
                      }`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div>
                          <div className="font-medium text-sm sm:text-base text-white/90">{option.label}</div>
                          <div className="text-xs sm:text-sm text-purple-300/50">{option.dimensions}</div>
                        </div>
                        <div className="text-xs sm:text-sm text-purple-300/50">{option.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="settings-section">
                <label className="block text-xs sm:text-sm font-medium text-purple-300/70 mb-2 sm:mb-3">
                  Advanced Settings
                </label>
                <div className="space-y-3 sm:space-y-4">
                  {/* Image Count */}
                  <div className="bg-gray-900/30 p-3 sm:p-4 rounded-xl">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Number of Images (1-4)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={imageCount}
                      onChange={(e) => setImageCount(Math.min(4, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-full bg-purple-900/20 border border-purple-500/20 rounded-lg px-3 py-2 text-sm sm:text-base text-white/90 focus:outline-none focus:border-purple-500/40"
                    />
                  </div>

                  {/* Seed Control */}
                  <div className="bg-gray-900/30 p-3 sm:p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-white/90">Random Seed</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useRandomSeed}
                          onChange={(e) => setUseRandomSeed(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-purple-900/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    {!useRandomSeed && (
                      <input
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                        className="w-full bg-purple-900/20 border border-purple-500/20 rounded-lg px-3 py-2 text-sm sm:text-base text-white/90 focus:outline-none focus:border-purple-500/40"
                        placeholder="Enter seed number"
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full mt-4 py-3 sm:py-4 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-white/90 font-medium flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base relative overflow-hidden"
        >
          {isGenerating ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-600/30 animate-pulse" />
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="relative">Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300/70" />
              <span>Generate Images</span>
            </>
          )}
        </button>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 sm:mt-4 text-xs sm:text-sm ${
              message.includes('Error') ? 'text-red-400' : 'text-green-400'
            }`}
          >
            {message}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}