import { useState, useEffect, useRef, useCallback } from 'react';
import type { Stats, HitState } from '@/types/typing';
import { keyFor } from '@/core/constants/curriculum';
import confetti from 'canvas-confetti';

interface UseTypingSessionOptions {
  text: string;
  timeLimit?: number;
  initialCorrection?: boolean;
  requireCompleteText?: boolean;
  onFinish?: (stats: Stats, weakKeys: Record<string, number>) => void;
  triggerKeySound?: () => void;
  triggerErrorSound?: () => void;
  triggerSuccessSound?: () => void;
}

// List of non-printable keys to explicitly ignore
const IGNORED_KEYS = new Set([
  'Shift',
  'Control',
  'Alt',
  'Meta',
  'CapsLock',
  'NumLock',
  'ScrollLock',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Insert',
  'Delete',
  'Pause',
  'PrintScreen',
  'ContextMenu',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
]);

export function useTypingSession({
  text,
  timeLimit,
  initialCorrection = false,
  requireCompleteText = true,
  onFinish,
  triggerKeySound,
  triggerErrorSound,
  triggerSuccessSound,
}: UseTypingSessionOptions) {
  const [typed, setTyped] = useState('');
  const [errors, setErrors] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [correction, setCorrection] = useState(initialCorrection);
  const [hit, setHit] = useState<HitState | null>(null);
  const [weakKeys, setWeakKeys] = useState<Record<string, number>>({});

  // Precise time management with pause accounting
  const [accumulatedMs, setAccumulatedMs] = useState(0);
  const [currentSegmentStart, setCurrentSegmentStart] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  const isFinishedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize state when text or initialCorrection prop changes without cascading effect renders
  const [prevText, setPrevText] = useState(text);
  if (prevText !== text) {
    setPrevText(text);
    setTyped('');
    setErrors(0);
    setKeystrokes(0);
    setIsStarted(false);
    setIsPaused(false);
    setIsDone(false);
    setHit(null);
    setWeakKeys({});
    setAccumulatedMs(0);
    setCurrentSegmentStart(null);
    setCorrection(initialCorrection);
  }

  const resetSession = useCallback(() => {
    setTyped('');
    setErrors(0);
    setKeystrokes(0);
    setIsStarted(false);
    setIsPaused(false);
    setIsDone(false);
    setHit(null);
    setWeakKeys({});
    setAccumulatedMs(0);
    setCurrentSegmentStart(null);
    isFinishedRef.current = false;
  }, []);

  // First wrong character position
  let firstWrong = -1;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] !== text[i]) {
      firstWrong = i;
      break;
    }
  }

  // Count unique characters correctly typed
  const correctCount = typed
    .split('')
    .reduce((acc, char, idx) => (char === text[idx] ? acc + 1 : acc), 0);

  // Calculate elapsed active seconds (excluding pause) using pure state value
  const currentRunningSegment =
    isStarted && !isPaused && currentSegmentStart !== null ? Math.max(0, now - currentSegmentStart) : 0;
  const totalActiveMs = accumulatedMs + currentRunningSegment;
  const elapsedSeconds = isStarted ? Math.max(0.1, totalActiveMs / 1000) : 0;

  // Real-time WPM, CPM, and Accuracy
  const elapsedMinutes = elapsedSeconds / 60;
  const wpm = elapsedMinutes >= 0.01 ? Math.round(correctCount / 5 / elapsedMinutes) : 0;
  const cpm = elapsedMinutes >= 0.01 ? Math.round(correctCount / elapsedMinutes) : 0;
  const accuracy =
    keystrokes > 0 ? Math.max(0, Math.round(((keystrokes - errors) / keystrokes) * 100)) : 100;

  // Finish session handler
  const finishSession = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsDone(true);
    setIsPaused(false);

    const finalStats: Stats = {
      wpm,
      cpm,
      accuracy,
      errors,
      correctChars: correctCount,
      keystrokes,
      seconds: Math.round(elapsedSeconds),
    };

    if (triggerSuccessSound) {
      triggerSuccessSound();
    }

    try {
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.7 },
      });
    } catch {
      // Ignore if canvas is not available
    }

    if (onFinish) {
      onFinish(finalStats, weakKeys);
    }
  }, [wpm, cpm, accuracy, errors, correctCount, keystrokes, elapsedSeconds, weakKeys, onFinish, triggerSuccessSound]);

  // Timer ticker (runs only while active and not paused)
  useEffect(() => {
    if (!isStarted || isPaused || isDone) return;
    const interval = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(interval);
  }, [isStarted, isPaused, isDone]);

  // Check time limit
  useEffect(() => {
    if (timeLimit && elapsedSeconds >= timeLimit && !isDone && isStarted) {
      // Rule: "Jangan menganggap latihan selesai hanya karena timer habis jika masih ada teks yang belum diketik."
      if (!requireCompleteText) {
        finishSession();
      }
    }
  }, [elapsedSeconds, timeLimit, isDone, isStarted, requireCompleteText, finishSession]);

  // Check completion by text
  useEffect(() => {
    if (text.length > 0 && typed.length >= text.length && !isDone) {
      // In strict correction mode, text is complete only if there are no errors
      if (correction) {
        if (firstWrong === -1) {
          finishSession();
        }
      } else {
        // In permissive mode, text is complete when user typed up to text length
        finishSession();
      }
    }
  }, [typed, text, isDone, correction, firstWrong, finishSession]);

  // Clear hit effect
  useEffect(() => {
    if (!hit) return;
    const timeout = setTimeout(() => setHit(null), 350);
    return () => clearTimeout(timeout);
  }, [hit]);

  // Controls: Start, Pause, Resume, Toggle Pause, Toggle Correction
  const startSession = useCallback(() => {
    if (isStarted) return;
    const startTs = Date.now();
    setIsStarted(true);
    setIsPaused(false);
    setCurrentSegmentStart(startTs);
    setNow(startTs);
    if (inputRef.current) inputRef.current.focus();
  }, [isStarted]);

  const pauseSession = useCallback(() => {
    if (!isStarted || isPaused || isDone) return;
    setIsPaused(true);
    if (currentSegmentStart !== null) {
      setAccumulatedMs((prev) => prev + (Date.now() - currentSegmentStart));
      setCurrentSegmentStart(null);
    }
  }, [isStarted, isPaused, isDone, currentSegmentStart]);

  const resumeSession = useCallback(() => {
    if (!isStarted || !isPaused || isDone) return;
    const resumeTs = Date.now();
    setIsPaused(false);
    setCurrentSegmentStart(resumeTs);
    setNow(resumeTs);
    if (inputRef.current) inputRef.current.focus();
  }, [isStarted, isPaused, isDone]);

  const togglePause = useCallback(() => {
    if (!isStarted) {
      startSession();
    } else if (isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
  }, [isStarted, isPaused, startSession, resumeSession, pauseSession]);

  const toggleCorrection = useCallback(() => {
    setCorrection((prev) => !prev);
  }, []);

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if session is completed
      if (isDone) return;

      // Handle Escape to toggle pause
      if (e.key === 'Escape') {
        e.preventDefault();
        togglePause();
        return;
      }

      // Prevent Tab from shifting focus away from the typing exercise
      if (e.key === 'Tab') {
        e.preventDefault();
        return;
      }

      // Ignore shortcuts with Ctrl / Cmd / Alt
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Ignore IME composition
      if (e.isComposing) return;

      // Ignore non-relevant keys (Function keys, Arrows, Navigation, CapsLock, etc.)
      if (IGNORED_KEYS.has(e.key)) return;

      // Prevent accidental repeated events when key is held down (except Backspace for deleting mistakes)
      if (e.repeat && e.key !== 'Backspace') {
        e.preventDefault();
        return;
      }

      // If paused, ignore typing unless Space, Enter, or Escape is pressed to resume
      if (isPaused) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault();
          resumeSession();
        }
        return;
      }

      // Maintain input focus stability
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (typed.length === 0) return;

        setHit({ key: 'Backspace', ok: true, timestamp: Date.now(), expected: 'Backspace' });
        setTyped((prev) => prev.slice(0, -1));
        if (triggerKeySound) triggerKeySound();
        return;
      }

      // Convert Enter to newline
      const inputChar = e.key === 'Enter' ? '\n' : e.key;

      // Only accept single printable characters
      if (inputChar.length !== 1) return;

      // Prevent default page scroll on Space
      e.preventDefault();

      // Start session automatically on first valid keystroke
      if (!isStarted) {
        setIsStarted(true);
        setCurrentSegmentStart(Date.now());
      }

      // If already at end of text, do not accept further characters
      if (typed.length >= text.length) return;

      const physicalKey = keyFor(inputChar).key;
      const expectedChar = text[typed.length];

      // Handle Strict Correction Mode (Wajib Koreksi)
      if (correction && firstWrong !== -1) {
        // User must Backspace to fix existing error before typing further
        setErrors((prev) => prev + 1);
        setKeystrokes((prev) => prev + 1);
        setHit({ key: physicalKey, ok: false, timestamp: Date.now(), expected: expectedChar });
        if (triggerErrorSound) triggerErrorSound();
        return;
      }

      const isMatch = inputChar === expectedChar;
      setKeystrokes((prev) => prev + 1);

      if (isMatch) {
        setHit({ key: physicalKey, ok: true, timestamp: Date.now(), expected: expectedChar });
        setTyped((prev) => prev + inputChar);
        if (triggerKeySound) triggerKeySound();
      } else {
        setErrors((prev) => prev + 1);
        setHit({ key: physicalKey, ok: false, timestamp: Date.now(), expected: expectedChar });
        if (triggerErrorSound) triggerErrorSound();

        // Track weak keys
        if (expectedChar) {
          setWeakKeys((prev) => ({
            ...prev,
            [expectedChar]: (prev[expectedChar] || 0) + 1,
          }));
        }

        // Always append character so user sees the mistake in the text display
        setTyped((prev) => prev + inputChar);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    typed,
    text,
    isStarted,
    isPaused,
    isDone,
    correction,
    firstWrong,
    resumeSession,
    togglePause,
    triggerKeySound,
    triggerErrorSound,
  ]);

  const progress = timeLimit && !requireCompleteText
    ? Math.min(100, (elapsedSeconds / timeLimit) * 100)
    : Math.min(100, (correctCount / text.length) * 100);

  const nextRequiredKey =
    firstWrong !== -1 && correction ? 'Backspace' : text[typed.length] ?? '';

  return {
    typed,
    firstWrong,
    wpm,
    cpm,
    accuracy,
    errors,
    correctCount,
    keystrokes,
    elapsedSeconds,
    progress,
    nextRequiredKey,
    hit,
    isDone,
    isStarted,
    isPaused,
    correction,
    weakKeys,
    inputRef,
    startSession,
    pauseSession,
    resumeSession,
    togglePause,
    resetSession,
    finishSession,
    toggleCorrection,
    setCorrection,
    focusInput,
  };
}
