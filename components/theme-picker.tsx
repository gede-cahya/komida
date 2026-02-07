
'use client';

import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const colors = [
    { name: 'Violet', value: 'violet', class: 'bg-violet-500' },
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Red', value: 'red', class: 'bg-red-500' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
];

export function ThemePicker() {
    const { theme, setTheme, color, setColor } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <Palette className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" /> Light
                    {theme === 'light' && <span className="ml-auto text-xs opacity-50">Active</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" /> Dark
                    {theme === 'dark' && <span className="ml-auto text-xs opacity-50">Active</span>}
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Accent Color</DropdownMenuLabel>
                <div className="grid grid-cols-3 gap-2 p-2">
                    {colors.map((c) => (
                        <button
                            key={c.value}
                            onClick={() => setColor(c.value as any)}
                            className={`flex items-center gap-2 rounded-md p-2 text-xs font-medium hover:bg-accent ${color === c.value ? 'bg-accent' : ''}`}
                        >
                            <div className={`h-4 w-4 rounded-full ${c.class}`} />
                            {/* <span className="capitalize">{c.name}</span> */}
                        </button>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
