import { useState, useEffect, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoreHorizontal, Pencil, Trash, Video } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { DeleteConfirmationModal } from "./delete-confirmation-modal"
import { EditSessionModal } from "./edit-session-modal"

interface Session {
  id: string
  date: string
  startTime: string
  endTime: string
  scheduleSubject: string
  scheduleLink?: string
  status: string
  trainer: any
  user: {
    name: string
    image: string
  }
  sessionType: string
  // status: 'pending' | 'completed' | 'upcoming' | 'requested'
}

interface SessionsTableProps {
  onEdit: (id: string, data: Partial<Session>) => void
  onDelete: (id: string) => void
  onAddLink: (id: string, link: string) => void
}

export function SessionsTable({ onEdit, onDelete, onAddLink }: SessionsTableProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch(`/api/schedule?page=${currentPage}&search=${searchTerm}`)
      const data = await response.json()
      setSessions(data.schedules)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }, [currentPage, searchTerm])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const handleDeleteClick = (session: any) => {
    setSelectedSession(session)
    setDeleteModalOpen(true)
  }

  const handleEditClick = (session: any) => {
    setSelectedSession(session)
    setEditModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedSession) {
      onDelete(selectedSession.id)
      setDeleteModalOpen(false)
      setSelectedSession(null)
    }
  }

  const handleConfirmEdit = (data: Partial<Session>) => {
    if (selectedSession) {
      onEdit(selectedSession.id, data)
      setEditModalOpen(false)
      setSelectedSession(null)
    }
  }

  const handleAddLink = async (id: string) => {
    try {
      const response = await fetch(`/api/schedule/${id}/generate-meet`, {
        method: 'POST',
      })
      if (response.ok) {
        const { meetLink } = await response.json()
        onAddLink(id, meetLink)
        fetchSessions()
        window.location.reload()
      } else if (response.status === 401) {
        const { authUrl } = await response.json()
        window.location.href = authUrl // Redirect to Google OAuth
      } else {
        throw new Error("Failed to generate Google Meet link")
      }
    } catch (error) {
      console.error('Error generating Google Meet link:', error)
    }
  }

  return (
    <div>
      <Input
        placeholder="Search by subject..."
        value={searchTerm}
        onChange={handleSearch}
        className="mb-4"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Trainer</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Meeting Link</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>{new Date(session.date).toLocaleDateString()}</TableCell>
              <TableCell>{`${formatTime(session.startTime)} - ${formatTime(session.endTime)}`}</TableCell>
              <TableCell>{session.sessionType}</TableCell>
              <TableCell>{session.scheduleSubject}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={session.trainer.image || "/pfp.jpg"} alt={session.trainer.name} />
                    <AvatarFallback>{session.trainer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {session.trainer.name}
                  
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={session.user.image || "/pfp.jpg"} alt={session.user.name} />
                    <AvatarFallback>{session.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {session.user.name}
                </div>
              </TableCell>
              <TableCell>
                <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                  ${session.status === 'completed' ? 'bg-green-100 text-green-800' :
                    session.status === 'requested' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </div>
              </TableCell>
              <TableCell>
                {session.status !== 'completed' && session.status !== 'requested' && (
                  session.scheduleLink ? (
                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => window.open(session.scheduleLink, '_blank')}>
                      <Video className="h-4 w-4" />
                      <span>Join</span>
                    </Button>
                  ) : (
                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleAddLink(session.id)}>
                      Generate Link
                    </Button>
                  )
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleEditClick(session)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDeleteClick(session)}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <Button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <EditSessionModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onConfirm={handleConfirmEdit}
        session={selectedSession}
      />
    </div>
  )
}