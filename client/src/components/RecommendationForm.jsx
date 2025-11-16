import React, { useState } from 'react';
import { useRecommendation } from '../context/RecommendationContext';

const RecommendationForm = () => {
  const { preferences, updatePreferences, getRecommendations, loading } = useRecommendation();
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [activeSection, setActiveSection] = useState('budget');

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setLocalPreferences(prev => ({
      ...prev,
      [name]: type === 'radio' ? value : Number(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    updatePreferences(localPreferences);
    await getRecommendations(localPreferences);
    
    const resultsSection = document.querySelector('.recommendation-list');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const increment = (field) => {
    setLocalPreferences(prev => ({
      ...prev,
      [field]: Math.min(field === 'budget' ? 1000 : 10, prev[field] + (field === 'budget' ? 10 : 1))
    }));
  };

  const decrement = (field) => {
    setLocalPreferences(prev => ({
      ...prev,
      [field]: Math.max(
        field === 'budget' ? 50 : field === 'adults' ? 1 : 0, 
        prev[field] - (field === 'budget' ? 10 : 1)
      )
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const sections = [
    { id: 'budget', label: 'Budget' },
    { id: 'travelers', label: 'Voyageurs' },
    { id: 'duration', label: 'Durée' },
    { id: 'type', label: 'Type' },
    { id: 'period', label: 'Période' }
  ];

  const monthOptions = [
    { value: '1', label: 'Janvier - Hiver' },
    { value: '2', label: 'Février - Hiver' },
    { value: '3', label: 'Mars - Printemps' },
    { value: '4', label: 'Avril - Printemps' },
    { value: '5', label: 'Mai - Printemps' },
    { value: '6', label: 'Juin - Été' },
    { value: '7', label: 'Juillet - Été' },
    { value: '8', label: 'Août - Été' },
    { value: '9', label: 'Septembre - Automne' },
    { value: '10', label: 'Octobre - Automne' },
    { value: '11', label: 'Novembre - Automne' },
    { value: '12', label: 'Décembre - Hiver' }
  ];

  return (
    <div className="recommendation-form">
      <div className="form-header">
        <div className="header-content">
          <div className="header-text">
            <h2>Critères de recherche</h2>
            <p>Personnalisez votre recherche d'hôtel</p>
          </div>
        </div>
        <div className="form-progress">
          <div className="progress-steps">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`progress-step ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="step-label">{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="enhanced-form">
        {/* Section Budget */}
        <div className={`form-section ${activeSection === 'budget' ? 'active' : ''}`}>
          <div className="section-header">
            <div className="section-info">
              <h3>Budget par nuit</h3>
              <p>Définissez votre fourchette de prix idéale</p>
            </div>
          </div>
          
          <div className="budget-section">
            <div className="budget-display-card">
              <div className="budget-amount">
                <span className="amount">{formatPrice(localPreferences.budget)}</span>
                <span className="currency">€</span>
              </div>
              <div className="budget-period">par nuit</div>
            </div>
            
            <div className="budget-slider-container">
              <input
                type="range"
                name="budget"
                min="50"
                max="500"
                step="10"
                value={localPreferences.budget}
                onChange={handleChange}
                className="budget-slider"
              />
              <div className="slider-labels">
                <span>50€</span>
                <span>Économique</span>
                <span>250€</span>
                <span>Confort</span>
                <span>500€</span>
                <span>Luxe</span>
              </div>
            </div>
            
            <div className="budget-quick-actions">
              <button type="button" className="quick-budget" onClick={() => setLocalPreferences(prev => ({...prev, budget: 100}))}>
                100€
              </button>
              <button type="button" className="quick-budget" onClick={() => setLocalPreferences(prev => ({...prev, budget: 200}))}>
                200€
              </button>
              <button type="button" className="quick-budget" onClick={() => setLocalPreferences(prev => ({...prev, budget: 350}))}>
                350€
              </button>
            </div>
          </div>
        </div>

        {/* Section Voyageurs */}
        <div className={`form-section ${activeSection === 'travelers' ? 'active' : ''}`}>
          <div className="section-header">
            <div className="section-info">
              <h3>Composition du groupe</h3>
              <p>Nombre de voyageurs</p>
            </div>
          </div>
          
          <div className="travelers-section">
            <div className="traveler-counters">
              <div className="traveler-counter">
                <div className="counter-header">
                  <span className="counter-label">Adultes</span>
                </div>
                <div className="counter-controls">
                  <button 
                    type="button"
                    className="counter-btn"
                    onClick={() => decrement('adults')}
                    disabled={localPreferences.adults <= 1}
                  >
                    −
                  </button>
                  <span className="counter-value">{localPreferences.adults}</span>
                  <button 
                    type="button"
                    className="counter-btn"
                    onClick={() => increment('adults')}
                    disabled={localPreferences.adults >= 10}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="traveler-counter">
                <div className="counter-header">
                  <span className="counter-label">Enfants</span>
                </div>
                <div className="counter-controls">
                  <button 
                    type="button"
                    className="counter-btn"
                    onClick={() => decrement('children')}
                    disabled={localPreferences.children <= 0}
                  >
                    −
                  </button>
                  <span className="counter-value">{localPreferences.children}</span>
                  <button 
                    type="button"
                    className="counter-btn"
                    onClick={() => increment('children')}
                    disabled={localPreferences.children >= 10}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            <div className="traveler-summary">
              <div className="traveler-total">
                <span className="total-label">Total voyageurs:</span>
                <span className="total-value">{localPreferences.adults + localPreferences.children}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Durée */}
        <div className={`form-section ${activeSection === 'duration' ? 'active' : ''}`}>
          <div className="section-header">
            <div className="section-info">
              <h3>Durée du séjour</h3>
              <p>Combien de nuits souhaitez-vous rester ?</p>
            </div>
          </div>
          
          <div className="duration-section">
            <div className="duration-cards">
              <div className="duration-card">
                <div className="card-header">
                  <span className="card-label">Semaine</span>
                </div>
                <div className="card-controls">
                  <button 
                    type="button"
                    className="duration-btn"
                    onClick={() => setLocalPreferences(prev => ({...prev, week_nights: Math.max(0, prev.week_nights - 1)}))}
                  >
                    −
                  </button>
                  <div className="duration-value">
                    <input
                      type="number"
                      name="week_nights"
                      value={localPreferences.week_nights}
                      onChange={handleChange}
                      min="0"
                      max="30"
                      className="duration-input"
                    />
                    <span className="duration-unit">nuits</span>
                  </div>
                  <button 
                    type="button"
                    className="duration-btn"
                    onClick={() => setLocalPreferences(prev => ({...prev, week_nights: prev.week_nights + 1}))}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="duration-card">
                <div className="card-header">
                  <span className="card-label">Weekend</span>
                </div>
                <div className="card-controls">
                  <button 
                    type="button"
                    className="duration-btn"
                    onClick={() => setLocalPreferences(prev => ({...prev, weekend_nights: Math.max(0, prev.weekend_nights - 1)}))}
                  >
                    −
                  </button>
                  <div className="duration-value">
                    <input
                      type="number"
                      name="weekend_nights"
                      value={localPreferences.weekend_nights}
                      onChange={handleChange}
                      min="0"
                      max="30"
                      className="duration-input"
                    />
                    <span className="duration-unit">nuits</span>
                  </div>
                  <button 
                    type="button"
                    className="duration-btn"
                    onClick={() => setLocalPreferences(prev => ({...prev, weekend_nights: prev.weekend_nights + 1}))}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            <div className="duration-summary">
              <div className="total-nights">
                <span className="total-label">Total:</span>
                <span className="total-value">{localPreferences.week_nights + localPreferences.weekend_nights} nuits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Type de voyage */}
        <div className={`form-section ${activeSection === 'type' ? 'active' : ''}`}>
          <div className="section-header">
            <div className="section-info">
              <h3>Type de voyage</h3>
              <p>Sélectionnez le motif principal de votre séjour</p>
            </div>
          </div>
          
          <div className="trip-type-section">
            <div className="trip-options">
              <label className="trip-option-card">
                <input
                  type="radio"
                  name="trip_type"
                  value="leisure"
                  checked={localPreferences.trip_type === 'leisure'}
                  onChange={handleChange}
                />
                <div className="card-content">
                  <div className="card-text">
                    <span className="card-title">Loisirs</span>
                    <span className="card-desc">Vacances & détente</span>
                  </div>
                  <div className="card-check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </label>
              
              <label className="trip-option-card">
                <input
                  type="radio"
                  name="trip_type"
                  value="business"
                  checked={localPreferences.trip_type === 'business'}
                  onChange={handleChange}
                />
                <div className="card-content">
                  <div className="card-text">
                    <span className="card-title">Affaires</span>
                    <span className="card-desc">Travail & réunions</span>
                  </div>
                  <div className="card-check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </label>
              
              <label className="trip-option-card">
                <input
                  type="radio"
                  name="trip_type"
                  value="family"
                  checked={localPreferences.trip_type === 'family'}
                  onChange={handleChange}
                />
                <div className="card-content">
                  <div className="card-text">
                    <span className="card-title">Famille</span>
                    <span className="card-desc">Enfants & activités</span>
                  </div>
                  <div className="card-check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </label>
              
              <label className="trip-option-card">
                <input
                  type="radio"
                  name="trip_type"
                  value="couple"
                  checked={localPreferences.trip_type === 'couple'}
                  onChange={handleChange}
                />
                <div className="card-content">
                  <div className="card-text">
                    <span className="card-title">Romantique</span>
                    <span className="card-desc">Weekend en amoureux</span>
                  </div>
                  <div className="card-check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Section Période */}
        <div className={`form-section ${activeSection === 'period' ? 'active' : ''}`}>
          <div className="section-header">
            <div className="section-info">
              <h3>Période de voyage</h3>
              <p>Quand souhaitez-vous partir ?</p>
            </div>
          </div>
          
          <div className="period-section">
            <div className="month-selector">
              <label htmlFor="arrival_month" className="select-label">Mois d'arrivée</label>
              <select
                id="arrival_month"
                name="arrival_month"
                value={localPreferences.arrival_month}
                onChange={handleChange}
                className="month-select"
              >
                {monthOptions.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="season-info">
              <div className="season-card">
                <div className="season-details">
                  <span className="season-name">Saison recommandée</span>
                  <span className="season-period">Mai à Septembre</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions du formulaire */}
        <div className="form-actions">
          <button 
            type="button"
            className="action-btn secondary"
            onClick={() => setLocalPreferences(preferences)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Réinitialiser
          </button>
          
          <button 
            type="submit" 
            disabled={loading}
            className="submit-btn primary"
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                <span>Recherche en cours...</span>
              </>
            ) : (
              <>
                <span>Trouver mes hôtels</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecommendationForm;