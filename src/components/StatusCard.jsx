import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock, Wrench } from "lucide-react"

export default function StatusCard({ isFailure, uptime, nextMaintenance, operationalHours }) {
  const getStatusInfo = () => {
    if (isFailure) {
      return {
        icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
        title: "Machine Failure Detected",
        subtitle: "Immediate attention required",
        bgColor: "bg-red-50 border-red-200",
        textColor: "text-red-800",
        badgeColor: "bg-red-100 text-red-800 border-red-200",
      }
    }
    return {
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      title: "Machine Operating Normally",
      subtitle: "All systems functioning properly",
      bgColor: "bg-green-50 border-green-200",
      textColor: "text-green-800",
      badgeColor: "bg-green-100 text-green-800 border-green-200",
    }
  }

  const status = getStatusInfo()

  return (
    <Card className={`border-2 ${status.bgColor} hover:shadow-md transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {status.icon}
            <div>
              <h3 className={`text-xl font-bold ${status.textColor}`}>{status.title}</h3>
              <p className="text-sm text-gray-600">{status.subtitle}</p>
            </div>
          </div>
          <Badge variant="outline" className={status.badgeColor}>
            {isFailure ? "CRITICAL" : "HEALTHY"}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-blue-500 mr-1" />
            </div>
            <div className="text-lg font-semibold text-gray-900">{uptime || "99.2"}%</div>
            <div className="text-xs text-gray-500">Uptime</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Wrench className="h-5 w-5 text-orange-500 mr-1" />
            </div>
            <div className="text-lg font-semibold text-gray-900">{nextMaintenance || "7"} days</div>
            <div className="text-xs text-gray-500">Next Maintenance</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
            </div>
            <div className="text-lg font-semibold text-gray-900">{operationalHours || "1,247"}h</div>
            <div className="text-xs text-gray-500">Operational Hours</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
