// src/components/users/DeleteConfirmModal.jsx
import { motion } from 'framer-motion'
import { X, AlertTriangle, UserCog } from 'lucide-react'

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, user }) {
    if (!isOpen || !user) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50"
                onClick={onClose}
            />
            
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl"
            >
                <div className="flex items-center justify-between border-b border-gray-100 bg-red-50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                            <UserCog className="h-5 w-5 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-red-700">Delete User</h2>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="mb-4 flex items-center gap-3 rounded-xl bg-amber-50 p-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <p className="text-sm text-amber-700">
                            This action cannot be undone. This will permanently delete the user account.
                        </p>
                    </div>
                    
                    <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="mt-1 text-xs">
                            <span className="font-medium">Role:</span>{' '}
                            <span className="capitalize">{user.role}</span>
                        </p>
                    </div>
                    
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete <strong className="text-red-600">{user.name}</strong>? 
                        This user will no longer be able to access the system.
                    </p>
                </div>
                
                <div className="flex gap-3 border-t border-gray-100 bg-gray-50 p-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 rounded-xl bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                    >
                        Delete User
                    </button>
                </div>
            </motion.div>
        </div>
    )
}