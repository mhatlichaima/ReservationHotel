import joblib
import json
import pandas as pd
import numpy as np
import os
import sys  # ⬅️ AJOUT IMPORT

print("HOTEL RECOMMENDER - Version Fichier")

try:
    # Vérifier si le fichier existe
    if os.path.exists('temp_preferences.json'):
        print("LECTURE: Fichier de préférences...")
        with open('temp_preferences.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            user_preferences = data.get('preferences', {})
            user_id = data.get('user_id', 'anonymous')
        
        print(f"UTILISATEUR: {user_id}")
        print(f"PREFERENCES: {user_preferences}")
        
        # Charger le modèle
        print("CHARGEMENT: Modele...")
        model_data = joblib.load('hotel_recommender_model.pkl')
        model = model_data['model']
        hotel_data = model_data['hotel_data']
        feature_names = model_data['feature_names']
        scaler = model_data['scaler']
        
        print("MODELE: Charge")

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
        print("GENERATION: Recommandations...")
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

        print(f"SUCCES: {len(recommendations)} recommandations generees")
        print(json.dumps(result))
        
        # ⬇️⬇️⬇️ CRITIQUE: FORCER LE FLUSH ⬇️⬇️⬇️
        sys.stdout.flush()
        
        # Nettoyer le fichier temporaire
        os.remove('temp_preferences.json')
        print("NETTOYAGE: Fichier temporaire supprime")
        
    else:
        raise Exception("Fichier de préférences non trouvé")

except Exception as e:
    print(f"ERREUR: {str(e)}")
    
    error_result = {
        'error': str(e),
        'user_id': 'anonymous',
        'recommendations': [],
        'timestamp': pd.Timestamp.now().isoformat(),
        'status': 'error'
    }
    print(json.dumps(error_result))
    sys.stdout.flush()  