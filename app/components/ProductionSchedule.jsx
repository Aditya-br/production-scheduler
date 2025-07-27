"use client"

import { useState } from "react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import MultiSelect from "./MultiSelect"
import DaysSelect from "./DaysSelect"
import ProductionCalendar from "./Calendar"

export default function ProductionSchedule() {
  const [showcal, setshowcal] = useState(false)
  const [LeaveDays, setLeaveDays] = useState([]);
  const [SpecialLeaveDays, setSpecialLeaveDays] = useState([]);
  const [disable, setdisable] = useState(false)
  const [credentials, setCredentials] = useState({ totalhours: "", workingdays: "" })
  const [error, setError] = useState(null)
  const [plan, setPlan] = useState([])

  const generateplan = async (e) => {
    e.preventDefault()
    const { totalhours, workingdays } = credentials

    if (Number(totalhours) > 24) {
      setError("Total hours per day cannot exceed 24.")
      return
    }
    if (Number(workingdays) > 7) {
      setError("Total working days cannot exceed 7.")
      return
    }
    if (Number(workingdays) < 7 && LeaveDays.length == 0) {
      setError("Please select the leave days.");
      return;
    }
    else if (Number(workingdays) < 7 && LeaveDays.length != (7 - Number(workingdays))) {
      setError("Please select the correct number of leave days.");
      return;
    }
    setshowcal(true);
    try {
      const response = await fetch("http://localhost:8080/generateplan", {
        method: "POST",
        body: JSON.stringify({ totalhours, workingdays }),
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate plan")
      }

      setPlan(data.plan)
      setError(null)
      window.alert("Production plan generated successfully!")
    } catch (err) {
      console.error(err)
      setError(err.message)
    }
  }
  useEffect(() => {
    const workingdays = Number(credentials.workingdays);
    if (workingdays >= 7) {
      setdisable(true);
    } else {
      setdisable(false);
    }
  }, [credentials.workingdays]);

  const [workingDayDates, setWorkingDayDates] = useState([]);

  useEffect(() => {
  if (showcal && LeaveDays && SpecialLeaveDays && credentials.workingdays) {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const workingDates = [];

    const specialDayNumbers = SpecialLeaveDays.map(Number);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

      if (
        !LeaveDays.includes(dayOfWeek) &&
        !specialDayNumbers.includes(day)
      ) {
        workingDates.push(date);
      }
    }

    setWorkingDayDates(workingDates);
  }
}, [showcal, LeaveDays, SpecialLeaveDays, credentials.workingdays]);
  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Thangam Dhotis</CardTitle>
          <CardDescription>Generate your production schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={generateplan} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totalhours">Hours Per Day</Label>
              <Input
                id="totalhours"
                type="number"
                value={credentials.totalhours}
                onChange={(e) => setCredentials({ ...credentials, totalhours: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workingdays">Total Working Days</Label>
              <Input
                id="workingdays"
                type="number"
                value={credentials.workingdays}
                onChange={(e) => setCredentials({ ...credentials, workingdays: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Select the Leave Days</Label>
              <MultiSelect disabled={disable} onChange={setLeaveDays} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Special Holidays</Label>
              <DaysSelect onChange={setSpecialLeaveDays} />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              Generate the plan
            </Button>
          </form>
        </CardContent>
      </Card>

      {plan.length > 0 && (
        <div className="w-full max-w-4xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Allocated Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.percentage}</TableCell>
                  <TableCell>{item.hoursAllocated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {showcal && <ProductionCalendar LeaveDays={LeaveDays} SpecialLeaveDays={SpecialLeaveDays} />}

    </div>
  )
}
