# hotel_recommender_fixed.py
import joblib
import json
import sys
import pandas as pd
import numpy as np
import traceback

def main():
    try:
        print("🚀 Hotel Recommender - Démarrage")
        
        # Méthode robuste pour lire les arguments
        if len(sys.argv) > 1:
            # Nettoyer l'input pour PowerShell/CMD
            input_str = sys.argv[1]
            if input_str.startswith("'{") and input_str.endswith("}'"):
                input_str = input_str[1:-1]  # Retirer les quotes externes
            input_str = input_str.replace("'", '"')  # Remplacer simples quotes par doubles
            
            user_preferences = json.loads(input_str)
            user_id = sys.argv[2] if len(sys.argv) > 2 else 'anonymous'
        else:
            # Valeurs par défaut pour test
            user_preferences = {"budget": 100, "adults": 2}
            user_id = "test_user"

        print(f"✅ User: {user_id}")
        print(f"✅ Préférences: {user_preferences}")

        # Charger le modèle entraîné
        print("📁 Chargement du modèle...")
        model_data = joblib.load('hotel_recommender_model.pkl')
        model = model_data['model']
        hotel_data = model_data['hotel_data']
        feature_names = model_data['feature_names']
        scaler = model_data['scaler']

        print("✅ Modèle chargé")

        # Préparer les données utilisateur
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

        # Créer DataFrame
        user_df = pd.DataFrame([user_data])
        user_features = user_df[feature_names]
        user_scaled = scaler.transform(user_features)

        # Générer recommandations
        print("🎯 Génération des recommandations...")
        distances, indices = model.kneighbors(user_scaled, n_neighbors=5)
        
        recommendations = []
        for i, idx in enumerate(indices[0]):
            hotel = hotel_data.iloc[idx]
            recommendations.append({
                'hotel_id': str(hotel.name),
                'name': f"Hotel {'City' if hotel['hotel'] == 0 else 'Resort'}",
                'similarity_score': float(1 - distances[0][i]),
                'price': float(hotel['adr']),
                'location': f"Country {hotel['country']}",
                'guests': int(hotel['adults'] + hotel['children'] + hotel['babies']),
                'rating': round(np.random.uniform(3.0, 5.0), 1)
            })

        # Résultat final
        result = {
            'user_id': user_id,
            'recommendations': recommendations,
            'count': len(recommendations),
            'timestamp': pd.Timestamp.now().isoformat(),
            'status': 'success'
        }

        print(f"✅ {len(recommendations)} recommandations générées")
        print(json.dumps(result))

    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        print(f"🔍 Détails: {traceback.format_exc()}")
        
        error_result = {
            'error': str(e),
            'user_id': 'anonymous',
            'recommendations': [],
            'timestamp': pd.Timestamp.now().isoformat(),
            'status': 'error'
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    main()