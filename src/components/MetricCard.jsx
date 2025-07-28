import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export default function MetricCard({ title, value, unit, subtitle, trend, status, threshold }) {
  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getStatusColor = () => {
    if (status === "critical") return "bg-red-100 text-red-800 border-red-200"
    if (status === "warning") return "bg-amber-100 text-amber-800 border-amber-200"
    return "bg-green-100 text-green-800 border-green-200"
  }

  return (
    <Card className="relative overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          {status && (
            <Badge variant="outline" className={getStatusColor()}>
              {status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {value}
              <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
            </div>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {trend !== undefined && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span
                className={`text-xs font-medium ${
                  trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-400"
                }`}
              >
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        {threshold && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${
                value > threshold * 0.8 ? "bg-red-500" : value > threshold * 0.6 ? "bg-amber-500" : "bg-green-500"
              }`}
              style={{ width: `${Math.min((value / threshold) * 100, 100)}%` }}
            ></div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
