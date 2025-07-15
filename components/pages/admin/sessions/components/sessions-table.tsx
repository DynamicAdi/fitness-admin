import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Pencil, Trash, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";
import { EditSessionModal } from "./edit-session-modal";

interface Session {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  scheduleSubject: string;
  scheduleLink?: string;
  status: string;
  trainer: {
    id: string;
    name: string;
    image?: string;
  };
  user: {
    name: string;
    image: string;
  };
  sessionType: string;
  attended?: boolean;
  // status: 'pending' | 'completed' | 'upcoming' | 'requested'
}

interface SessionsTableProps {
  onEdit: (id: string, data: Partial<Session>) => void;
  onDelete: (id: string) => void;
  onAddLink: (id: string, link: string) => void;
}

const parseIsoStringForComparison = (isoString: string): Date => {
  const parsedDate = new Date(isoString);
  if (isNaN(parsedDate.getTime())) {
    console.error(
      `Failed to parse ISO string: "${isoString}". Returning Invalid Date.`
    );
    return new Date("Invalid Date");
  }
  return parsedDate;
};

const getDateCategory = (dateString: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sessionDate = new Date(dateString);
  sessionDate.setHours(0, 0, 0, 0);

  if (sessionDate.getTime() === today.getTime()) {
    return 0;
  } else if (sessionDate.getTime() > today.getTime()) {
    return 1;
  } else {
    return 2;
  }
};

export function SessionsTable({
  onEdit,
  onDelete,
  onAddLink,
}: SessionsTableProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [meetLink, setMeetLink] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all"); // 'all', 'completed', 'pending', 'waitingToComplete', 'requested'

  const fetchSessions = useCallback(async () => {
    try {
      let queryParams = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
      });

      let backendStatusFilter = filterStatus;
      if (filterStatus === "waitingToComplete") {
        backendStatusFilter = "pending";
      } else if (filterStatus === "all") {
        backendStatusFilter = "";
      }

      if (backendStatusFilter) {
        queryParams.append("status", backendStatusFilter);
      }

      const response = await fetch(`/api/schedule?${queryParams.toString()}`);
      const data = await response.json();

      let sessionsToProcess = data.schedules;

      if (filterStatus === "waitingToComplete") {
        const now = new Date();
        sessionsToProcess = sessionsToProcess.filter((session: Session) => {
          const sessionEndTime = parseIsoStringForComparison(session.endTime);
          return session.status === "pending" && sessionEndTime <= now;
        });
      }

      const sortedSessions = sessionsToProcess.sort(
        (a: Session, b: Session) => {
          const categoryA = getDateCategory(a.date);
          const categoryB = getDateCategory(b.date);

          if (categoryA !== categoryB) {
            return categoryA - categoryB;
          }

          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          const dateComparison = dateA.getTime() - dateB.getTime();
          if (dateComparison !== 0) {
            return dateComparison;
          }

          const timeA = parseIsoStringForComparison(a.startTime);
          const timeB = parseIsoStringForComparison(b.startTime);

          return timeA.getTime() - timeB.getTime(); // Earliest time first
        }
      );

      setSessions(sortedSessions);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  }, [currentPage, searchTerm, filterStatus]);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => fetchSessions(), 60000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid ISO string for formatTime:", isoString);
      return isoString;
    }
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleDeleteClick = (session: any) => {
    setSelectedSession(session);
    setDeleteModalOpen(true);
  };

  const handleEditClick = (session: any) => {
    setSelectedSession(session);
    setEditModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedSession) {
      onDelete(selectedSession.id);
      setDeleteModalOpen(false);
      setSelectedSession(null);
    }
  };

  const handleConfirmEdit = (data: Partial<Session>) => {
    if (selectedSession) {
      onEdit(selectedSession.id, data);
      setEditModalOpen(false);
      setSelectedSession(null);
    }
  };

  const handleAddLink = async (id: string) => {
    try {
      console.log(id, meetLink);
      onAddLink(id, meetLink);
      fetchSessions();
    } catch (e) {
      console.log("Error on:", e);
    }
  };

  const handleStatus = async () => {};

  const handleAttended = async (data: Partial<Session>) => {
    if (selectedSession) {
      onEdit(selectedSession.id, data);
      setEditModalOpen(false);
      setSelectedSession(null);
    }
  };
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Input
          placeholder="Search by subject..."
          value={searchTerm}
          onChange={handleSearch}
          className="flex-grow"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Filter:{" "}
              {filterStatus === "all"
                ? "All Sessions"
                : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterStatus("all")}>
              All Sessions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("requested")}>
              Requested
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterStatus("waitingToComplete")}
            >
              Waiting to Complete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Added responsive wrapper for the table */}
      <div className="overflow-x-auto">
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
              <TableHead>Attended</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  {new Date(session.date).toLocaleDateString()}
                </TableCell>
                {/* Removed inline style for responsiveness */}
                <TableCell style={{ width: "150px", whiteSpace: "nowrap" }}>
                  {`${formatTime(session.startTime)} - ${formatTime(session.endTime)}`}
                </TableCell>
                <TableCell>{session.sessionType}</TableCell>
                <TableCell>{session.scheduleSubject}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage
                        src={session.trainer?.image || "/pfp.jpg"}
                        alt={session.trainer.name}
                      />
                      <AvatarFallback>
                        {session.trainer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {session.trainer.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage
                        src={session.user.image || "/pfp.jpg"}
                        alt={session.user.name}
                      />
                      <AvatarFallback>
                        {session.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {session.user.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${
                        session.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : session.status === "requested"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {session.status.charAt(0).toUpperCase() +
                      session.status.slice(1)}
                  </div>
                </TableCell>
                <TableCell>
                  {session.status !== "completed" &&
                    session.status !== "requested" &&
                    (session.scheduleLink ? (
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          window.open(session.scheduleLink, "_blank")
                        }
                      >
                        <Video className="h-4 w-4" />
                        <span>Join</span>
                      </Button>
                    ) : (
                      <div className="flex justify-between gap-2">
                        <Button
                          variant="default"
                          className="px-3 py-1"
                          onClick={() => handleEditClick(session)}
                        >
                          Add Link
                        </Button>
                      </div>
                    ))}
                </TableCell>

                <TableCell>
                  {session.status === "completed" && session.attended ? (
                    <span className="text-green-500 text-xs">Completed</span>
                  ) : session.status === "pending" && session.attended ? (
                    <span className="text-yellow-500 text-xs">
                      Pending Completion
                    </span>
                  ) : session.status === "pending" && !session.attended ? (
                    parseIsoStringForComparison(session.endTime) <=
                    new Date() ? (
                      <Button
                        variant="default"
                        onClick={() => onEdit(session.id, { attended: true })}
                      >
                        Done
                      </Button>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        Waiting to Complete
                      </span>
                    )
                  ) : (
                    <span className="text-gray-400 text-xs">Unknown</span>
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
                      <DropdownMenuItem
                        onClick={() => handleEditClick(session)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(session)}
                      >
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
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </Button>
        <span className="mx-2">
          Page {currentPage} of {totalPages}
        </span>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </Button>
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
  );
}
