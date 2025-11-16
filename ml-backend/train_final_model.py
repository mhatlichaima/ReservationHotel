# train_final_model.py
import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import os

print("🚀 ENTRAÎNEMENT DU MODÈLE DE RECOMMANDATION")

# === ÉTAPE 1: PRÉPROCESSING DES DONNÉES ===
print("📊 Étape 1: Chargement et nettoyage des données...")

# Charger les données
df = pd.read_csv('hotel_bookings.csv')
print(f"✅ Données chargées: {df.shape[0]} lignes, {df.shape[1]} colonnes")

# Nettoyage
df['children'] = df['children'].fillna(0)
df['country'] = df['country'].fillna('Unknown')
df['agent'] = df['agent'].fillna(0)
df['company'] = df['company'].fillna(0)

# Feature engineering
df['arrival_date'] = pd.to_datetime(
    df['arrival_date_year'].astype(str) + '-' +
    df['arrival_date_month'] + '-' +
    df['arrival_date_day_of_month'].astype(str)
)
df['total_revenue'] = df['adr'] * (df['stays_in_weekend_nights'] + df['stays_in_week_nights'])
df['arrival_month'] = df['arrival_date'].dt.month
df['is_summer'] = df['arrival_month'].isin([6, 7, 8]).astype(int)
df['is_winter'] = df['arrival_month'].isin([12, 1, 2]).astype(int)
df['total_guests'] = df['adults'] + df['children'] + df['babies']
df['is_family'] = ((df['children'] + df['babies']) > 0).astype(int)
df['is_business'] = (df['company'] > 0).astype(int)

# Encodage des variables catégorielles
categorical_columns = ['hotel', 'country', 'market_segment', 'distribution_channel', 'customer_type']
label_encoders = {}
for col in categorical_columns:
    if col in df.columns:
        label_encoders[col] = LabelEncoder()
        df[col] = label_encoders[col].fit_transform(df[col].astype(str))

print("✅ Préprocessing terminé")

# === ÉTAPE 2: PRÉPARATION DES FEATURES ===
print("🎯 Étape 2: Préparation des features...")

feature_columns = [
    'hotel', 'lead_time', 'arrival_month', 'stays_in_weekend_nights',
    'stays_in_week_nights', 'adults', 'children', 'babies', 'country',
    'is_repeated_guest', 'previous_cancellations', 'previous_bookings_not_canceled',
    'booking_changes', 'days_in_waiting_list', 'adr', 'required_car_parking_spaces',
    'total_of_special_requests', 'total_revenue', 'is_summer', 'is_winter',
    'total_guests', 'is_family', 'is_business'
]

available_features = [col for col in feature_columns if col in df.columns]
features = df[available_features]

# Normalisation
scaler = StandardScaler()
scaled_features = scaler.fit_transform(features)

print(f"✅ Features préparées: {len(available_features)} colonnes")

# === ÉTAPE 3: ENTRAÎNEMENT DU MODÈLE ===
print("🤖 Étape 3: Entraînement du modèle KNN...")

model = NearestNeighbors(n_neighbors=10, metric='cosine', algorithm='brute')
model.fit(scaled_features)

print("✅ Modèle KNN entraîné")

# === ÉTAPE 4: SAUVEGARDE ===
print("💾 Étape 4: Sauvegarde des modèles...")

# Sauvegarder tous les composants
model_components = {
    'model': model,
    'hotel_data': df,
    'feature_names': available_features,
    'scaler': scaler,
    'label_encoders': label_encoders
}

joblib.dump(model_components, 'hotel_recommender_model.pkl')
print("✅ Modèle complet sauvegardé")

# === ÉTAPE 5: TEST ===
print("🧪 Étape 5: Test des recommandations...")

def recommend_hotels(user_preferences, n_recommendations=5):
    """Fonction de recommandation"""
    # Créer le profil utilisateur
    user_data = {
        'hotel': 0,
        'lead_time': user_preferences.get('lead_time', 30),
        'arrival_month': user_preferences.get('arrival_month', 6),
        'stays_in_weekend_nights': user_preferences.get('weekend_nights', 2),
        'stays_in_week_nights': user_preferences.get('week_nights', 3),
        'adults': user_preferences.get('adults', 2),
        'children': user_preferences.get('children', 0),
        'babies': user_preferences.get('babies', 0),
        'country': 0,
        'is_repeated_guest': 0,
        'previous_cancellations': 0,
        'previous_bookings_not_canceled': 0,
        'booking_changes': 0,
        'days_in_waiting_list': 0,
        'adr': user_preferences.get('budget', 100),
        'required_car_parking_spaces': user_preferences.get('parking_required', 0),
        'total_of_special_requests': user_preferences.get('special_requests', 0),
        'total_revenue': user_preferences.get('budget', 100) * (
            user_preferences.get('weekend_nights', 2) + user_preferences.get('week_nights', 3)
        ),
        'is_summer': int(user_preferences.get('arrival_month', 6) in [6, 7, 8]),
        'is_winter': int(user_preferences.get('arrival_month', 6) in [12, 1, 2]),
        'total_guests': user_preferences.get('adults', 2) + user_preferences.get('children', 0),
        'is_family': int(user_preferences.get('children', 0) > 0),
        'is_business': int(user_preferences.get('trip_type', 'leisure') == 'business')
    }
    
    user_df = pd.DataFrame([user_data])
    user_features = user_df[available_features]
    user_scaled = scaler.transform(user_features)
    
    distances, indices = model.kneighbors(user_scaled, n_neighbors=n_recommendations)
    
    recommendations = []
    for i, idx in enumerate(indices[0]):
        hotel = df.iloc[idx]
        recommendations.append({
            'hotel_id': str(hotel.name),
            'name': f"Hotel {'City' if hotel['hotel'] == 0 else 'Resort'}",
            'similarity_score': float(1 - distances[0][i]),
            'price': float(hotel['adr']),
            'location': f"Country {hotel['country']}",
            'guests': int(hotel['adults'] + hotel['children'] + hotel['babies']),
            'rating': round(np.random.uniform(3.0, 5.0), 1)
        })
    
    return recommendations

# Test
test_prefs = {'budget': 150, 'adults': 2, 'trip_type': 'leisure'}
recs = recommend_hotels(test_prefs, 5)

print(f"🎉 TEST RÉUSSI: {len(recs)} recommandations générées!")
for i, hotel in enumerate(recs, 1):
    print(f"  {i}. {hotel['name']} - €{hotel['price']} - Score: {hotel['similarity_score']:.2f}")

print("\n✅ MODÈLE PRÊT À L'EMPLOI!")