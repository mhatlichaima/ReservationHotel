// components/Notifications.jsx
import { useState, useEffect } from 'react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  // Simulation de notifications en temps réel
  useEffect(() => {
    const mockNotifications = [
      { id: 1, type: 'booking', message: 'New booking from John Doe', time: '2 min ago', read: false },
      { id: 2, type: 'payment', message: 'Payment received for booking #1234', time: '1 hour ago', read: true },
      { id: 3, type: 'review', message: 'New 5-star review from Sarah', time: '3 hours ago', read: true },
    ];
    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Notifications</h3>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
            {unreadCount} new
          </span>
        )}
      </div>
      <div className="space-y-3">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`p-3 rounded-lg border ${
              notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex justify-between">
              <p className="text-sm font-medium">{notification.message}</p>
              <span className="text-xs text-gray-500">{notification.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};