import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Clock, Award, ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Play, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TypingSchoolScreenProps {
  onBackToHome: () => void;
  soundEffects: boolean;
  audioAssistance: boolean;
}

type SchoolStep = 'setup' | 'practicing' | 'results';
type PracticeMode = 'timed' | 'free';

export const TypingSchoolScreen: React.FC<TypingSchoolScreenProps> = ({
  onBackToHome,
  soundEffects,
  audioAssistance
}) => {
  const [step, setStep] = useState<SchoolStep>('setup');
  const [mode, setMode] = useState<PracticeMode>('timed');
  const [selectedDuration, setSelectedDuration] = useState<number>(60); // seconds: 30, 60, 120, 300, 600

  // Practice state
  const [text, setText] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [timerRemaining, setTimerRemaining] = useState<number>(60);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Results state
  const [finalStats, setFinalStats] = useState({
    wpm: 0,
    accuracy: 100,
    words: 0,
    characters: 0,
    mistakes: 0,
    timeSpent: '00:00'
  });

  const [statusAnnouncement, setStatusAnnouncement] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);

  const playerName = localStorage.getItem('wordarena_player_name') || 'Student';

  // Duration options
  const durationOptions = [
    { label: '30 seconds', value: 30 },
    { label: '1 minute', value: 60 },
    { label: '2 minutes', value: 120 },
    { label: '5 minutes', value: 300 },
    { label: '10 minutes', value: 600 }
  ];

  // Start practice session
  const handleStartPractice = (chosenMode: PracticeMode, duration: number) => {
    setMode(chosenMode);
    setSelectedDuration(duration);
    setTimerRemaining(duration);
    setText('');
    setStartTime(null);
    setElapsedSeconds(0);
    setMistakesCount(0);
    setIsStarted(false);
    setIsFinished(false);
    setStep('practicing');
    if (soundEffects) soundManager.play('turn');

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // Timer effect for timed mode
  useEffect(() => {
    let interval: any;
    if (step === 'practicing' && isStarted && !isFinished) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        if (mode === 'timed') {
          setTimerRemaining(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              finishPractice();
              return 0;
            }
            // Threshold announcements for timer
            if (prev === 30 || prev === 10 || prev === 5) {
              setStatusAnnouncement(`${prev} seconds remaining.`);
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, isStarted, isFinished, mode]);

  // Calculations
  const totalChars = text.length;
  const wordsList = text.trim() ? text.trim().split(/\s+/) : [];
  const wordCount = wordsList.length;

  const elapsedMinutes = Math.max(0.001, elapsedSeconds / 60);
  // Standard WPM = (typed characters / 5) / elapsed minutes
  const currentWpm = Math.round((totalChars / 5) / elapsedMinutes);
  
  // Accuracy = correct chars / total chars * 100
  const correctChars = Math.max(0, totalChars - mistakesCount);
  const currentAccuracy = totalChars === 0 ? 100 : Math.max(0, Math.min(100, Math.round((correctChars / totalChars) * 100)));

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    
    // Check if backspace was pressed (mistake indicator)
    if (newText.length < text.length) {
      setMistakesCount(prev => prev + 1);
    }

    if (!isStarted && newText.length > 0) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    setText(newText);
  };

  const finishPractice = () => {
    setIsFinished(true);
    if (soundEffects) soundManager.play('win');

    const finalTimeSpent = mode === 'timed' 
      ? formatTime(selectedDuration - timerRemaining) 
      : formatTime(elapsedSeconds);

    const stats = {
      wpm: currentWpm,
      accuracy: currentAccuracy,
      words: wordCount,
      characters: totalChars,
      mistakes: mistakesCount,
      timeSpent: finalTimeSpent
    };

    setFinalStats(stats);
    setStep('results');

    const summary = `Typing complete. Your speed is ${currentWpm} words per minute. Accuracy ${currentAccuracy} percent. ${wordCount} words. ${mistakesCount} mistakes.`;
    setStatusAnnouncement(summary);

    setTimeout(() => {
      resultsHeadingRef.current?.focus();
    }, 150);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcuts (F2, F3, Alt + Left)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + Left Arrow -> Back to menu with confirmation if text typed
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        handleBackAttempt();
        return;
      }

      // F2: Status
      if (e.key === 'F2') {
        e.preventDefault();
        e.stopPropagation();
        if (step === 'practicing') {
          const timeInfo = mode === 'timed' ? `${formatTime(timerRemaining)} remaining` : 'Free practice';
          const msg = `Typing School. ${currentWpm} words per minute. Accuracy ${currentAccuracy} percent. ${timeInfo}.`;
          setStatusAnnouncement(msg);
        } else if (step === 'results') {
          setStatusAnnouncement(`Typing Results. ${finalStats.wpm} words per minute. Accuracy ${finalStats.accuracy} percent. ${finalStats.words} words.`);
        } else {
          setStatusAnnouncement('Typing School setup. Choose Timed Practice or Free Practice.');
        }
        return;
      }

      // F3: Statistics
      if (e.key === 'F3') {
        e.preventDefault();
        e.stopPropagation();
        if (step === 'practicing') {
          const msg = `${currentWpm} words per minute. Accuracy ${currentAccuracy} percent. ${wordCount} words. ${mistakesCount} mistakes.`;
          setStatusAnnouncement(msg);
        } else {
          setStatusAnnouncement('Not currently practicing.');
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [step, mode, timerRemaining, currentWpm, currentAccuracy, wordCount, mistakesCount, finalStats]);

  const handleBackAttempt = () => {
    if (step === 'practicing' && text.trim().length > 0) {
      if (window.confirm('Leave practice? Your current practice will be lost.')) {
        onBackToHome();
      }
    } else {
      onBackToHome();
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-6 selection:bg-indigo-600 selection:text-white" role="main">
      {/* Screen reader live announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusAnnouncement}
      </div>

      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Keyboard className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Typing School
              <span className="text-xs font-medium px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                {playerName}
              </span>
            </h1>
            <p className="text-sm text-slate-400">Free typing practice & speed trainer</p>
          </div>
        </div>

        <button
          onClick={handleBackAttempt}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-400 cursor-pointer"
          aria-label="Back to Menu (Alt + Left Arrow)"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-400" />
          <span>Menu</span>
        </button>
      </header>

      {/* STEP 1: SETUP SCREEN */}
      {step === 'setup' && (
        <div className="max-w-2xl w-full mx-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white mb-2">Choose Your Practice Mode</h2>
            <p className="text-slate-400">Type anything you want — words, sentences, or stories!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setMode('timed')}
              className={`p-6 rounded-2xl border text-left transition-all flex flex-col gap-3 cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-400 ${
                mode === 'timed'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Clock className={`w-7 h-7 ${mode === 'timed' ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                  mode === 'timed' ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  Popular
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Timed Practice</h3>
                <p className="text-sm text-slate-400">Race against the clock and test your WPM speed.</p>
              </div>
            </button>

            <button
              onClick={() => setMode('free')}
              className={`p-6 rounded-2xl border text-left transition-all flex flex-col gap-3 cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-400 ${
                mode === 'free'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Sparkles className={`w-7 h-7 ${mode === 'free' ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                  mode === 'free' ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  Relaxed
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Free Practice</h3>
                <p className="text-sm text-slate-400">No time limit. Type at your own pace for as long as you want.</p>
              </div>
            </button>
          </div>

          {/* Time Selector for Timed Mode */}
          {mode === 'timed' && (
            <div className="flex flex-col gap-3 bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Select Practice Duration
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {durationOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedDuration(opt.value)}
                    className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-4 focus:ring-indigo-400 cursor-pointer ${
                      selectedDuration === opt.value
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => handleStartPractice(mode, selectedDuration)}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xl rounded-2xl shadow-xl transition-all focus:outline-none focus:ring-4 focus:ring-indigo-400 cursor-pointer flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6 fill-white" />
            Start Typing Practice
          </button>
        </div>
      )}

      {/* STEP 2: PRACTICING SCREEN */}
      {step === 'practicing' && (
        <div className="max-w-4xl w-full mx-auto flex flex-col gap-6">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
            <div className="flex flex-col items-center justify-center p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Time</span>
              <span className="text-2xl font-black text-indigo-400 font-mono">
                {mode === 'timed' ? formatTime(timerRemaining) : formatTime(elapsedSeconds)}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">WPM</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{currentWpm}</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Accuracy</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">{currentAccuracy}%</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Words</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{wordCount}</span>
            </div>

            <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Mistakes</span>
              <span className="text-2xl font-black text-rose-400 font-mono">{mistakesCount}</span>
            </div>
          </div>

          {/* Typing Area */}
          <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="typingSchoolTextarea" className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-indigo-400" />
                Type your words or sentences below (Free Practice):
              </label>
              <span className="text-xs text-slate-500">
                {mode === 'timed' ? `Timed Mode (${selectedDuration / 60}m)` : 'Free Mode (No Limit)'}
              </span>
            </div>

            <textarea
              id="typingSchoolTextarea"
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              placeholder="Start typing anything you like here... (e.g., My name is Jaisal. I like computers and learning new words.)"
              rows={10}
              className="w-full p-5 bg-slate-950 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500 text-lg leading-relaxed resize-y shadow-inner font-sans"
              aria-label="Typing Area for Typing School"
            />

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">F2</kbd> for status, <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">F3</kbd> for stats.</span>
              </div>

              <button
                onClick={finishPractice}
                className="py-3 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-xl shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-emerald-400 cursor-pointer flex items-center gap-2"
                aria-label="Finish Practice"
              >
                <CheckCircle className="w-5 h-5" />
                Finish Practice
              </button>
            </div>
          </div>

        </div>
      )}

      {/* STEP 3: RESULTS SCREEN */}
      {step === 'results' && (
        <div className="max-w-2xl w-full mx-auto bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center">
          <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400 mb-4">
            <Award className="w-12 h-12" />
          </div>

          <h2 
            ref={resultsHeadingRef}
            tabIndex={-1}
            className="text-3xl font-extrabold text-white mb-2 focus:outline-none"
          >
            Typing Results
          </h2>
          <p className="text-slate-400 mb-8">Great job practicing your typing, {playerName}!</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full mb-8">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Speed</span>
              <span className="text-3xl font-black text-emerald-400 font-mono">{finalStats.wpm}</span>
              <span className="text-xs text-slate-500 mt-1">WPM</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Accuracy</span>
              <span className="text-3xl font-black text-cyan-400 font-mono">{finalStats.accuracy}%</span>
              <span className="text-xs text-slate-500 mt-1">Correct</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Words</span>
              <span className="text-3xl font-black text-amber-400 font-mono">{finalStats.words}</span>
              <span className="text-xs text-slate-500 mt-1">Total words</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Characters</span>
              <span className="text-3xl font-black text-indigo-400 font-mono">{finalStats.characters}</span>
              <span className="text-xs text-slate-500 mt-1">Typed</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Mistakes</span>
              <span className="text-3xl font-black text-rose-400 font-mono">{finalStats.mistakes}</span>
              <span className="text-xs text-slate-500 mt-1">Corrections</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Time</span>
              <span className="text-2xl font-black text-purple-400 font-mono">{mode === 'free' ? 'No limit' : finalStats.timeSpent}</span>
              <span className="text-xs text-slate-500 mt-1">Duration</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={() => {
                setStep('setup');
                setText('');
              }}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg rounded-xl shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-indigo-400 cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Play Again
            </button>

            <button
              onClick={onBackToHome}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-lg rounded-xl border border-slate-700 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-400 cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
