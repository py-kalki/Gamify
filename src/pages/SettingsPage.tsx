import { motion } from 'framer-motion';
import { User, Database, Moon, Shield, LogOut, ChevronRight } from 'lucide-react';

export function SettingsPage() {
    return (
        <div className="flex-1 bg-background p-8 overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-gray-400">Manage your account and preferences.</p>
            </header>

            <div className="max-w-2xl space-y-6">
                {/* Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface border border-white/10 rounded-xl p-6"
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-primary" />
                        Profile
                    </h2>
                    <div className="flex items-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-black">
                            P
                        </div>
                        <div className="ml-4 flex-1">
                            <div className="font-medium text-lg">PyKalki</div>
                            <div className="text-sm text-gray-400">pykalki@example.com</div>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
                            Edit
                        </button>
                    </div>
                </motion.div>

                {/* Preferences */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-surface border border-white/10 rounded-xl overflow-hidden"
                >
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-lg font-semibold flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-purple-500" />
                            Preferences
                        </h2>
                    </div>

                    <div className="divide-y divide-white/5">
                        <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="flex items-center">
                                <Moon className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                    <div className="font-medium">Appearance</div>
                                    <div className="text-xs text-gray-500">Dark mode is enabled</div>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                        </div>

                        <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="flex items-center">
                                <Database className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                    <div className="font-medium">Data & Privacy</div>
                                    <div className="text-xs text-gray-500">Manage your local data</div>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                        </div>
                    </div>
                </motion.div>

                {/* Data Management */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-surface border border-white/10 rounded-xl p-6"
                >
                    <h2 className="text-lg font-semibold mb-4 text-red-400 flex items-center">
                        <Database className="w-5 h-5 mr-2" />
                        Danger Zone
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">
                        Deleting your data is permanent and cannot be undone. This will wipe all your local activity history and gamification progress.
                    </p>
                    <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-medium transition-colors border border-red-500/20">
                        Clear All Data
                    </button>
                </motion.div>

                <div className="flex justify-center pt-4">
                    <button className="flex items-center text-gray-500 hover:text-white transition-colors text-sm">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
