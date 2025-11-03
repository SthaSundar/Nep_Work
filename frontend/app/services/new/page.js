"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewServicePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [form, setForm] = useState({
    title: "",
    description: "",
    base_price: "",
    pricing_type: "fixed",
    location: "",
    category: "",
    certificates: "",
    degrees: "",
    time_slots: [],
    certificate_photo: null,
    certificate_description: "",
    degree_photo: null,
    degree_description: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    const role = (typeof window !== "undefined" && localStorage.getItem("npw_role")) || "customer"
    if (!session) router.replace("/auth/signin")
    else if (role !== "provider") router.replace("/dashboard?role=customer")
    else {
      // Check KYC status
      const checkKYC = async () => {
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("npw_token") : null
          const headers = { "Content-Type": "application/json" }
          if (token) {
            headers["Authorization"] = `Bearer ${token}`
          }

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/kyc/status/`, { headers })
          if (res.ok) {
            const data = await res.json()
            if (data.status !== "approved") {
              setError("KYC verification required to post services. Please complete your KYC verification first.")
              setTimeout(() => router.push("/kyc"), 2000)
            }
          }
        } catch (e) {
          console.error("Failed to check KYC", e)
        }
      }
      checkKYC()
    }
  }, [session, status, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleFile = (name, file) => {
    setForm((f) => ({ ...f, [name]: file }))
  }

  const addTimeSlot = () => {
    setForm((f) => ({ ...f, time_slots: [...(f.time_slots || []), ""] }))
  }

  const updateTimeSlot = (idx, value) => {
    setForm((f) => ({ ...f, time_slots: f.time_slots.map((t, i) => i === idx ? value : t) }))
  }

  const removeTimeSlot = (idx) => {
    setForm((f) => ({ ...f, time_slots: f.time_slots.filter((_, i) => i !== idx) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("npw_token") : null
      const headers = {}
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      } else {
        headers["X-User-Email"] = session?.user?.email || ""
      }

      const body = new FormData()
      body.append("title", form.title)
      body.append("description", form.description)
      body.append("base_price", form.base_price)
      body.append("pricing_type", form.pricing_type)
      body.append("location", form.location)
      if (form.category) body.append("category", String(Number(form.category)))
      if (form.certificates) body.append("certificates", form.certificates)
      if (form.degrees) body.append("degrees", form.degrees)
      if (form.time_slots && form.time_slots.length) body.append("time_slots", JSON.stringify(form.time_slots))
      if (form.certificate_photo) body.append("certificate_photo", form.certificate_photo)
      if (form.certificate_description) body.append("certificate_description", form.certificate_description)
      if (form.degree_photo) body.append("degree_photo", form.degree_photo)
      if (form.degree_description) body.append("degree_description", form.degree_description)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/services/create/`, {
        method: "POST",
        headers,
        body,
      })
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data.kyc_required) {
          router.push("/kyc")
          throw new Error("KYC verification required to post services. Redirecting to KYC form...")
        }
        throw new Error(data?.detail || "Failed to create service")
      }
      router.push("/dashboard?role=provider")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Service</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <Input name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded p-2" rows={4} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Base Price</label>
                <Input type="number" step="0.01" name="base_price" value={form.base_price} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium">Pricing Type</label>
                <select name="pricing_type" value={form.pricing_type} onChange={handleChange} className="w-full border rounded p-2">
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Location</label>
                <Input name="location" value={form.location} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium">Category ID</label>
                <Input name="category" value={form.category} onChange={handleChange} placeholder="e.g. 1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Certificates</label>
              <textarea 
                name="certificates" 
                value={form.certificates} 
                onChange={handleChange} 
                className="w-full border rounded p-2" 
                rows={3}
                placeholder="List your certificates (e.g., AWS Certified, Google Cloud Professional, etc.)"
              />
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm">Certificate Photo (optional)</label>
                <input type="file" accept="image/*" onChange={(e) => handleFile("certificate_photo", e.target.files?.[0] || null)} />
              </div>
              <div>
                <label className="block text-sm">Certificate Description (optional)</label>
                <Input name="certificate_description" value={form.certificate_description} onChange={handleChange} />
              </div>
            </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Degrees & Qualifications</label>
              <textarea 
                name="degrees" 
                value={form.degrees} 
                onChange={handleChange} 
                className="w-full border rounded p-2" 
                rows={3}
                placeholder="List your educational degrees and qualifications (e.g., B.Sc. Computer Science, M.Sc. Engineering, etc.)"
              />
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm">Degree Photo (optional)</label>
                <input type="file" accept="image/*" onChange={(e) => handleFile("degree_photo", e.target.files?.[0] || null)} />
              </div>
              <div>
                <label className="block text-sm">Degree Description (optional)</label>
                <Input name="degree_description" value={form.degree_description} onChange={handleChange} />
              </div>
            </div>
            </div>
          <div>
            <label className="block text-sm font-medium mb-1">Available Time Slots</label>
            <div className="space-y-2">
              {(form.time_slots || []).map((t, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={t} onChange={(e) => updateTimeSlot(i, e.target.value)} placeholder="e.g., Mon-Fri 10:00-18:00" />
                  <Button type="button" variant="outline" onClick={() => removeTimeSlot(i)}>Remove</Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTimeSlot}>Add Time Slot</Button>
            </div>
          </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Service"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


