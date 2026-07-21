import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Globe, Shield, Mail, Bell, CreditCard, Award, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'courses', label: 'Course Rules', icon: BookOpen },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage platform configuration</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 space-y-1 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-navy-800 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <Card>
              <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Settings saved!'); }}>
                  <Input label="Platform Name" defaultValue="DynamicTI Training Platform" />
                  <Input label="Contact Email" defaultValue="admin@test.com" />
                  <Input label="Support Phone" defaultValue="+1-555-0001" />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Timezone</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option>UTC-05:00 Eastern Time</option>
                      <option>UTC-06:00 Central Time</option>
                      <option>UTC-07:00 Mountain Time</option>
                      <option>UTC-08:00 Pacific Time</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Language</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                  <Button type="submit">Save Changes</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Security settings updated!'); }}>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Session Timeout</p>
                      <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                    </div>
                    <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>2 hours</option>
                    </select>
                  </div>
                  <Input label="Password Minimum Length" type="number" defaultValue="8" />
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Password Complexity</p>
                      <p className="text-sm text-gray-500">Require uppercase, lowercase, numbers, symbols</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                  <Button type="submit">Save Security Settings</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab !== 'general' && activeTab !== 'security' && (
            <Card>
              <CardHeader><CardTitle>{tabs.find(t => t.id === activeTab)?.label} Settings</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-500">Configure {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} settings for your platform.</p>
                <div className="mt-4 space-y-4">
                  <Input label="Configuration Key" placeholder="Enter setting value" />
                  <Input label="Additional Setting" placeholder="Enter value" />
                  <Button onClick={() => toast.success('Settings saved!')}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
