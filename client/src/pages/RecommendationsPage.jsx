import React, { useState, useEffect } from 'react';
import RecommendationForm from '../components/RecommendationForm';
import RecommendationList from '../components/RecommendationList';
import { useRecommendation } from '../context/RecommendationContext';
import '../App.css';

const RecommendationsPage = () => {
  const { recommendations, loading, error } = useRecommendation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Gestion du bouton de retour en haut
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToResults = () => {
    const resultsSection = document.querySelector('.main-section');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="recommendations-page">
      {/* Hero Section Améliorée */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">🤖</span>
            <span className="badge-text">Recommandations Intelligentes</span>
          </div>
          
          <div className="hero-text">
            <h1 className="hero-title">
              Découvrez l'hôtel
              <span className="highlight"> idéal</span>
              <br />
              pour votre séjour
            </h1>
            
            <p className="hero-description">
              Notre intelligence artificielle analyse vos préférences uniques pour vous 
              recommander les établissements parfaitement adaptés à vos besoins et à votre budget.
            </p>
          </div>

          {/* Statistiques en temps réel */}
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Hôtels analysés</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Satisfaction clients</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24h/24</div>
              <div className="stat-label">Disponible</div>
            </div>
          </div>

          {/* Call-to-action animé */}
          <div className="hero-cta">
            <button 
              className="cta-button primary"
              onClick={scrollToResults}
            >
              <span className="cta-icon">🎯</span>
              Commencer ma recherche
              <span className="cta-arrow">→</span>
            </button>
            
            <button className="cta-button secondary">
              <span className="cta-icon">⭐</span>
              Voir les tendances
            </button>
          </div>

          {/* Indicateur de défilement */}
          <div className="scroll-indicator">
            <div className="scroll-arrow"></div>
            <span>Explorer les recommandations</span>
          </div>
        </div>
      </section>

      {/* Main Content Amélioré */}
      <section className="main-section">
        <div className="container">
          {/* En-tête des résultats */}
          <div className="results-header">
            <div className="header-content">
              <h2 className="section-title">
                {loading ? (
                  'Recherche en cours...'
                ) : recommendations.length > 0 ? (
                  <>
                    <span className="results-count">{recommendations.length}</span>
                    {recommendations.length === 1 ? ' recommandation trouvée' : ' recommandations trouvées'}
                  </>
                ) : (
                  'Nos recommandations'
                )}
              </h2>
              
              <p className="section-subtitle">
                {recommendations.length > 0 
                  ? 'Voici les établissements qui correspondent le mieux à vos critères'
                  : 'Remplissez le formulaire pour découvrir des hôtels parfaits pour vous'
                }
              </p>
            </div>

            {/* Filtres rapides */}
            {recommendations.length > 0 && (
              <div className="quick-filters">
                <div className="filter-group">
                  <span className="filter-label">Trier par :</span>
                  <select className="filter-select">
                    <option>Pertinence</option>
                    <option>Prix croissant</option>
                    <option>Prix décroissant</option>
                    <option>Meilleures notes</option>
                  </select>
                </div>
                
                <div className="results-badge">
                  <span className="badge-count">{recommendations.length}</span>
                  <span>résultats</span>
                </div>
              </div>
            )}
          </div>

          <div className="content-grid">
            {/* Sidebar Améliorée */}
            <aside className="sidebar">
              <div className="sidebar-sticky">
                <div className="sidebar-header">
                  <h3 className="sidebar-title">Vos critères</h3>
                  <div className="sidebar-subtitle">Personnalisez votre recherche</div>
                </div>
                
                <RecommendationForm />
                
                {/* Informations utiles */}
                <div className="sidebar-info">
                  <div className="info-card">
                    <div className="info-icon">💡</div>
                    <div className="info-content">
                      <h4>Conseil du jour</h4>
                      <p>Réservez 2-3 semaines à l'avance pour obtenir les meilleurs prix !</p>
                    </div>
                  </div>
                  
                  <div className="info-card">
                    <div className="info-icon">🌍</div>
                    <div className="info-content">
                      <h4>Éco-responsable</h4>
                      <p>Nous favorisons les établissements engagés dans le tourisme durable</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
            
            {/* Main Content Amélioré */}
            <main className="main-content">
              {error && (
                <div className="error-banner">
                  <div className="error-icon">⚠️</div>
                  <div className="error-content">
                    <h4>Oups ! Une erreur est survenue</h4>
                    <p>{error}</p>
                  </div>
                  <button className="retry-button">Réessayer</button>
                </div>
              )}
              
              <RecommendationList />
              
              {/* Pagination ou chargement supplémentaire */}
              {recommendations.length > 0 && (
                <div className="load-more-section">
                  <button className="load-more-button">
                    <span>Charger plus de résultats</span>
                    <span className="load-icon">↻</span>
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Bouton de retour en haut */}
      {showScrollTop && (
        <button className="scroll-top-button" onClick={scrollToTop}>
          <span className="scroll-icon">↑</span>
        </button>
      )}

      {/* Footer de la page */}
      <section className="page-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Besoin d'aide ?</h4>
              <p>Notre équipe est disponible 24h/24 pour vous accompagner</p>
              <button className="help-button">
                <span>💬</span>
                Contactez-nous
              </button>
            </div>
            
            <div className="footer-section">
              <h4>Garantie satisfaction</h4>
              <p>Nous nous engageons à trouver l'hôtel parfait pour vous</p>
              <div className="guarantee-badge">✅ Garantie 48h</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RecommendationsPage;