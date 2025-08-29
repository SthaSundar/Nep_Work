"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function ServicesList({ role, session }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    useEffect(() => {
        const run = async () => {
            setLoading(true)
            try {
                const url = role === "provider"
                    ? `${process.env.NEXT_PUBLIC_API_URL}/services/services/my/`
                    : `${process.env.NEXT_PUBLIC_API_URL}/services/services/`
                const res = await fetch(url, {
                    headers: role === "provider" ? { "X-User-Email": session?.user?.email || "" } : {},
                })
                const data = await res.json()
                setItems(Array.isArray(data) ? data : [])
            } catch {
                setItems([])
            } finally {
                setLoading(false)
            }
        }
        run()
    }, [role, session])

    const handleRequest = async (serviceId) => {
        setError("")
        setSuccess("")
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/create/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Email": session?.user?.email || "",
                },
                body: JSON.stringify({ service: serviceId }),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data?.detail || "Failed to request booking")
            }
            setSuccess("Booking requested")
        } catch (e) {
            setError(e.message)
        }
    }

    if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>
    if (!items.length) return <p className="text-sm text-muted-foreground">No services found.</p>

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(error || success) && (
                <div className="md:col-span-2 lg:col-span-3">
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {success && <p className="text-sm text-green-600">{success}</p>}
                </div>
            )}
            {items.map((s) => (
                <Card key={s.id}>
                    <CardHeader>
                        <CardTitle>{s.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{s.description?.slice(0, 100)}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-blue-600">Rs. {s.base_price}</span>
                            {role === "provider" ? (
                                <Button variant="outline" size="sm">Edit</Button>
                            ) : (
                                <Button size="sm" onClick={() => handleRequest(s.id)}>Request</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function BookingsList({ role, session }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    useEffect(() => {
        const run = async () => {
            setLoading(true)
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/mine/`, {
                    headers: { "X-User-Email": session?.user?.email || "" },
                })
                const data = await res.json()
                setItems(Array.isArray(data) ? data : [])
            } catch {
                setItems([])
            } finally {
                setLoading(false)
            }
        }
        run()
    }, [session])

    const submitRating = async (bookingId, rating, review) => {
        setError("")
        setSuccess("")
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/rate/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Email": session?.user?.email || "",
                },
                body: JSON.stringify({ rating, review }),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data?.detail || "Failed to submit rating")
            }
            setSuccess("Thanks for your review!")
            const refreshed = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/mine/`, {
                headers: { "X-User-Email": session?.user?.email || "" },
            }).then((r) => r.json()).catch(() => [])
            setItems(Array.isArray(refreshed) ? refreshed : [])
        } catch (e) {
            setError(e.message)
        }
    }

    if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>
    if (!items.length) return <p className="text-sm text-muted-foreground">No bookings yet.</p>

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(error || success) && (
                <div className="md:col-span-2 lg:col-span-3">
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {success && <p className="text-sm text-green-600">{success}</p>}
                </div>
            )}
            {items.map((b) => (
                <Card key={b.id}>
                    <CardHeader>
                        <CardTitle>{b.service_title}</CardTitle>
                        <p className="text-sm text-muted-foreground">Status: {b.status}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">When: {b.scheduled_for ? new Date(b.scheduled_for).toLocaleString() : "TBD"}</span>
                        </div>
                        {role === "customer" && b.status === "completed" && !b.rating && (
                            <div className="mt-4 space-y-2">
                                <label className="block text-sm">Rate this booking</label>
                                <div className="flex items-center space-x-2">
                                    {[1, 2, 3, 4, 5].map((r) => (
                                        <Button key={r} variant="outline" size="sm" onClick={() => submitRating(b.id, r, "")}>
                                            {r}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}


