import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'host'],
    default: 'user'
  },
  recentSearchedCities: {
    type: [String],
    default: []
  },
  // CHAMPS POUR LE PROFIL
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  preferences: {
    newsletter: {
      type: Boolean,
      default: false
    },
    smsNotifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'fr',
      enum: ['fr', 'en', 'es', 'de']
    },
    currency: {
      type: String,
      default: 'EUR',
      enum: ['EUR', 'USD', 'TND', 'CAD', 'CHF']
    }
  },
  // 🆕 DONNÉES DE RECONNAISSANCE FACIALE
  faceDescriptor: {
    type: [Number], // Tableau de 128 nombres (descripteur facial)
    default: null
  },
  faceRegistered: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);