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
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    const role = (typeof window !== "undefined" && localStorage.getItem("npw_role")) || "customer"
    if (!session) router.replace("/auth/signin")
    else if (role !== "provider") router.replace("/dashboard?role=customer")
  }, [session, status, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/services/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Dev-only header to authenticate to DRF
          "X-User-Email": session?.user?.email || "",
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          base_price: form.base_price,
          pricing_type: form.pricing_type,
          location: form.location,
          category: Number(form.category) || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
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
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Service"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


