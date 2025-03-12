import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Notification } from "@/types/notification"

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  notifications: Notification[]
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, notifications }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[600px] w-full rounded-md border p-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="mb-4 rounded-lg bg-gray-100 p-5 dark:bg-gray-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">{notification.message}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}