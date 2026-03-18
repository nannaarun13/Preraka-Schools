import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { UserPlus, Check, X, Loader2, UserX, UserCheck, Trash2 } from 'lucide-react'
import { getAdminRequests, AdminUser } from '@/utils/authUtils'
import { auth, db } from '@/lib/firebase'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const SUPER_ADMIN_EMAIL = "arunnanna3@gmail.com"

const AdminRequestManager = () => {

  const { toast } = useToast()

  const [adminRequests, setAdminRequests] = useState<AdminUser[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)

  const loadRequests = async () => {

    setListLoading(true)

    try {

      const requests = await getAdminRequests()

      setAdminRequests(requests)

    } catch (error) {

      toast({
        title: "Error loading requests",
        description: "Could not fetch the list of admin requests.",
        variant: "destructive"
      })

    }

    setListLoading(false)

  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleDeleteRequest = async (request: AdminUser) => {

    if (request.email === SUPER_ADMIN_EMAIL) {

      toast({
        title: "Protected Account",
        description: "Super Admin cannot be deleted.",
        variant: "destructive"
      })

      return
    }

    setActionLoading(true)

    try {

      await deleteDoc(doc(db, 'admins', request.id))

      toast({
        title: "Request Deleted",
        description: `Admin request for ${request.email} has been permanently deleted.`,
      })

      await loadRequests()

    } catch (error) {

      toast({
        title: "Error",
        description: "Failed to delete admin request.",
        variant: "destructive"
      })

    }

    setActionLoading(false)

  }

  const handleApproval = async (request: AdminUser, approved: boolean) => {

    if (!approved && request.email === SUPER_ADMIN_EMAIL) {

      toast({
        title: "Protected Account",
        description: "Super Admin request cannot be rejected.",
        variant: "destructive"
      })

      return
    }

    setActionLoading(true)

    try {

      const currentUser = auth.currentUser
      const currentAdminEmail = currentUser?.email

      if (approved) {

        if (request.status === 'pending') {

          await updateDoc(doc(db, 'admins', request.id), {
            status: 'approved',
            approvedAt: new Date().toISOString(),
            approvedBy: currentAdminEmail || 'System',
          })

          toast({
            title: "Request Approved",
            description: "Admin access granted.",
          })

        }

        if (request.status === 'revoked') {

          await updateDoc(doc(db, 'admins', request.id), {
            status: 'approved',
            reapprovedAt: new Date().toISOString(),
            reapprovedBy: currentAdminEmail || 'System',
            revokedAt: null,
            revokedBy: null,
          })

          toast({
            title: "Access Re-approved",
            description: "Admin access restored.",
          })

        }

      } else {

        await updateDoc(doc(db, 'admins', request.id), {
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectedBy: currentAdminEmail || 'System',
        })

        toast({
          title: "Request Rejected",
          description: "Admin request rejected.",
          variant: "destructive"
        })

      }

      await loadRequests()

    } catch {

      toast({
        title: "Error",
        description: "Failed to update request status.",
        variant: "destructive"
      })

    }

    setActionLoading(false)

  }

  const handleRemoveAccess = async (request: AdminUser) => {

    if (request.email === SUPER_ADMIN_EMAIL) {

      toast({
        title: "Protected Account",
        description: "Super Admin access cannot be revoked.",
        variant: "destructive"
      })

      return
    }

    setActionLoading(true)

    try {

      const currentUser = auth.currentUser
      const currentAdminEmail = currentUser?.email

      await updateDoc(doc(db, 'admins', request.id), {
        status: 'revoked',
        revokedAt: new Date().toISOString(),
        revokedBy: currentAdminEmail || 'System',
      })

      toast({
        title: "Access Revoked",
        description: "Admin access revoked.",
      })

      await loadRequests()

    } catch {

      toast({
        title: "Error",
        description: "Failed to revoke admin access.",
        variant: "destructive"
      })

    }

    setActionLoading(false)

  }

  const validRequests = adminRequests.filter(r => r && r.status)

  return (

    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <h2 className="text-2xl font-bold text-gray-800">
          Admin Access Requests
        </h2>

      </div>

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <UserPlus className="h-5 w-5" />

            Admin Access Requests

          </CardTitle>

        </CardHeader>

        <CardContent>

          {listLoading ? (

            <div className="flex justify-center items-center py-8">

              <Loader2 className="h-8 w-8 animate-spin text-school-blue" />

            </div>

          ) : (

            <Table>

              <TableHeader>

                <TableRow>

                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Actions</TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {validRequests.map((request) => (

                  <TableRow key={request.id}>

                    <TableCell>

                      {request.firstName} {request.lastName}

                    </TableCell>

                    <TableCell>

                      {request.email}

                      {request.email === SUPER_ADMIN_EMAIL && (

                        <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">

                          SUPER ADMIN

                        </span>

                      )}

                    </TableCell>

                    <TableCell>

                      {request.phone}

                    </TableCell>

                    <TableCell>

                      {request.status}

                    </TableCell>

                    <TableCell>

                      {new Date(request.requestedAt).toLocaleDateString()}

                    </TableCell>

                    <TableCell>

                      <div className="flex space-x-2">

                        {request.status === "pending" && (

                          <>
                            <Button
                              size="sm"
                              disabled={actionLoading}
                              onClick={() => handleApproval(request, true)}
                            >
                              <Check className="h-4 w-4"/>
                            </Button>

                            {request.email !== SUPER_ADMIN_EMAIL && (
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={actionLoading}
                                onClick={() => handleApproval(request, false)}
                              >
                                <X className="h-4 w-4"/>
                              </Button>
                            )}
                          </>

                        )}

                        {request.status === "approved" && request.email !== SUPER_ADMIN_EMAIL && (

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionLoading}
                            onClick={() => handleRemoveAccess(request)}
                          >
                            <UserX className="h-4 w-4"/>
                          </Button>

                        )}

                        {request.email !== SUPER_ADMIN_EMAIL && (

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionLoading}
                            onClick={() => handleDeleteRequest(request)}
                          >
                            <Trash2 className="h-4 w-4"/>
                          </Button>

                        )}

                      </div>

                    </TableCell>

                  </TableRow>

                ))}

              </TableBody>

            </Table>

          )}

        </CardContent>

      </Card>

    </div>

  )

}

export default AdminRequestManager
