import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "favorite_lotes";

const loadFavorites = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => String(item)).filter(Boolean);
  } catch {
    return [];
  }
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore storage failures
    }
  }, [favorites]);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const isFavorite = useCallback((id: number | string) => favoriteSet.has(String(id)), [favoriteSet]);

  const toggleFavorite = useCallback((id: number | string) => {
    const key = String(id);
    setFavorites((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  }, []);

  return {
    favorites,
    favoriteSet,
    isFavorite,
    toggleFavorite,
    count: favorites.length,
  };
};
