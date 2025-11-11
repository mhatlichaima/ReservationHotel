// components/BookingsTable.jsx
import { useState } from 'react';

const BookingsTable = ({ bookings, onRefresh }) => {
  const [filters, setFilters] = useState({
    paymentStatus: '',
    search: '',
    dateRange: ''
  });

  const filteredBookings = bookings.filter(booking => {
    return (
      (!filters.paymentStatus || 
       (filters.paymentStatus === 'paid' ? booking.isPaid : !booking.isPaid)) &&
      (!filters.search || 
       booking.user?.username.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header avec filtres */}
      <div className="flex justify-between items-center mb-5">
        <h2 className='text-xl text-blue-950/70 font-medium'>Recent Bookings</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search guest..."
            className="border rounded-lg px-3 py-1 text-sm"
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
          <select 
            className="border rounded-lg px-3 py-1 text-sm"
            onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <button
            onClick={onRefresh}
            className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='w-full text-left border border-gray-300 rounded-lg max-h-80 overflow-y-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 sticky top-0'>
            <tr>
              <th className='py-3 px-4 text-gray-800 font-medium'>Guest</th>
              <th className='py-3 px-4 text-gray-800 font-medium'>Room</th>
              <th className='py-3 px-4 text-gray-800 font-medium'>Check-in</th>
              <th className='py-3 px-4 text-gray-800 font-medium'>Amount</th>
              <th className='py-3 px-4 text-gray-800 font-medium'>Status</th>
              <th className='py-3 px-4 text-gray-800 font-medium'>Actions</th>
            </tr>
          </thead>
          <tbody className='text-sm'>
            {filteredBookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50 border-t border-gray-300">
                <td className='py-3 px-4'>
                  <div>
                    <p className="font-medium">{booking.user?.username}</p>
                    <p className="text-xs text-gray-500">{booking.user?.email}</p>
                  </div>
                </td>
                <td className='py-3 px-4'>
                  <p className="font-medium">{booking.room?.roomType}</p>
                  <p className="text-xs text-gray-500">{booking.hotel?.name}</p>
                </td>
                <td className='py-3 px-4'>
                  <p>{new Date(booking.checkInDate).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">
                    {Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 3600 * 24))} nights
                  </p>
                </td>
                <td className='py-3 px-4 font-medium'>
                  {booking.totalPrice} DT
                </td>
                <td className='py-3 px-4'>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.isPaid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.isPaid ? '✅ Paid' : '⏳ Pending'}
                  </span>
                </td>
                <td className='py-3 px-4'>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsTable;