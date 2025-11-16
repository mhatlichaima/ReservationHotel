import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { 
  TrendingUp, Users, DollarSign, Hotel, Calendar, 
  Download, Filter, RefreshCw, Eye, Edit3, Search,
  ChevronDown, X, Plus, Building
} from 'lucide-react'

// Palettes de couleurs modernes
const COLOR_PALETTE = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#8B5CF6',
  warning: '#F59E0B',
  danger: '#EF4444',
  gray: '#6B7280'
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280']

// Composant MetricCard moderne
const MetricCard = ({ title, value, subtitle, icon, color, trend }) => {
  const IconComponent = icon;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                trend > 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-gray-400 text-xs mt-2">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
          <IconComponent size={24} className="text-white" />
        </div>
      </div>
    </div>
  )
}

// Composant ChartContainer avec contrôles
const ChartContainer = ({ title, children, controls }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      {controls}
    </div>
    {children}
  </div>
)

// Graphique Revenue avec tendance
const RevenueChart = ({ data }) => {
  const [timeRange, setTimeRange] = useState('6m')

  const timeRanges = {
    '1m': '1 Month',
    '3m': '3 Months', 
    '6m': '6 Months',
    '1y': '1 Year'
  }

  return (
    <ChartContainer
      title="Revenue Analytics"
      controls={
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(timeRanges).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      }
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#6B7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fill: '#6B7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${value/1000}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [`${value} DT`, 'Revenue']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke={COLOR_PALETTE.primary}
              strokeWidth={3}
              dot={{ fill: COLOR_PALETTE.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: COLOR_PALETTE.primary }}
            />
            <Line 
              type="monotone" 
              dataKey="bookings" 
              stroke={COLOR_PALETTE.secondary}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: COLOR_PALETTE.secondary, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  )
}

// Graphique de distribution des chambres
const RoomDistributionChart = ({ data }) => (
  <ChartContainer title="Room Type Distribution">
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} bookings`, 'Count']} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </ChartContainer>
)

// Composant Filtres Avancés FONCTIONNEL
const AdvancedFilters = ({ onFilterChange, bookingsCount, filters }) => {
  const [localFilters, setLocalFilters] = useState({
    search: '',
    paymentStatus: '',
    sortBy: 'date'
  })

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...localFilters, ...newFilters }
    setLocalFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const clearFilters = () => {
    const clearedFilters = { search: '', paymentStatus: '', sortBy: 'date' }
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = localFilters.search || localFilters.paymentStatus

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by guest name or email..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={localFilters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap gap-3">
          {/* Payment Status */}
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={localFilters.paymentStatus}
              onChange={(e) => handleFilterChange({ paymentStatus: e.target.value })}
            >
              <option value="">All Payments</option>
              <option value="paid">Paid Only</option>
              <option value="pending">Pending Only</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={localFilters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
            >
              <option value="date">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="price">Highest Price</option>
              <option value="price_asc">Lowest Price</option>
              <option value="name">Guest Name A-Z</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>

        {/* Results Counter */}
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
          <span className="text-blue-700 font-medium text-sm">
            {bookingsCount} booking{bookingsCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="text-sm text-gray-500">Active filters:</span>
          {localFilters.search && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
              Search: "{localFilters.search}"
              <button onClick={() => handleFilterChange({ search: '' })}>
                <X size={12} />
              </button>
            </span>
          )}
          {localFilters.paymentStatus && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
              {localFilters.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
              <button onClick={() => handleFilterChange({ paymentStatus: '' })}>
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Tableau de bookings moderne FONCTIONNEL
const ModernBookingsTable = ({ bookings, onAction, onExport }) => {
  const getStatusBadge = (status, isPaid) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium"
    
    if (isPaid) {
      return `${baseClasses} bg-green-100 text-green-800 border border-green-200`
    }
    
    switch (status) {
      case 'confirmed':
        return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Booking Management</h3>
            <p className="text-gray-500 text-sm mt-1">Manage and track all reservations</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Guest
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Room Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Stay Period
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings && bookings.length > 0 ? (
              bookings.map((booking) => {
                const nights = Math.ceil(
                  (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 3600 * 24)
                )
                
                return (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{booking.user?.username || 'Unknown Guest'}</p>
                        <p className="text-sm text-gray-500">{booking.user?.email || 'No email'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{booking.room?.roomType || 'Unknown Room'}</p>
                        <p className="text-sm text-gray-500">{booking.hotel?.name || 'Unknown Hotel'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{nights} nights</p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.checkInDate).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">
                        {(booking.totalPrice || 0).toLocaleString()} DT
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(booking.status, booking.isPaid)}>
                        {booking.isPaid ? 'Paid' : (booking.status || 'Pending')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => onAction('view', booking)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => onAction('edit', booking)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit booking"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center text-gray-500">
                    <div className="text-4xl mb-4">📭</div>
                    <p className="text-lg font-medium mb-2">No bookings found</p>
                    <p className="text-sm">No bookings match your current criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Dashboard Principal COMPLETEMENT FONCTIONNEL
const Dashboard = () => {
  const { currency, user, getToken, toast, axios, setShowHotelReg } = useAppContext();
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    bookings: []
  });
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Données simulées pour les graphiques
  const revenueData = [
    { month: 'Jan', revenue: 45000, bookings: 12 },
    { month: 'Feb', revenue: 52000, bookings: 15 },
    { month: 'Mar', revenue: 48000, bookings: 14 },
    { month: 'Apr', revenue: 61000, bookings: 18 },
    { month: 'May', revenue: 55000, bookings: 16 },
    { month: 'Jun', revenue: 72000, bookings: 22 },
    { month: 'Jul', revenue: 68000, bookings: 20 },
    { month: 'Aug', revenue: 75000, bookings: 23 },
    { month: 'Sep', revenue: 71000, bookings: 21 },
    { month: 'Oct', revenue: 79000, bookings: 24 },
    { month: 'Nov', revenue: 82000, bookings: 25 },
    { month: 'Dec', revenue: 88000, bookings: 26 }
  ];

  const roomDistributionData = [
    { name: 'Single', value: 35 },
    { name: 'Double', value: 45 },
    { name: 'Suite', value: 15 },
    { name: 'Deluxe', value: 5 }
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get('/api/bookings/hotel', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const data = response.data.DashboardData;
        setDashboardData(data);
        setFilteredBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error(error.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // FONCTION FILTRES CORRIGÉE
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    let filtered = [...(dashboardData.bookings || [])];
    
    // Filtre par recherche
    if (newFilters.search) {
      const searchTerm = newFilters.search.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.user?.username?.toLowerCase().includes(searchTerm) ||
        booking.user?.email?.toLowerCase().includes(searchTerm) ||
        booking.room?.roomType?.toLowerCase().includes(searchTerm) ||
        booking.hotel?.name?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filtre par statut de paiement
    if (newFilters.paymentStatus === 'paid') {
      filtered = filtered.filter(booking => booking.isPaid);
    } else if (newFilters.paymentStatus === 'pending') {
      filtered = filtered.filter(booking => !booking.isPaid);
    }
    
    // Tri
    if (newFilters.sortBy === 'date_asc') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (newFilters.sortBy === 'price') {
      filtered.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
    } else if (newFilters.sortBy === 'price_asc') {
      filtered.sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
    } else if (newFilters.sortBy === 'name') {
      filtered.sort((a, b) => (a.user?.username || '').localeCompare(b.user?.username || ''));
    } else {
      // Tri par date décroissante par défaut
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    setFilteredBookings(filtered);
  };

  // FONCTION EXPORT CSV CORRIGÉE
  const exportToCSV = () => {
    try {
      setExporting(true);
      
      // Utiliser les données filtrées ou toutes les données
      const dataToExport = filteredBookings.length > 0 ? filteredBookings : (dashboardData.bookings || []);
      
      if (dataToExport.length === 0) {
        toast.error("No data to export");
        return;
      }

      // En-têtes CSV
      const headers = [
        'Booking ID',
        'Guest Name',
        'Guest Email',
        'Room Type',
        'Hotel Name',
        'Check-in Date',
        'Check-out Date',
        'Nights',
        'Guests',
        'Total Amount (DT)',
        'Payment Status',
        'Booking Status',
        'Booking Date'
      ];

      // Préparer les données
      const csvData = dataToExport.map(booking => {
        const nights = Math.ceil(
          (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 3600 * 24)
        );
        
        return [
          booking._id || 'N/A',
          `"${booking.user?.username || 'Unknown Guest'}"`,
          `"${booking.user?.email || 'N/A'}"`,
          `"${booking.room?.roomType || 'Unknown Room'}"`,
          `"${booking.hotel?.name || 'Unknown Hotel'}"`,
          new Date(booking.checkInDate).toISOString().split('T')[0],
          new Date(booking.checkOutDate).toISOString().split('T')[0],
          nights,
          booking.guests || 1,
          booking.totalPrice || 0,
          booking.isPaid ? 'PAID' : 'PENDING',
          (booking.status || 'pending').toUpperCase(),
          new Date(booking.createdAt).toISOString().split('T')[0]
        ];
      });

      // Créer le contenu CSV
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      
      link.href = url;
      link.download = `hotel-bookings-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      toast.success(`Exported ${dataToExport.length} bookings to CSV`);
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV file');
    } finally {
      setExporting(false);
    }
  };

  const handleBookingAction = (action, booking) => {
    console.log(`${action} booking:`, booking);
    // Implémenter les actions ici
    switch (action) {
      case 'view':
        toast.info(`Viewing booking ${booking._id}`);
        break;
      case 'edit':
        toast.info(`Editing booking ${booking._id}`);
        break;
      default:
        break;
    }
  };

  // FONCTION POUR AJOUTER UN HÔTEL
  const handleAddHotel = () => {
    setShowHotelReg(true);
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Mettre à jour les données filtrées quand les données changent
  useEffect(() => {
    if (dashboardData.bookings) {
      setFilteredBookings(dashboardData.bookings);
    }
  }, [dashboardData.bookings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading Dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Preparing your analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hotel Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Real-time insights and performance metrics</p>
          </div>
          <div className="flex gap-3">
            {/* BOUTON ADD HOTEL */}
            <button
              onClick={handleAddHotel}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all font-medium shadow-sm"
            >
              <Plus size={18} />
              Add Hotel
            </button>
            
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium shadow-sm"
            >
              <RefreshCw size={18} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Hotels"
            value={user?.hotels?.length?.toString() || '0'}
            subtitle="Registered properties"
            icon={Building}
            color="bg-indigo-500"
            trend={user?.hotels?.length > 0 ? 5 : 0}
          />
          <MetricCard
            title="Total Bookings"
            value={dashboardData.totalBookings?.toLocaleString() || '0'}
            subtitle="All time reservations"
            icon={Users}
            color="bg-blue-500"
            trend={12}
          />
          <MetricCard
            title="Total Revenue"
            value={`${(dashboardData.totalRevenue || 0).toLocaleString()} DT`}
            subtitle="Lifetime earnings"
            icon={DollarSign}
            color="bg-green-500"
            trend={8}
          />
          <MetricCard
            title="Active Bookings"
            value={(dashboardData.bookings?.length || 0).toString()}
            subtitle="Currently showing"
            icon={Hotel}
            color="bg-purple-500"
            trend={5}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RevenueChart data={revenueData} />
          <RoomDistributionChart data={roomDistributionData} />
        </div>

        {/* Filtres et Tableau */}
        <AdvancedFilters 
          onFilterChange={handleFilterChange}
          bookingsCount={filteredBookings.length}
          filters={filters}
        />

        <ModernBookingsTable 
          bookings={filteredBookings}
          onAction={handleBookingAction}
          onExport={exportToCSV}
        />
      </div>
    </div>
  );
};

export default Dashboard;