"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Briefcase, Crown } from "lucide-react"

export default function RoleSwitcher() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [currentRole, setCurrentRole] = useState("customer")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedRole = localStorage.getItem("npw_role") || "customer"
            setCurrentRole(savedRole)
        }
    }, [])

    const switchRole = async (newRole) => {
        if (!session?.user?.email) return

        setLoading(true)
        try {
            // Update role in backend
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/sync/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: session.user.email,
                    username: session.user.name,
                    role: newRole
                })
            })

            // Update local storage
            localStorage.setItem("npw_role", newRole)
            setCurrentRole(newRole)

            // Redirect to dashboard with new role
            router.push(`/dashboard?role=${newRole}`)
        } catch (error) {
            console.error("Failed to switch role:", error)
        } finally {
            setLoading(false)
        }
    }

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!session) {
        router.push("/auth/signin")
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>Choose Your Role</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Welcome, {session.user.name}! Select how you want to use NepWork.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        variant={currentRole === "customer" ? "default" : "outline"}
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                        onClick={() => switchRole("customer")}
                        disabled={loading}
                    >
                        <User className="h-6 w-6" />
                        <div>
                            <div className="font-medium">Client</div>
                            <div className="text-xs">Request services and book providers</div>
                        </div>
                    </Button>

                    <Button
                        variant={currentRole === "provider" ? "default" : "outline"}
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                        onClick={() => switchRole("provider")}
                        disabled={loading}
                    >
                        <Briefcase className="h-6 w-6" />
                        <div>
                            <div className="font-medium">Service Provider</div>
                            <div className="text-xs">Offer services and manage bookings</div>
                        </div>
                    </Button>

                    {session.role === "admin" && (
                        <Button
                            variant={currentRole === "admin" ? "default" : "outline"}
                            className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                            onClick={() => switchRole("admin")}
                            disabled={loading}
                        >
                            <Crown className="h-6 w-6" />
                            <div>
                                <div className="font-medium">Admin</div>
                                <div className="text-xs">Manage platform and users</div>
                            </div>
                        </Button>
                    )}

                    {loading && (
                        <div className="text-center text-sm text-muted-foreground">
                            Switching role...
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}


