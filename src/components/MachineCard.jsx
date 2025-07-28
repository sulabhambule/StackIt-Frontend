"use client"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Thermometer, Wrench, Clock } from "lucide-react"

const MachineCard = ({ machine }) => {
  const navigate = useNavigate()

  const getStatusInfo = () => {
    if (machine.failure) {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        badge: { text: "FAILURE", color: "bg-red-100 text-red-800 border-red-200" },
        borderColor: "border-red-200 hover:border-red-300",
      }
    }
    return {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      badge: { text: "HEALTHY", color: "bg-green-100 text-green-800 border-green-200" },
      borderColor: "border-green-200 hover:border-green-300",
    }
  }

  const status = getStatusInfo()

  return (
    <Card
      onClick={() => navigate(`/machine/${machine.id}`)}
      className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${status.borderColor} hover:scale-[1.02]`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{machine.name}</h3>
            <p className="text-sm text-gray-500">ID: {machine.id}</p>
          </div>
          <Badge variant="outline" className={status.badge.color}>
            {status.badge.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">{machine.airTemp}K</div>
              <div className="text-xs text-gray-500">Air Temp</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Wrench className="h-4 w-4 text-orange-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">{machine.toolWear} min</div>
              <div className="text-xs text-gray-500">Tool Wear</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {status.icon}
            <span className={`text-sm font-medium ${machine.failure ? "text-red-600" : "text-green-600"}`}>
              {machine.failure ? "Needs Attention" : "Operating Normal"}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Live</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MachineCard
