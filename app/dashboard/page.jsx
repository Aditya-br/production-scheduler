"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, FileText, Calendar, BarChart3 } from "lucide-react"
import SalesReportForm from "../components/SalesReportForm"
import ProductionSchedule from "../components/ProductionSchedule"
import Dashboard from "../components/Dashboard"

export default function DashboardPage() {
  const [user, setUser] = useState("")
  const [salesData, setSalesData] = useState([])
  const [productionSchedule, setProductionSchedule] = useState([])
  const [loading, setLoading] = useState(true) // NEW: controls safe rendering
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAuthenticated")
    const username = localStorage.getItem("username")

    if (isLoggedIn !== "true") {
      router.push("/")
      return
    }

    setUser(username)

    const savedSalesData = localStorage.getItem("salesData")
    const savedSchedule = localStorage.getItem("productionSchedule")

    if (savedSalesData) {
      setSalesData(JSON.parse(savedSalesData))
    }
    if (savedSchedule) {
      setProductionSchedule(JSON.parse(savedSchedule))
    }

    setLoading(false) // auth check complete
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("username")
    router.push("/")
  }

  const handleSalesDataSubmit = (newSalesData) => {
    setSalesData(newSalesData)
    localStorage.setItem("salesData", JSON.stringify(newSalesData))

    const generatedSchedule = generateProductionSchedule(newSalesData)
    setProductionSchedule(generatedSchedule)
    localStorage.setItem("productionSchedule", JSON.stringify(generatedSchedule))
  }

  const generateProductionSchedule = (salesData) => {
    return salesData.map((item, index) => ({
      id: index + 1,
      product: item.product,
      quantity: Math.ceil(item.quantity * 1.1),
      startDate: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      endDate: new Date(Date.now() + (index + 2) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      priority: item.priority || "Medium",
      status: "Scheduled",
    }))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Production Scheduler</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user}</span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="sales-report" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Sales Report</span>
            </TabsTrigger>
            <TabsTrigger value="production-schedule" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Production Schedule</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard salesData={salesData} productionSchedule={productionSchedule} />
          </TabsContent>

          <TabsContent value="sales-report">
            <Card>
              <CardHeader>
                <CardTitle>Sales Report Input</CardTitle>
                <CardDescription>Enter your sales data to generate production schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <SalesReportForm onSubmit={handleSalesDataSubmit} initialData={salesData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="production-schedule">
            <Card>
              <CardHeader>
                <CardTitle>Production Schedule</CardTitle>
                <CardDescription>Generated production schedule based on sales data</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductionSchedule schedule={productionSchedule} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
