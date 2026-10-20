import { useState, useEffect, useCallback } from 'react';
import type { Result } from '@/types/typing';
import type { PassCriteria } from '@/types/curriculum';
import {
  loadResults,
  saveResult as persistResult,
  loadPassCriteria,
  savePassCriteria,
  resetPassCriteria,
  unlockedLevels as calcUnlockedLevels,
  passedIds as calcPassedIds,
  stars as calcStars,
  isPassed as checkIsPassed,
} from '@/core/storage/progressStorage';

export function useUserProgress() {
  const [results, setResults] = useState<Result[]>(() => loadResults());
  const [criteria, setCriteria] = useState<Record<number, PassCriteria>>(loadPassCriteria);

  const refresh = useCallback(() => {
    setResults(loadResults());
    setCriteria(loadPassCriteria());
  }, []);

  useEffect(() => {
    const handleUpdate = () => refresh();
    window.addEventListener('ketikpro-progress-update', handleUpdate);
    window.addEventListener('ketikpro-criteria-update', handleUpdate);
    return () => {
      window.removeEventListener('ketikpro-progress-update', handleUpdate);
      window.removeEventListener('ketikpro-criteria-update', handleUpdate);
    };
  }, [refresh]);

  const saveSessionResult = useCallback((res: Result) => {
    persistResult(res);
  }, []);

  const updateCriteria = useCallback((newCriteria: Record<number, PassCriteria>) => {
    savePassCriteria(newCriteria);
    setCriteria(newCriteria);
  }, []);

  const handleResetCriteria = useCallback(() => {
    resetPassCriteria();
    setCriteria(loadPassCriteria());
  }, []);

  const unlocked = calcUnlockedLevels(results, criteria);
  const passed = calcPassedIds(results, criteria);

  const checkResultPassed = useCallback(
    (r: Result) => checkIsPassed(r, criteria),
    [criteria]
  );

  const getBestStars = useCallback(
    (lessonId: string): number => {
      const lessonResults = results.filter((r) => r.lessonId === lessonId);
      if (lessonResults.length === 0) return -1;
      return lessonResults.reduce((max, r) => Math.max(max, calcStars(r.accuracy, r.wpm)), 0);
    },
    [results]
  );

  return {
    results,
    criteria,
    unlocked,
    passed,
    saveSessionResult,
    updateCriteria,
    resetCriteria: handleResetCriteria,
    getBestStars,
    isPassed: checkResultPassed,
    stars: calcStars,
    refresh,
  };
}
