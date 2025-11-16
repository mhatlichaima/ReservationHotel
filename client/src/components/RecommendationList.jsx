import React, { useState } from 'react';
import { useRecommendation } from '../context/RecommendationContext';

const RecommendationList = () => {
  const { recommendations, loading, error } = useRecommendation();
  const [sortBy, setSortBy] = useState('relevance');
  const [filterRating, setFilterRating] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 500]);

  if (loading) {
    return (
      <div className="recommendation-loading">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <div className="loading-content">
            <h3>Recherche des meilleures offres</h3>
            <p>Analyse de nos établissements partenaires...</p>
            <div className="loading-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <span>Optimisation en cours</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendation-error">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h3>Service temporairement indisponible</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button className="btn-primary" onClick={() => window.location.reload()}>
                🔄 Actualiser la page
              </button>
              <button className="btn-secondary">
                📞 Support technique
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="recommendation-empty">
        <div className="empty-container">
          <div className="empty-icon">🏨</div>
          <div className="empty-content">
            <h3>Aucun hôtel ne correspond à vos critères</h3>
            <p>Essayez d'élargir votre recherche ou modifiez vos préférences</p>
            <div className="empty-suggestions">
              <div className="suggestion-card">
                <span className="suggestion-icon">🎯</span>
                <span>Élargir la zone de recherche</span>
              </div>
              <div className="suggestion-card">
                <span className="suggestion-icon">💰</span>
                <span>Augmenter le budget</span>
              </div>
              <div className="suggestion-card">
                <span className="suggestion-icon">📅</span>
                <span>Changer les dates</span>
              </div>
            </div>
            <button className="btn-primary">
              ✏️ Modifier mes critères
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tri et filtrage
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'match':
        return b.similarity_score - a.similarity_score;
      case 'relevance':
      default:
        return (b.similarity_score * 0.6 + b.rating * 0.4) - (a.similarity_score * 0.6 + a.rating * 0.4);
    }
  });

  const filteredRecommendations = sortedRecommendations.filter(hotel => {
    const matchesRating = filterRating === 0 || Math.floor(hotel.rating) >= filterRating;
    const matchesPrice = hotel.price >= priceRange[0] && hotel.price <= priceRange[1];
    return matchesRating && matchesPrice;
  });

  const averagePrice = filteredRecommendations.reduce((sum, hotel) => sum + hotel.price, 0) / filteredRecommendations.length;
  const bestMatch = Math.max(...filteredRecommendations.map(hotel => hotel.similarity_score));

  return (
    <div className="recommendation-list">
      {/* Header avec métriques */}
      <div className="recommendation-header">
        <div className="header-content">
          <div className="header-main">
            <h1>Nos recommandations</h1>
            <p>
              {filteredRecommendations.length} établissement{filteredRecommendations.length > 1 ? 's' : ''} 
              trié{filteredRecommendations.length > 1 ? 's' : ''} sur {recommendations.length} possibilités
            </p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{Math.round(bestMatch * 100)}%</span>
              <span className="stat-label">Meilleur match</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{Math.round(averagePrice)}€</span>
              <span className="stat-label">Prix moyen</span>
            </div>
          </div>
        </div>

        {/* Contrôles avancés */}
        <div className="controls-bar">
          <div className="filters-section">
            <div className="filter-group">
              <label>Filtrer par :</label>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filterRating === 0 ? 'active' : ''}`}
                  onClick={() => setFilterRating(0)}
                >
                  Tous
                </button>
                {[4, 3].map(rating => (
                  <button
                    key={rating}
                    className={`filter-btn ${filterRating === rating ? 'active' : ''}`}
                    onClick={() => setFilterRating(filterRating === rating ? 0 : rating)}
                  >
                    {rating}⭐ et plus
                  </button>
                ))}
              </div>
            </div>
            
            <div className="filter-group">
              <label>Prix max : {priceRange[1]}€</label>
              <input
                type="range"
                min="0"
                max="500"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="price-slider"
              />
            </div>
          </div>
          
          <div className="sort-section">
            <label>Trier par :</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="relevance">Pertinence</option>
              <option value="match">Meilleur match</option>
              <option value="rating">Notes</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
          </div>
        </div>

        {/* Résumé des filtres */}
        <div className="filters-summary">
          <div className="active-filters">
            {filterRating > 0 && (
              <span className="active-filter-tag">
                {filterRating}+ étoiles
                <button onClick={() => setFilterRating(0)}>×</button>
              </span>
            )}
            {priceRange[1] < 500 && (
              <span className="active-filter-tag">
                Jusqu'à {priceRange[1]}€
                <button onClick={() => setPriceRange([0, 500])}>×</button>
              </span>
            )}
          </div>
          <div className="results-count">
            {filteredRecommendations.length} résultat{filteredRecommendations.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Grille des hôtels */}
      <div className="hotels-grid">
        {filteredRecommendations.map((hotel, index) => (
          <HotelCard key={hotel.hotel_id} hotel={hotel} index={index} />
        ))}
      </div>

      {/* Pagination améliorée */}
      {filteredRecommendations.length > 0 && (
        <div className="recommendation-footer">
          <div className="pagination">
            <div className="pagination-info">
              Affichage de 1 à {Math.min(filteredRecommendations.length, 12)} sur {filteredRecommendations.length}
            </div>
            <div className="pagination-controls">
              <button className="pagination-btn" disabled>
                ← Précédent
              </button>
              <div className="pagination-pages">
                <span className="page active">1</span>
                <span className="page">2</span>
                <span className="page">3</span>
                <span className="page-dots">...</span>
                <span className="page">5</span>
              </div>
              <button className="pagination-btn">
                Suivant →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant Carte Hôtel amélioré sans images
const HotelCard = ({ hotel, index }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const rankColors = {
    1: '#F59E0B', // Or
    2: '#6B7280', // Argent
    3: '#92400E', // Bronze
  };

  return (
    <div className={`hotel-card ${showDetails ? 'expanded' : ''}`}>
      {/* En-tête avec rang et favori */}
      <div className="hotel-card-header">
        <div 
          className="rank-badge"
          style={{ backgroundColor: rankColors[index + 1] || '#374151' }}
        >
          <span>#{index + 1}</span>
          <span className="rank-label">Recommandé</span>
        </div>
        
        <div className="header-actions">
          <div className="match-score">
            <div className="score-circle">
              <span className="score-value">{Math.round(hotel.similarity_score * 100)}%</span>
              <span className="score-label">Match</span>
            </div>
          </div>
          
          <button 
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={() => setIsFavorite(!isFavorite)}
            title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="hotel-card-content">
        {/* Informations principales */}
        <div className="hotel-main-info">
          <h3 className="hotel-name">{hotel.name}</h3>
          <div className="hotel-location">
            <span className="location-icon">📍</span>
            <span>{hotel.location}</span>
          </div>
          
          <div className="hotel-badges">
            <span className="badge eco-badge">🌱 Éco-responsable</span>
            <span className="badge wifi-badge">📶 WiFi gratuit</span>
            {hotel.features?.includes('breakfast') && (
              <span className="badge breakfast-badge">🍳 Petit-déj inclus</span>
            )}
          </div>
        </div>

        {/* Note et évaluations */}
        <div className="hotel-rating-section">
          <div className="rating-display">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`star ${i < Math.floor(hotel.rating) ? 'filled' : ''}`}
                >
                  {i < Math.floor(hotel.rating) ? '⭐' : '☆'}
                </span>
              ))}
            </div>
            <div className="rating-details">
              <span className="rating-value">{hotel.rating}/5</span>
              <span className="rating-count">({hotel.review_count || '50+'} avis)</span>
            </div>
          </div>
          
          <div className="rating-breakdown">
            <div className="rating-category">
              <span>Propreté</span>
              <div className="rating-bar">
                <div 
                  className="rating-fill" 
                  style={{ width: `${(hotel.cleanliness || 4.2) * 20}%` }}
                ></div>
              </div>
            </div>
            <div className="rating-category">
              <span>Service</span>
              <div className="rating-bar">
                <div 
                  className="rating-fill" 
                  style={{ width: `${(hotel.service || 4.5) * 20}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Équipements principaux */}
        <div className="hotel-features">
          <h4>Équipements inclus :</h4>
          <div className="features-grid">
            <span className="feature-item">🛏️ {hotel.room_type || 'Chambre standard'}</span>
            <span className="feature-item">🚿 Salle de bain privée</span>
            <span className="feature-item">📺 TV écran plat</span>
            <span className="feature-item">❄️ Climatisation</span>
            {hotel.features?.includes('pool') && (
              <span className="feature-item">🏊 Piscine</span>
            )}
            {hotel.features?.includes('spa') && (
              <span className="feature-item">💆 Spa</span>
            )}
          </div>
        </div>

        {/* Section prix et disponibilité */}
        <div className="hotel-pricing">
          <div className="price-info">
            <div className="price-display">
              <span className="price-amount">{hotel.price}€</span>
              <span className="price-period">/nuit</span>
            </div>
            <div className="price-details">
              <span className="tax-info">Taxes et frais inclus</span>
              <span className="cancellation">🎯 Annulation gratuite</span>
            </div>
          </div>
          
          <div className="availability-info">
            <span className="availability-badge">✅ Disponible</span>
            <span className="discount-badge">🔥 Offre limitée</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="hotel-card-actions">
        <button 
          className="btn-secondary"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '▲ Moins de détails' : '▼ Plus de détails'}
        </button>
      
      </div>

      {/* Détails supplémentaires */}
      {showDetails && (
        <div className="hotel-details-expanded">
          <div className="detail-section">
            <h4>Description</h4>
            <p>{hotel.description || 'Établissement confortable offrant un excellent rapport qualité-prix dans un emplacement privilégié.'}</p>
          </div>
          
          <div className="detail-section">
            <h4>Services supplémentaires</h4>
            <div className="services-list">
              <span className="service-item">🛄 Service de bagagerie</span>
              <span className="service-item">🧼 Nettoyage quotidien</span>
              <span className="service-item">🔐 Coffre-fort</span>
              <span className="service-item">💁 Service 24h/24</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationList;