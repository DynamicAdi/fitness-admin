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

export function DeleteAdmin({ open, onOpenChange, user, onSuccess }: DeleteUserModalProps) {
    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/users/userList`, {
                method: 'DELETE',
                body: JSON.stringify({id: user.id})
            })

            if (response.ok) {
                onOpenChange(false)
                onSuccess()
                toast.success("Admin Removed successfully")
                window.location.reload()
            } else {
                console.error('Failed to Remove')
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
                    <DialogTitle>Remove Admin</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove {user.name} ({user.email}) from admin? This action cannot be undone.
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