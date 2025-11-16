# data_preprocessing.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import os

print("🔧 Préparation des données hôtelières...")

class HotelDataPreprocessor:
    def __init__(self):
        self.label_encoders = {}
        self.scaler = StandardScaler()
    
    def load_and_clean_data(self, file_path):
        """Charge et nettoie les données brutes"""
        print(f"📖 Chargement des données depuis {file_path}...")
        df = pd.read_csv(file_path)
        print(f"✅ Données chargées: {df.shape[0]} lignes, {df.shape[1]} colonnes")
        
        # Nettoyage des données
        df = self._handle_missing_values(df)
        df = self._feature_engineering(df)
        df = self._encode_categorical_features(df)
        
        return df
    
    def _handle_missing_values(self, df):
        """Gère les valeurs manquantes"""
        print("🧹 Nettoyage des valeurs manquantes...")
        
        # Remplacer les valeurs manquantes
        df['children'] = df['children'].fillna(0)
        df['country'] = df['country'].fillna('Unknown')
        df['agent'] = df['agent'].fillna(0)
        df['company'] = df['company'].fillna(0)
        
        print("✅ Valeurs manquantes traitées")
        return df
    
    def _feature_engineering(self, df):
        """Crée de nouvelles features"""
        print("🎯 Création de nouvelles features...")
        
        # Conversion de la date
        df['arrival_date'] = pd.to_datetime(
            df['arrival_date_year'].astype(str) + '-' +
            df['arrival_date_month'] + '-' +
            df['arrival_date_day_of_month'].astype(str)
        )
        
        # Calcul du revenu total par séjour
        df['total_revenue'] = df['adr'] * (df['stays_in_weekend_nights'] + df['stays_in_week_nights'])
        
        # Saisonnalité
        df['arrival_month'] = df['arrival_date'].dt.month
        df['is_summer'] = df['arrival_month'].isin([6, 7, 8]).astype(int)
        df['is_winter'] = df['arrival_month'].isin([12, 1, 2]).astype(int)
        
        # Type de voyageur
        df['total_guests'] = df['adults'] + df['children'] + df['babies']
        df['is_family'] = ((df['children'] + df['babies']) > 0).astype(int)
        df['is_business'] = (df['company'] > 0).astype(int)
        
        print("✅ Features engineering terminé")
        return df
    
    def _encode_categorical_features(self, df):
        """Encode les features catégorielles"""
        print("🔤 Encodage des features catégorielles...")
        
        categorical_columns = ['hotel', 'country', 'market_segment', 'distribution_channel', 'customer_type']
        
        for col in categorical_columns:
            if col in df.columns:
                self.label_encoders[col] = LabelEncoder()
                df[col] = self.label_encoders[col].fit_transform(df[col].astype(str))
        
        print("✅ Encodage terminé")
        return df
    
    def prepare_features_for_training(self, df):
        """Prépare les features pour l'entraînement"""
        print("📊 Préparation des features pour l'entraînement...")
        
        feature_columns = [
            'hotel', 'lead_time', 'arrival_month', 'stays_in_weekend_nights',
            'stays_in_week_nights', 'adults', 'children', 'babies', 'country',
            'is_repeated_guest', 'previous_cancellations', 'previous_bookings_not_canceled',
            'booking_changes', 'days_in_waiting_list', 'adr', 'required_car_parking_spaces',
            'total_of_special_requests', 'total_revenue', 'is_summer', 'is_winter',
            'total_guests', 'is_family', 'is_business'
        ]
        
        # Sélectionner les colonnes disponibles
        available_features = [col for col in feature_columns if col in df.columns]
        features = df[available_features]
        
        # Normalisation
        scaled_features = self.scaler.fit_transform(features)
        
        print(f"✅ Features préparées: {len(available_features)} colonnes")
        return scaled_features, available_features

# Test du preprocesseur
if __name__ == "__main__":
    try:
        preprocessor = HotelDataPreprocessor()
        
        # Vérifier si le fichier existe
        if os.path.exists('hotel_bookings.csv'):
            df = preprocessor.load_and_clean_data('hotel_bookings.csv')
            features, feature_names = preprocessor.prepare_features_for_training(df)
            
            # Sauvegarder le preprocesseur
            joblib.dump(preprocessor, 'hotel_preprocessor.pkl')
            
            print("🎉 Préprocessing terminé avec succès!")
            print(f"📈 Dataset final: {df.shape}")
            print(f"🔧 Features utilisées: {feature_names}")
            
        else:
            print("❌ Fichier hotel_bookings.csv non trouvé")
            print("📥 Veuillez d'abord télécharger le dataset Kaggle")
            
    except Exception as e:
        print(f"❌ Erreur lors du preprocessing: {e}")