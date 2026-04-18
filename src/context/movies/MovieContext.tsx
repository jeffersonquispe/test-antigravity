/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useReducer, useEffect, useContext, ReactNode, useMemo } from 'react';
import type { TMDBMovie } from '../../types/tmdb.types';

// ==========================================
// 1. TIPOS DE ESTADO Y ACCIONES
// ==========================================

export type SwipeDirection = 'like' | 'dislike';

export interface HistoryItem {
  movie: TMDBMovie;
  direction: SwipeDirection;
  timestamp: number; // Para poder ordenar cronológicamente si hace falta
}

export interface MovieState {
  history: HistoryItem[];
}

export type MovieAction =
  | { type: 'SWIPE_RIGHT'; payload: TMDBMovie }
  | { type: 'SWIPE_LEFT'; payload: TMDBMovie }
  | { type: 'UNDO_LAST' }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'REHYDRATE'; payload: MovieState };

// ==========================================
// 2. REDUCER PURO
// ==========================================

const MAX_HISTORY = 50;
const INITIAL_STATE: MovieState = { history: [] };

export const movieReducer = (state: MovieState, action: MovieAction): MovieState => {
  switch (action.type) {
    case 'SWIPE_RIGHT':
    case 'SWIPE_LEFT': {
      const direction = action.type === 'SWIPE_RIGHT' ? 'like' : 'dislike';
      
      const newItem: HistoryItem = {
        movie: action.payload,
        direction,
        timestamp: Date.now()
      };

      // Inyectamos al inicio para facilitar el UNDO_LAST (el índice 0 es el más reciente)
      const newHistory = [newItem, ...state.history];
      
      // Control FIFO (First In, First Out) - descartamos el último (el más antiguo) si nos pasamos de 50
      if (newHistory.length > MAX_HISTORY) {
        newHistory.pop();
      }

      return { ...state, history: newHistory };
    }
    case 'UNDO_LAST': {
      if (state.history.length === 0) return state;
      // Quitamos el primer elemento (el más reciente)
      const restoredHistory = state.history.slice(1);
      return { ...state, history: restoredHistory };
    }
    case 'CLEAR_HISTORY': {
      return { ...state, history: [] };
    }
    case 'REHYDRATE': {
      return action.payload; // Sobrescribimos el estado con lo que vino de LocalStorage
    }
    default:
      return state;
  }
};

// ==========================================
// 3. CONTEXTOS (Separación Read/Write)
// ==========================================

/** Contexto exclusivo para lectura del historial. Evita re-renders en componentes que solo despachan acciones. */
const MovieStateContext = createContext<MovieState | undefined>(undefined);

/** Contexto exclusivo para métodos de acción. Componentes como botones pueden usar esto sin re-renderizarse cuando el estado cambie. */
const MovieDispatchContext = createContext<React.Dispatch<MovieAction> | undefined>(undefined);

// ==========================================
// 4. PROVIDER COMPONENT
// ==========================================

const LOCAL_STORAGE_KEY = 'cineswipe_history_v1';

export const MovieProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(movieReducer, INITIAL_STATE);

  // EFECTO: Rehidratación inicial en montaje previendo re-ejecución Segura en StrictMode de React 18
  useEffect(() => {
    try {
      const storedDataStr = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedDataStr) {
        const parsedState = JSON.parse(storedDataStr) as MovieState;
        dispatch({ type: 'REHYDRATE', payload: parsedState });
      }
    } catch (error) {
      console.warn('CineSwipe: Error al decodificar el historial de localStorage', error);
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Limpia datos corruptos preventivamente
    }
  }, []);

  // EFECTO: Sincronización a localStorage cada vez que todo el árbol derivado cambie
  useEffect(() => {
    // Para simplificar la persistencia, se escribe siempre.
    // Un debounce ayudaría en flujos rápidos.
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Memorización de valores exigida para escudar hijos complejos de re-renders no deseados
  const stateValue = useMemo(() => state, [state]);
  
  // Nota técnica: React asegura que 'dispatch' mantiene su identidad entre renders. 
  // Sin embargo, agregamos el useMemo tal y como demanda la arquitectura pedida explícitamente.
  const dispatchValue = useMemo(() => dispatch, [dispatch]);

  return (
    <MovieStateContext.Provider value={stateValue}>
      <MovieDispatchContext.Provider value={dispatchValue}>
        {children}
      </MovieDispatchContext.Provider>
    </MovieStateContext.Provider>
  );
};

// ==========================================
// 5. CUSTOM HOOKS DE ACCESO
// ==========================================

export function useMovieHistory() {
  const context = useContext(MovieStateContext);
  if (context === undefined) {
    throw new Error('useMovieHistory debe ser usado dentro de MovieProvider');
  }
  return context;
}

export function useMovieActions() {
  const context = useContext(MovieDispatchContext);
  if (context === undefined) {
    throw new Error('useMovieActions debe ser usado dentro de MovieProvider');
  }
  return context;
}
