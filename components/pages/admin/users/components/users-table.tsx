"use client"

import { useState, useEffect, useId, useCallback } from "react"
import { Search, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddUserModal } from "./add-user-modal"
import { EditUserModal } from "./edit-user-modal"
import { DeleteUserModal } from "./delete-user-modal"
import Image from "next/image"

interface User {
  id: string
  name: string
  email: string
  phone: string
  status: "ACTIVE" | "INACTIVE"
  membership: "BASIC" | "PREMIUM" | null
  image: string | null
  createdAt: string
  trainer: {
    id: string
    name: string
  } | null
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export function UsersTable() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const searchInputId = useId()
  const addUserButtonId = useId()
  const previousButtonId = useId()
  const nextButtonId = useId()

  const fetchUsers = useCallback(async (page: number, search = "") => {
    try {
      const response = await fetch(`/api/users/user?page=${page}&limit=10&search=${search}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }, [])

  useEffect(() => {
    fetchUsers(1)
  }, [fetchUsers])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    fetchUsers(1, e.target.value)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsEditUserOpen(true)
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setIsDeleteUserOpen(true)
  }

  const formatMembership = (membership: "BASIC" | "PREMIUM" | null): string => {
    if (!membership) return "N/A"
    return membership.toLowerCase()
  }

  const formatStatus = (status: "ACTIVE" | "INACTIVE" | null): string => {
    if (!status) return "unknown"
    return status.toLowerCase()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={searchInputId}
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Button id={addUserButtonId} onClick={() => setIsAddUserOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Trainer</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <Image
                        src={user.image || "/pfp.jpg"}
                        alt={user.name}
                        height={40}
                        width={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <Image
                        src="/pfp.jpg"
                        alt={user.name}
                        height={40}
                        width={40}
                        className="rounded-full object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize">{user?.phone ? user.phone : "N/A"}</span>
                </TableCell>
                <TableCell>
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {formatStatus(user.status)}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize">{formatMembership(user.membership)}</span>
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{user.trainer ? user.trainer.name : "N/A"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="link" className="text-blue-500" onClick={() => handleEdit(user)}>
                      Edit
                    </Button>
                    <Button variant="link" className="text-red-500" onClick={() => handleDelete(user)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
        </p>
        <div className="flex items-center gap-2">
          <Button
            id={previousButtonId}
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(pagination.page - 1, searchTerm)}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <Button
            id={nextButtonId}
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(pagination.page + 1, searchTerm)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      <AddUserModal
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        onSuccess={() => fetchUsers(pagination.page, searchTerm)}
      />
      {selectedUser && (
        <>
          <EditUserModal
            open={isEditUserOpen}
            onOpenChange={setIsEditUserOpen}
            user={selectedUser}
            onSuccess={() => {
              fetchUsers(pagination.page, searchTerm)
              setSelectedUser(null)
            }}
          />
          <DeleteUserModal
            open={isDeleteUserOpen}
            onOpenChange={setIsDeleteUserOpen}
            user={selectedUser}
            onSuccess={() => {
              fetchUsers(pagination.page, searchTerm)
              setSelectedUser(null)
            }}
          />
        </>
      )}
    </div>
  )
}