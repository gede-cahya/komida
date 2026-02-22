'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    isLoading?: boolean;
}

export function DeleteConfirmModal({
    open,
    onOpenChange,
    onConfirm,
    title = 'Delete this item?',
    description = 'This action cannot be undone. The item will be permanently removed.',
    isLoading = false,
}: DeleteConfirmModalProps) {
    const handleConfirm = (e: React.MouseEvent) => {
        e.preventDefault();
        onConfirm();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                        className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 mb-4"
                    >
                        <Trash2 className="w-8 h-8 text-white" />
                    </motion.div>
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 }}
                    >
                        <AlertDialogTitle className="text-white text-xl font-bold text-center">
                            {title}
                        </AlertDialogTitle>
                    </motion.div>
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <AlertDialogDescription className="text-gray-400 text-center mt-2">
                            {description}
                        </AlertDialogDescription>
                    </motion.div>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex-row justify-center gap-3 mt-4">
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="flex-1"
                    >
                        <AlertDialogCancel
                            onClick={() => onOpenChange(false)}
                            className="w-full bg-white/10 text-white hover:bg-white/20 border-0 rounded-xl py-3 font-medium transition-all"
                            disabled={isLoading}
                        >
                            Cancel
                        </AlertDialogCancel>
                    </motion.div>
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex-1"
                    >
                        <AlertDialogAction
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white border-0 rounded-xl py-3 font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 cursor-pointer"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </span>
                            )}
                        </AlertDialogAction>
                    </motion.div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
