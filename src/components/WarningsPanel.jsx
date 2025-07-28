import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react"

export default function WarningsPanel({ warnings }) {
  const getWarningIcon = (warning) => {
    if (warning.includes("⚠️")) return <AlertTriangle className="h-4 w-4 text-amber-500" />
    if (warning.includes("🔴")) return <AlertCircle className="h-4 w-4 text-red-500" />
    return <Info className="h-4 w-4 text-blue-500" />
  }

  const getWarningLevel = (warning) => {
    if (warning.includes("unsafe") || warning.includes("failure")) return "critical"
    if (warning.includes("high") || warning.includes("low")) return "warning"
    return "info"
  }

  const getBadgeColor = (level) => {
    switch (level) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "warning":
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  if (!warnings || warnings.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">All Systems Normal</h3>
              <p className="text-sm text-green-600">No warnings or alerts detected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <CardTitle className="text-lg font-semibold text-amber-800">System Alerts ({warnings.length})</CardTitle>
          </div>
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
            {warnings.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {warnings.map((warning, idx) => {
            const level = getWarningLevel(warning)
            const cleanWarning = warning.replace(/[⚠️🔴]/g, "").trim()

            return (
              <div key={idx} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                {getWarningIcon(warning)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{cleanWarning}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className={getBadgeColor(level)}>
                      {level.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
