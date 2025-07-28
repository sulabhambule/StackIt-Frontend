"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Settings, RefreshCw } from "lucide-react"

export default function Header({ productQuality, machineId, lastUpdated, onRefresh }) {
  const getQualityBadge = (quality) => {
    if (quality >= 95) return { color: "bg-green-100 text-green-800 border-green-200", label: "Excellent" }
    if (quality >= 85) return { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Good" }
    if (quality >= 70) return { color: "bg-amber-100 text-amber-800 border-amber-200", label: "Fair" }
    return { color: "bg-red-100 text-red-800 border-red-200", label: "Poor" }
  }

  const qualityInfo = getQualityBadge(productQuality)

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50 to-blue-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Predictive Maintenance Dashboard</h1>
            {machineId && (
              <div className="flex items-center space-x-4">
                <span className="text-lg text-gray-600">
                  Machine: <span className="font-semibold text-gray-900">{machineId}</span>
                </span>
                {lastUpdated && (
                  <span className="text-sm text-gray-500">
                    Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Product Quality</div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">{productQuality}%</span>
                <Badge variant="outline" className={qualityInfo.color}>
                  {qualityInfo.label}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
