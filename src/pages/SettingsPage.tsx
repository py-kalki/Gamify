import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Database, Code, Save, Trash2, Download, Terminal, Shield, ChevronRight, Camera } from 'lucide-react';

export function SettingsPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: localStorage.getItem('gamify_user_name') || 'PyKalki',
        email: localStorage.getItem('gamify_user_email') || 'pykalki@example.com',
        avatar: localStorage.getItem('gamify_user_avatar') || ''
    });

    const handleSaveProfile = () => {
        localStorage.setItem('gamify_user_name', profile.name);
        localStorage.setItem('gamify_user_email', profile.email);
        localStorage.setItem('gamify_user_avatar', profile.avatar);
        setIsEditing(false);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex-1 bg-background p-8 overflow-y-auto mb-20">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-gray-400">Manage your application preferences and data.</p>
            </header>

            <div className="max-w-3xl space-y-8">
                {/* User Section */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center text-primary">
                        <User className="w-5 h-5 mr-2" />
                        User
                    </h2>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface border border-white/10 rounded-xl overflow-hidden"
                    >
                        <div className="p-6 flex items-center">
                            <div className="relative group">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-black shadow-lg overflow-hidden">
                                    {profile.avatar ? (
                                        <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        profile.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                {isEditing && (
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 text-white" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarChange}
                                        />
                                    </label>
                                )}
                            </div>
                            <div className="ml-6 flex-1">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                            placeholder="Display Name"
                                        />
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                            placeholder="Email Address"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="font-bold text-lg text-white">{profile.name}</div>
                                        <div className="text-sm text-gray-400">{profile.email}</div>
                                        <div className="mt-2 flex gap-2">
                                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary border border-primary/20">Pro Plan</span>
                                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-gray-300 border border-white/10">Early Adopter</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="ml-6 flex flex-col gap-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSaveProfile}
                                            className="px-4 py-2 rounded-lg bg-primary text-black hover:bg-primary/90 text-sm font-medium transition-colors"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors text-gray-400"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors border border-white/10"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Data Section */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center text-green-400">
                        <Database className="w-5 h-5 mr-2" />
                        Data
                    </h2>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-surface border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5"
                    >
                        <div
                            onClick={async () => {
                                try {
                                    const data = await import('../lib/gamification').then(m => m.exportAllData());
                                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `gamify-export-${new Date().toISOString().split('T')[0]}.json`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                } catch (e) {
                                    console.error('Export failed', e);
                                    alert('Failed to export data');
                                }
                            }}
                            className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mr-4 group-hover:bg-blue-500/20 transition-colors">
                                    <Download className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-white">Export Data</div>
                                    <div className="text-xs text-gray-500">Download all your activity history as JSON</div>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                        </div>

                        <div
                            onClick={() => {
                                // For now, backup is same as export. 
                                // In future, this could be a specific backup format or cloud sync.
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = '.json';
                                input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            try {
                                                const data = JSON.parse(event.target?.result as string);
                                                if (data.settings) {
                                                    if (data.settings.name) localStorage.setItem('gamify_user_name', data.settings.name);
                                                    if (data.settings.email) localStorage.setItem('gamify_user_email', data.settings.email);
                                                    if (data.settings.timer) localStorage.setItem('gamify_timer_settings', data.settings.timer);
                                                    alert('Settings restored successfully! Please refresh.');
                                                    window.location.reload();
                                                } else {
                                                    alert('No settings found in backup file.');
                                                }
                                            } catch (err) {
                                                alert('Invalid backup file');
                                            }
                                        };
                                        reader.readAsText(file);
                                    }
                                };
                                input.click();
                            }}
                            className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 mr-4 group-hover:bg-purple-500/20 transition-colors">
                                    <Save className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-white">Backup & Restore</div>
                                    <div className="text-xs text-gray-500">Import settings from a backup file</div>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                        </div>

                        <div
                            onClick={() => {
                                if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
                                    localStorage.clear();
                                    window.location.reload();
                                }
                            }}
                            className="p-4 flex items-center justify-between hover:bg-red-500/5 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 mr-4 group-hover:bg-red-500/20 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-red-400">Clear All Data</div>
                                    <div className="text-xs text-gray-500">Permanently delete all local data</div>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-red-400 transition-colors" />
                        </div>
                    </motion.div>
                </section>

                {/* Developer Section */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center text-orange-400">
                        <Code className="w-5 h-5 mr-2" />
                        Developer
                    </h2>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-surface border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5"
                    >
                        <div
                            onClick={() => {
                                alert('Logs are currently written to the application terminal/console.');
                            }}
                            className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 mr-4 group-hover:bg-orange-500/20 transition-colors">
                                    <Terminal className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-white">Logs</div>
                                    <div className="text-xs text-gray-500">View application logs and errors</div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className="text-xs font-mono text-gray-500 mr-3">v0.1.0-beta</span>
                                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                            </div>
                        </div>

                        <div
                            onClick={() => {
                                const isDebug = localStorage.getItem('gamify_debug_mode') === 'true';
                                localStorage.setItem('gamify_debug_mode', (!isDebug).toString());
                                alert(`Debug mode ${!isDebug ? 'enabled' : 'disabled'}. Reload to see changes.`);
                                window.location.reload();
                            }}
                            className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg bg-gray-500/10 text-gray-400 mr-4 group-hover:bg-gray-500/20 transition-colors">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-white">Debug Mode</div>
                                    <div className="text-xs text-gray-500">Enable advanced debugging features</div>
                                </div>
                            </div>
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localStorage.getItem('gamify_debug_mode') === 'true' ? 'bg-primary' : 'bg-white/10'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localStorage.getItem('gamify_debug_mode') === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                        </div>
                    </motion.div>
                </section>
            </div>
        </div>
    );
}
