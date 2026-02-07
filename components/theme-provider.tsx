
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
type Color = 'zinc' | 'red' | 'rose' | 'orange' | 'green' | 'blue' | 'yellow' | 'violet';

interface ThemeContextType {
    theme: Theme;
    color: Color;
    setTheme: (theme: Theme) => void;
    setColor: (color: Color) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');
    const [color, setColor] = useState<Color>('violet');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme || 'dark';
        const savedColor = localStorage.getItem('color') as Color || 'violet';
        setTheme(savedTheme);
        setColor(savedColor);
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const root = window.document.documentElement;

        // Handle Dark/Light mode
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);

        // Handle Color Theme
        root.setAttribute('data-color', color);
        localStorage.setItem('color', color);

    }, [theme, color, mounted]);

    // Prevent hydration mismatch
    // if (!mounted) {
    //     return <>{children}</>;
    // } 
    // Commented out to fix "useTheme must be used within a ThemeProvider" error during hydration


    return (
        <ThemeContext.Provider value={{ theme, color, setTheme, setColor }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
