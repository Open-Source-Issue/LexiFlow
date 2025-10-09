import React from 'react';
import { UserButton, useUser } from '@clerk/chrome-extension';
import { 
  ChartBarIcon, 
  CogIcon, 
  BookOpenIcon, 
  GlobeAltIcon,
  StarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface DashboardProps {
  onBackToMain?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBackToMain }) => {
  const { user } = useUser();

  const stats = [
    { name: 'Translations Today', value: '24', change: '+12%', changeType: 'positive' },
    { name: 'Words Translated', value: '1,247', change: '+8%', changeType: 'positive' },
    { name: 'Languages Used', value: '8', change: '+2', changeType: 'positive' },
    { name: 'Time Saved', value: '2.3h', change: '+15%', changeType: 'positive' },
  ];

  const recentActivity = [
    { id: 1, action: 'Translated text', language: 'Spanish', time: '2 min ago', type: 'translate' },
    { id: 2, action: 'Added to glossary', language: 'French', time: '5 min ago', type: 'glossary' },
    { id: 3, action: 'Updated settings', language: 'General', time: '1 hour ago', type: 'settings' },
    { id: 4, action: 'Translated text', language: 'German', time: '2 hours ago', type: 'translate' },
  ];

  const quickActions = [
    { name: 'Translate Text', icon: GlobeAltIcon, color: 'bg-blue-500', href: '#' },
    { name: 'Manage Glossary', icon: BookOpenIcon, color: 'bg-green-500', href: '#' },
    { name: 'Settings', icon: CogIcon, color: 'bg-gray-500', href: '#' },
    { name: 'Usage Analytics', icon: ChartBarIcon, color: 'bg-purple-500', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBackToMain && (
                <button
                  onClick={onBackToMain}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Back to main"
                >
                  <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <UserButton />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  stat.changeType === 'positive' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="px-6 py-4 flex items-center space-x-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'translate' ? 'bg-blue-100' :
                      activity.type === 'glossary' ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.type === 'translate' ? (
                        <GlobeAltIcon className="w-4 h-4 text-blue-600" />
                      ) : activity.type === 'glossary' ? (
                        <BookOpenIcon className="w-4 h-4 text-green-600" />
                      ) : (
                        <CogIcon className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.language}</p>
                    </div>
                    <div className="flex-shrink-0 text-sm text-gray-500">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-4">
                {quickActions.map((action) => (
                  <button
                    key={action.name}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{action.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pro Status */}
            <div className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <StarIcon className="w-8 h-8 text-yellow-400" />
                <div>
                  <h4 className="text-lg font-semibold text-white">LexiFlow Pro</h4>
                  <p className="text-indigo-100 text-sm">Unlock advanced features</p>
                </div>
              </div>
              <button className="mt-4 w-full bg-white text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
