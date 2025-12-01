import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Timer,
    Activity,
    Briefcase,
    TrendingUp,
    Target,
    Zap,
    ChevronDown,
    Settings,
    LayoutDashboard
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isProductivityOpen, setIsProductivityOpen] = useState(true);

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Timer, label: 'Timer', href: '/timer' },
        { icon: Activity, label: 'Activity', href: '/activity' },
    ];

    const productivityItems = [
        { icon: TrendingUp, label: 'Trends', href: '/productivity/trends' },
        { icon: Target, label: 'Goals', href: '/productivity/goals' },
        { icon: Zap, label: 'Insights', href: '/productivity/insights' },
    ];

    return (
        <motion.div
            className={cn(
                "h-screen bg-surface border-r border-white/10 flex flex-col py-6 transition-all duration-300 ease-in-out z-50",
                isHovered ? "w-64" : "w-16",
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Logo / Header */}
            <div className="px-4 mb-8 flex items-center overflow-hidden whitespace-nowrap">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex-shrink-0 flex items-center justify-center">
                    <span className="font-bold text-black">G</span>
                </div>
                <motion.span
                    className="ml-3 font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    Gamify
                </motion.span>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-2 space-y-1">
                {navItems.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        className="flex items-center px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors group relative overflow-hidden whitespace-nowrap"
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <motion.span
                            className="ml-3 text-sm font-medium"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {item.label}
                        </motion.span>
                    </a>
                ))}

                {/* Workspace Selector */}
                <div className="mt-6 px-3">
                    <button className="flex items-center w-full text-left text-gray-400 hover:text-white transition-colors overflow-hidden whitespace-nowrap">
                        <Briefcase className="w-5 h-5 flex-shrink-0" />
                        <motion.div
                            className="ml-3 flex-1 flex items-center justify-between"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <span className="text-sm font-medium">PyKalki's Workspace</span>
                            <ChevronDown className="w-4 h-4" />
                        </motion.div>
                    </button>
                </div>

                {/* Productivity Section */}
                <div className="mt-6">
                    <button
                        onClick={() => isHovered && setIsProductivityOpen(!isProductivityOpen)}
                        className="w-full flex items-center px-3 py-2 text-gray-400 hover:text-white transition-colors overflow-hidden whitespace-nowrap"
                    >
                        <TrendingUp className="w-5 h-5 flex-shrink-0" />
                        <motion.div
                            className="ml-3 flex-1 flex items-center justify-between"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <span className="text-sm font-medium">Productivity</span>
                            <ChevronDown className={cn("w-4 h-4 transition-transform", isProductivityOpen ? "rotate-180" : "")} />
                        </motion.div>
                    </button>

                    <AnimatePresence>
                        {isProductivityOpen && isHovered && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                {productivityItems.map((item) => (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        className="flex items-center pl-11 pr-3 py-2 text-sm text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <item.icon className="w-4 h-4 mr-2" />
                                        {item.label}
                                    </a>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </nav>

            {/* Footer */}
            <div className="px-2 mt-auto space-y-1">
                <button
                    onClick={() => window.open('/widget', 'GamifyWidget', 'width=650,height=100,resizable=no,alwaysOnTop=yes')}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors overflow-hidden whitespace-nowrap"
                >
                    <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                    <motion.span
                        className="ml-3 text-sm font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        Open Widget
                    </motion.span>
                </button>
                <a href="/settings" className="w-full flex items-center px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors overflow-hidden whitespace-nowrap">
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    <motion.span
                        className="ml-3 text-sm font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        Settings
                    </motion.span>
                </a>
            </div>
        </motion.div>
    );
}
