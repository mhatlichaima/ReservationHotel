import React, { createContext, useContext, useReducer } from 'react';
import { recommendationService } from '../services/recommendationService';

const RecommendationContext = createContext();

const initialState = {
  recommendations: [],
  loading: false,
  error: null,
  preferences: {
    budget: 150,
    adults: 2,
    children: 0,
    trip_type: 'leisure',
    weekend_nights: 2,
    week_nights: 3,
    arrival_month: new Date().getMonth() + 1
  }
};

function recommendationReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'CLEAR_RECOMMENDATIONS':
      return { ...state, recommendations: [], error: null };
    default:
      return state;
  }
}

export function RecommendationProvider({ children }) {
  const [state, dispatch] = useReducer(recommendationReducer, initialState);

  const getRecommendations = async (preferences = null) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const prefsToUse = preferences || state.preferences;
      const result = await recommendationService.getRecommendations(prefsToUse);
      
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: result.data.recommendations });
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updatePreferences = (newPreferences) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: newPreferences });
  };

  const clearRecommendations = () => {
    dispatch({ type: 'CLEAR_RECOMMENDATIONS' });
  };

  const value = {
    ...state,
    getRecommendations,
    updatePreferences,
    clearRecommendations
  };

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
}

export const useRecommendation = () => {
  const context = useContext(RecommendationContext);
  if (!context) {
    throw new Error('useRecommendation must be used within a RecommendationProvider');
  }
  return context;
};