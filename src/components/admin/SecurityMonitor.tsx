import { useState, useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Shield, AlertTriangle, Activity, Clock } from "lucide-react"

import { getRecentLoginActivities, LoginActivity } from "@/utils/loginActivityUtils"
import { useToast } from "@/hooks/use-toast"

const SecurityMonitor = () => {

  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>([])
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()

  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = async () => {

    try {

      const activities = await getRecentLoginActivities(20)

      setLoginActivities(activities || [])

    } catch (error) {

      console.error("Security Monitor Error:", error)

      toast({
        title: "Security Data Error",
        description: "Could not load security monitoring data.",
        variant: "destructive"
      })

    } finally {

      setLoading(false)

    }
  }

  const getStatusBadge = (status?: string) => {

    if (status === "success") {

      return (
        <Badge className="bg-green-500 text-white">
          Success
        </Badge>
      )
    }

    return (
      <Badge variant="destructive">
        Failed
      </Badge>
    )
  }

  const formatDateTime = (isoString?: string) => {

    if (!isoString) return "Unknown"

    try {
      return new Date(isoString).toLocaleString()
    } catch {
      return "Invalid Date"
    }
  }

  const recentFailures = loginActivities.filter(
    (a) => a?.status === "failed"
  ).length

  const recentSuccesses = loginActivities.filter(
    (a) => a?.status === "success"
  ).length

  if (loading) {

    return (

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Monitor
          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="flex justify-center py-8 text-gray-500">
            Loading security data...
          </div>

        </CardContent>

      </Card>

    )
  }

  return (

    <div className="space-y-6">

      {/* STATISTICS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <Card>

          <CardContent className="p-4">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-600">
                  Recent Logins
                </p>

                <p className="text-2xl font-bold text-green-600">
                  {recentSuccesses}
                </p>
              </div>

              <Activity className="h-8 w-8 text-green-600" />

            </div>

          </CardContent>

        </Card>

        <Card>

          <CardContent className="p-4">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-600">
                  Failed Attempts
                </p>

                <p className="text-2xl font-bold text-red-600">
                  {recentFailures}
                </p>
              </div>

              <AlertTriangle className="h-8 w-8 text-red-600" />

            </div>

          </CardContent>

        </Card>

        <Card>

          <CardContent className="p-4">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-600">
                  Total Activities
                </p>

                <p className="text-2xl font-bold text-blue-600">
                  {loginActivities.length}
                </p>
              </div>

              <Clock className="h-8 w-8 text-blue-600" />

            </div>

          </CardContent>

        </Card>

      </div>

      {/* SECURITY ALERT */}

      {recentFailures > 5 && (

        <Alert className="border-red-500">

          <AlertTriangle className="h-4 w-4 text-red-600" />

          <AlertDescription>

            High number of failed login attempts detected.  
            Please review your system security.

          </AlertDescription>

        </Alert>

      )}

      {/* LOGIN ACTIVITY LIST */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Recent Login Activities
          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="space-y-3">

            {loginActivities.length === 0 ? (

              <p className="text-gray-500 text-center py-6">
                No login activities found.
              </p>

            ) : (

              loginActivities.map((activity) => (

                <div
                  key={activity?.id || activity?.loginTime}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >

                  <div className="flex-1">

                    <div className="flex items-center space-x-2">

                      <span className="font-medium">
                        {activity?.email || "Unknown"}
                      </span>

                      {getStatusBadge(activity?.status)}

                    </div>

                    <div className="text-sm text-gray-500 mt-1">

                      <p>
                        Time: {formatDateTime(activity?.loginTime)}
                      </p>

                      {activity?.failureReason && (

                        <p className="text-red-600">
                          Reason: {activity.failureReason}
                        </p>

                      )}

                      {activity?.userAgent && (

                        <p className="truncate max-w-md">
                          Device: {activity.userAgent}
                        </p>

                      )}

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>

        </CardContent>

      </Card>

    </div>

  )
}

export default SecurityMonitor
