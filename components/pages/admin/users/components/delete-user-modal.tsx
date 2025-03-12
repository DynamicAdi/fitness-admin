"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface User {
    id: string
    name: string
    email: string
}

interface DeleteUserModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User
    onSuccess: () => void
}

export function DeleteUserModal({ open, onOpenChange, user, onSuccess }: DeleteUserModalProps) {
    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/users/user/${user.id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                onOpenChange(false)
                onSuccess()
                toast.success("User deleted successfully")
                window.location.reload()
            } else {
                console.error('Failed to delete user')
            }
        } catch (error) {
            console.error('Error deleting user:', error)
            toast.error("An error occurred while deleting the user")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the user {user.name} ({user.email})? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}