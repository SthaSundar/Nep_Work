"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { Star, Calendar, CheckCircle, Clock, XCircle, MessageSquare } from "lucide-react"
import Link from "next/link"

export function ServicesList({ role, session }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const run = async () => {
            setLoading(true)
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("npw_token") : null
                const headers = token ? {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                } : { "Content-Type": "application/json" }

                // Map role - "client" is displayed but backend uses "customer"
                const backendRole = role === "client" ? "customer" : role
                const url = backendRole === "provider"
                    ? `${process.env.NEXT_PUBLIC_API_URL}/services/services/my/`
                    : `${process.env.NEXT_PUBLIC_API_URL}/services/services/`
                
                const res = await fetch(url, { headers })
                if (!res.ok) throw new Error("Failed to load services")
                
                const data = await res.json()
                setItems(Array.isArray(data) ? data : [])
            } catch (e) {
                setError(e.message)
                setItems([])
            } finally {
                setLoading(false)
            }
        }
        if (session) run()
    }, [role, session])

    if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>
    if (error) return <p className="text-sm text-red-600">{error}</p>
    if (!items.length) return <p className="text-sm text-muted-foreground">No services found.</p>

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((s) => (
                <Card key={s.id}>
                    <CardHeader>
                        <CardTitle>{s.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{s.description?.slice(0, 100)}...</p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-lg font-bold text-blue-600">Rs. {s.base_price}</span>
                            {s.average_rating && (
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm">{s.average_rating}</span>
                                    {s.total_reviews > 0 && (
                                        <span className="text-xs text-gray-500">({s.total_reviews})</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 mt-4">
                            {role === "provider" ? (
                                <>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/services/${s.id}/edit`}>Edit</Link>
                                    </Button>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/services/${s.id}`}>View</Link>
                                    </Button>
                                </>
                            ) : (
                                <Button size="sm" asChild className="w-full">
                                    <Link href={`/services/${s.id}`}>View Details</Link>
                                </Button>
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
                const token = typeof window !== "undefined" ? localStorage.getItem("npw_token") : null
                const headers = token ? {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                } : { "Content-Type": "application/json" }

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/mine/`, { headers })
                if (!res.ok) throw new Error("Failed to load bookings")
                
                const data = await res.json()
                setItems(Array.isArray(data) ? data : [])
            } catch (e) {
                setError(e.message)
                setItems([])
            } finally {
                setLoading(false)
            }
        }
        if (session) run()
    }, [session])

    const submitRating = async (bookingId, rating, review) => {
        setError("")
        setSuccess("")
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("npw_token") : null
            const headers = token ? {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            } : { "Content-Type": "application/json" }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/rate/`, {
                method: "PATCH",
                headers,
                body: JSON.stringify({ rating, review }),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data?.detail || "Failed to submit rating")
            }
            setSuccess("Thanks for your review!")
            
            // Refresh bookings
            const refreshed = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/mine/`, {
                headers
            }).then((r) => r.json()).catch(() => [])
            setItems(Array.isArray(refreshed) ? refreshed : [])
        } catch (e) {
            setError(e.message)
        }
    }

    const updateStatus = async (bookingId, status) => {
        setError("")
        setSuccess("")
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("npw_token") : null
            const headers = token ? {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            } : { "Content-Type": "application/json" }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/status/`, {
                method: "PATCH",
                headers,
                body: JSON.stringify({ status }),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data?.detail || "Failed to update status")
            }
            setSuccess("Status updated!")
            
            // Refresh bookings
            const refreshed = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/mine/`, {
                headers
            }).then((r) => r.json()).catch(() => [])
            setItems(Array.isArray(refreshed) ? refreshed : [])
        } catch (e) {
            setError(e.message)
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case "confirmed":
                return <Clock className="h-4 w-4 text-blue-500" />
            case "pending":
                return <Clock className="h-4 w-4 text-yellow-500" />
            case "cancelled":
                return <XCircle className="h-4 w-4 text-red-500" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800"
            case "confirmed":
                return "bg-blue-100 text-blue-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "cancelled":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    // Filter bookings by status for different sections
    const pendingBookings = items.filter(b => b.status === "pending")
    const confirmedBookings = items.filter(b => b.status === "confirmed")
    const completedBookings = items.filter(b => b.status === "completed")

    if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>
    if (error) return <p className="text-sm text-red-600">{error}</p>
    if (success) return <p className="text-sm text-green-600">{success}</p>

    if (role === "provider") {
        return (
            <div className="space-y-6">
                {/* Pending Services */}
                {pendingBookings.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Pending Services ({pendingBookings.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingBookings.map((b) => (
                                <Card key={b.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{b.service_title}</CardTitle>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(b.status)}`}>
                                                {b.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Customer: {b.customer_name || b.customer_email}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <p className="text-sm"><strong>Price:</strong> Rs. {b.base_price}</p>
                                            {b.scheduled_for && (
                                                <p className="text-sm"><strong>Scheduled:</strong> {new Date(b.scheduled_for).toLocaleString()}</p>
                                            )}
                                            {b.notes && (
                                                <p className="text-sm"><strong>Notes:</strong> {b.notes}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Button size="sm" onClick={() => updateStatus(b.id, "confirmed")}>
                                                Accept
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "cancelled")}>
                                                Decline
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Current Working Jobs */}
                {confirmedBookings.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Current Working Jobs ({confirmedBookings.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {confirmedBookings.map((b) => (
                                <Card key={b.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{b.service_title}</CardTitle>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(b.status)}`}>
                                                {b.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Customer: {b.customer_name || b.customer_email}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <p className="text-sm"><strong>Price:</strong> Rs. {b.base_price}</p>
                                            {b.scheduled_for && (
                                                <p className="text-sm"><strong>Scheduled:</strong> {new Date(b.scheduled_for).toLocaleString()}</p>
                                            )}
                                            {b.notes && (
                                                <p className="text-sm"><strong>Notes:</strong> {b.notes}</p>
                                            )}
                                        </div>
                                        <Button size="sm" className="mt-4 w-full" onClick={() => updateStatus(b.id, "completed")}>
                                            Mark as Completed
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Past Services */}
                {completedBookings.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Past Services ({completedBookings.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {completedBookings.map((b) => (
                                <Card key={b.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{b.service_title}</CardTitle>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(b.status)}`}>
                                                {b.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Customer: {b.customer_name || b.customer_email}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <p className="text-sm"><strong>Price:</strong> Rs. {b.base_price}</p>
                                            {b.rating && (
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm">{b.rating}/5</span>
                                                </div>
                                            )}
                                            {b.review && (
                                                <div className="text-sm">
                                                    <strong>Review:</strong> <p className="mt-1 italic">{b.review}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {items.length === 0 && (
                    <p className="text-sm text-muted-foreground">No bookings yet.</p>
                )}
            </div>
        )
    }

    // Client view
    return (
        <div className="space-y-6">
            {/* Current Service */}
            {confirmedBookings.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Current Service ({confirmedBookings.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {confirmedBookings.map((b) => (
                            <Card key={b.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{b.service_title}</CardTitle>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(b.status)}`}>
                                            {b.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Provider: {b.provider_name || b.provider_email}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm"><strong>Price:</strong> Rs. {b.base_price}</p>
                                        {b.scheduled_for && (
                                            <p className="text-sm"><strong>Scheduled:</strong> {new Date(b.scheduled_for).toLocaleString()}</p>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">Work in progress - 75%</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Past Services */}
            {completedBookings.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Past Services ({completedBookings.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completedBookings.map((b) => (
                            <Card key={b.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{b.service_title}</CardTitle>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(b.status)}`}>
                                            {b.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Provider: {b.provider_name || b.provider_email}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm"><strong>Price:</strong> Rs. {b.base_price}</p>
                                        {b.rating ? (
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm">You rated: {b.rating}/5</span>
                                            </div>
                                        ) : (
                                            <div className="mt-4 space-y-2">
                                                <label className="block text-sm font-medium">Rate this service</label>
                                                <div className="flex items-center space-x-2">
                                                    {[1, 2, 3, 4, 5].map((r) => (
                                                        <Button key={r} variant="outline" size="sm" onClick={() => submitRating(b.id, r, "")}>
                                                            {r}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {b.review && (
                                            <div className="text-sm">
                                                <strong>Your review:</strong> <p className="mt-1 italic">{b.review}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Pending Bookings */}
            {pendingBookings.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Pending Bookings ({pendingBookings.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingBookings.map((b) => (
                            <Card key={b.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{b.service_title}</CardTitle>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(b.status)}`}>
                                            {b.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Provider: {b.provider_name || b.provider_email}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm"><strong>Price:</strong> Rs. {b.base_price}</p>
                                        {b.scheduled_for && (
                                            <p className="text-sm"><strong>Scheduled:</strong> {new Date(b.scheduled_for).toLocaleString()}</p>
                                        )}
                                    </div>
                                    <Button size="sm" variant="outline" className="mt-4" onClick={() => updateStatus(b.id, "cancelled")}>
                                        Cancel Booking
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {items.length === 0 && (
                <p className="text-sm text-muted-foreground">No bookings yet.</p>
            )}
        </div>
    )
}
