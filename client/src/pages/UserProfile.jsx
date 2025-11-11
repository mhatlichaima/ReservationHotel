// src/pages/UserProfile.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';

// Composants de visualisation
const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <div className={`flex items-center mt-1 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span className={trend.isPositive ? 'text-green-500' : 'text-red-500'}>
              {trend.isPositive ? '↗' : '↘'}
            </span>
            <span className="ml-1">{trend.value}</span>
            <span className="text-gray-500 ml-1">{subtitle}</span>
          </div>
        )}
        {!trend && subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        {icon}
      </div>
    </div>
  </div>
);

const ProgressBar = ({ percentage, color, label }) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm text-gray-600 mb-1">
      <span>{label}</span>
      <span>{percentage}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${color}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

const ActivityChart = ({ data, period }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Activité {period}</h3>
        <span className="text-sm text-gray-500">Visites</span>
      </div>
      <div className="flex items-end justify-between h-32">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 mx-1">
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-600 hover:to-blue-500 cursor-pointer"
              style={{ height: `${(item.value / maxValue) * 80}%` }}
              title={`${item.label}: ${item.value} visites`}
            />
            <span className="text-xs text-gray-500 mt-2">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PieChart = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let accumulated = 0;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center">
        <div className="relative w-32 h-32 mr-4">
          <svg viewBox="0 0 32 32" className="w-32 h-32 transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const offset = (accumulated / total) * 100;
              accumulated += item.value;
              
              return (
                <circle
                  key={index}
                  cx="16"
                  cy="16"
                  r="15.9155"
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="2"
                  strokeDasharray={`${percentage} ${100 - percentage}`}
                  strokeDashoffset={-offset}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">{total}</span>
          </div>
        </div>
        <div className="flex-1">
          {data.map((item, index) => (
            <div key={index} className="flex items-center mb-2">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-600 flex-1">{item.name}</span>
              <span className="text-sm font-medium text-gray-900">
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const { user, updateUser, axios, getToken } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    weeklyActivity: [],
    propertyTypes: [],
    visitorStats: null
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    country: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Données simulées pour les visualisations
  const mockStats = {
    weeklyActivity: [
      { label: 'Lun', value: 12 },
      { label: 'Mar', value: 19 },
      { label: 'Mer', value: 8 },
      { label: 'Jeu', value: 15 },
      { label: 'Ven', value: 22 },
      { label: 'Sam', value: 18 },
      { label: 'Dim', value: 11 }
    ],
    propertyTypes: [
      { name: 'Appartements', value: 45, color: '#3B82F6' },
      { name: 'Maisons', value: 30, color: '#10B981' },
      { name: 'Studios', value: 15, color: '#F59E0B' },
      { name: 'Villas', value: 10, color: '#EF4444' }
    ],
    visitorStats: {
      total: 1247,
      change: 12.5,
      isPositive: true
    }
  };

  // Initialiser les données
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        city: user.city || '',
        country: user.country || ''
      });
      
      // Charger les statistiques (simulées pour l'exemple)
      setStats(mockStats);
    }
  }, [user]);

  const validateForm = useCallback(() => {
    const errors = {};
    if (formData.firstName.length > 50) errors.firstName = 'Le prénom ne peut pas dépasser 50 caractères';
    if (formData.lastName.length > 50) errors.lastName = 'Le nom ne peut pas dépasser 50 caractères';
    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) errors.phone = 'Numéro de téléphone invalide';
    if (formData.city.length > 50) errors.city = 'La ville ne peut pas dépasser 50 caractères';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  useEffect(() => {
    if (isEditing) validateForm();
  }, [formData, isEditing, validateForm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleInputBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateForm();
  };

  const handleSave = async () => {
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      const { data } = await axios.put('/api/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        updateUser(data.user);
        toast.success('Profil mis à jour avec succès !');
        setIsEditing(false);
        setTouched({});
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        city: user.city || '',
        country: user.country || ''
      });
    }
    setIsEditing(false);
    setFormErrors({});
    setTouched({});
  };

  const hasChanges = useCallback(() => {
    if (!user) return false;
    return Object.keys(formData).some(key => formData[key] !== (user[key] || ''));
  }, [formData, user]);

  const getInitials = (username) => {
    return username ? username.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2) : '?';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-3">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  const canSave = isEditing && hasChanges() && Object.keys(formErrors).length === 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {getInitials(user.username)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                <p className="text-gray-600 text-lg">{user.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                    {user.role === 'host' ? 'Propriétaire' : 'Utilisateur'}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                    Membre depuis {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                {isEditing ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Annuler
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier le profil
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-6">
          <nav className="flex space-x-1">
            {['overview', 'statistics', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab === 'overview' && 'Aperçu'}
                {tab === 'statistics' && 'Statistiques'}
                {tab === 'settings' && 'Paramètres'}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Colonne de gauche - Statistiques principales */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Cartes de statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  title="Villes visitées"
                  value={user.recentSearchedCities?.length || 0}
                  icon="🏙️"
                  color="bg-blue-500"
                  trend={{ value: "+5%", isPositive: true }}
                  subtitle="ce mois"
                />
                <StatCard
                  title="Propriétés"
                  value={user.propertiesCount || 0}
                  icon="🏠"
                  color="bg-green-500"
                  subtitle="enregistrées"
                />
                <StatCard
                  title="Visites"
                  value={stats.visitorStats?.total || 0}
                  icon="👁️"
                  color="bg-purple-500"
                  trend={{
                    value: `${stats.visitorStats?.change || 0}%`,
                    isPositive: stats.visitorStats?.isPositive
                  }}
                  subtitle="total"
                />
              </div>

              {/* Graphique d'activité */}
              <ActivityChart data={stats.weeklyActivity} period="hebdomadaire" />

              {/* Section objectifs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression du profil</h3>
                <ProgressBar percentage={75} color="bg-blue-500" label="Profil complété" />
                <ProgressBar percentage={60} color="bg-green-500" label="Propriétés vérifiées" />
                <ProgressBar percentage={90} color="bg-purple-500" label="Réputation" />
              </div>
            </div>

            {/* Colonne de droite - Visualisations */}
            <div className="space-y-6">
              
              {/* Graphique circulaire */}
              <PieChart 
                data={stats.propertyTypes} 
                title="Types de propriétés"
              />

              {/* Activité récente */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Activité récente</h3>
                <div className="space-y-4">
                  {user.recentSearchedCities && user.recentSearchedCities.slice(0, 4).map((city, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm">🔍</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Recherche de propriété</p>
                        <p className="text-xs text-gray-500">à {city}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {index === 0 ? 'Aujourd\'hui' : 
                         index === 1 ? 'Hier' : 
                         `${index + 1}j`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Points forts */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Points forts</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Profil vérifié</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Réponse rapide</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Membre premium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section pour des statistiques détaillées */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques détaillées</h3>
              <p className="text-gray-600">Statistiques avancées à venir...</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Statistiques rapides */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Statistiques</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Villes visitées</span>
                    <span className="font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                      {user.recentSearchedCities?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Propriétés</span>
                    <span className="font-semibold bg-green-50 text-green-700 px-2 py-1 rounded text-sm">
                      {user.propertiesCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Statut</span>
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Actif
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Activité récente</h3>
                {user.recentSearchedCities && user.recentSearchedCities.length > 0 ? (
                  <div className="space-y-2">
                    {user.recentSearchedCities.slice(0, 5).map((city, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm py-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                        <span className="text-gray-700 truncate">Recherche : {city}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm py-2">Aucune activité récente</p>
                )}
              </div>
            </div>

            {/* Formulaire des paramètres */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Informations personnelles</h2>
                  {isEditing && hasChanges() && (
                    <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      Modifications non sauvegardées
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Les champs du formulaire restent les mêmes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        !isEditing 
                          ? 'bg-gray-100 border-gray-200 text-gray-500' 
                          : formErrors.firstName && touched.firstName
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Votre prénom"
                    />
                    {formErrors.firstName && touched.firstName && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.firstName}</p>
                    )}
                  </div>

                  {/* ... autres champs du formulaire ... */}
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!canSave || saving}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sauvegarde...
                        </>
                      ) : (
                        'Sauvegarder'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;