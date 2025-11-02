"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Briefcase,
  Star,
  Calendar,
  Settings,
  Plus,
  LogOut,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ServicesList, BookingsList } from "./components";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const roleFromUrl = searchParams?.get("role");
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    // Only sync role once when session is established, not on every render
    const persistRole = async () => {
      try {
        const selected =
          roleFromUrl ||
          (typeof window !== "undefined"
            ? localStorage.getItem("npw_role")
            : null) ||
          "customer";
        if (typeof window !== "undefined") {
          localStorage.setItem("npw_role", selected);
        }

        // Only sync if we have API URL and session email, and avoid duplicate calls
        if (process.env.NEXT_PUBLIC_API_URL && session?.user?.email) {
          const syncRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/sync/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              username: session.user.name,
              role: selected,
            }),
          });
          if (!syncRes.ok) {
            console.warn("Role sync failed:", await syncRes.text());
          }
        }
      } catch (e) {
        console.error("Failed persisting role", e);
      }
    };
    // Only run once when session is available
    if (session?.user?.email) {
      persistRole();
    }
  }, [session?.user?.email]); // Only depend on email to prevent multiple calls

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user?.email) return;
      setLoadingStats(true);

      try {
        // Use token from localStorage if available, otherwise try session token
        const token = typeof window !== "undefined" ? localStorage.getItem("npw_token") : null;
        const authHeader = token 
          ? `Bearer ${token}` 
          : session?.accessToken 
          ? `Bearer ${session.accessToken}` 
          : null;

        if (!authHeader) {
          console.warn("No auth token available for stats");
          setLoadingStats(false);
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/accounts/user-stats/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
          }
        );
        if (!res.ok) {
          if (res.status === 401) {
            // Token expired, clear it
            if (typeof window !== "undefined") {
              localStorage.removeItem("npw_token");
            }
          }
          throw new Error("Failed to fetch stats");
        }
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (session?.user?.email) {
      fetchStats();
    }
  }, [session?.user?.email]); // Only depend on email to prevent multiple calls

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("npw_role");
    }
    signOut({ callbackUrl: "/" });
  };

  const currentRole =
    roleFromUrl ||
    (typeof window !== "undefined" && localStorage.getItem("npw_role")) ||
    "customer";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                NepWork Dashboard
              </h1>
              <span className="ml-3 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {currentRole === "provider"
                  ? "Service Provider"
                  : currentRole === "admin"
                  ? "Admin"
                  : currentRole === "customer" || currentRole === "client"
                  ? "Client"
                  : "Client"}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/role-switch")}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Switch Role
              </Button>
              <div className="flex items-center space-x-2">
                <img
                  src={session.user?.image || "/logo.png"}
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">
                  {session.user?.name}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">
              {currentRole === "provider" ? "My Services" : "Services"}
            </TabsTrigger>
            <TabsTrigger value="bookings">
              {currentRole === "provider" ? "Orders" : "Bookings"}
            </TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {currentRole === "provider"
                      ? "Total Services"
                      : "Services Used"}
                  </CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingStats
                      ? "..."
                      : stats?.[
                          currentRole === "provider"
                            ? "total_services"
                            : "total_bookings"
                        ] || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentRole === "provider"
                      ? "Active services"
                      : "Total bookings"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {currentRole === "provider" ? "Pending Services" : "Active Bookings"}
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingStats
                      ? "..."
                      : currentRole === "provider"
                      ? (stats?.pending_bookings || 0)
                      : (stats?.active_bookings || stats?.confirmed_bookings || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentRole === "provider"
                      ? "Pending orders"
                      : "Current bookings"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {currentRole === "provider" ? "Rating" : "Completed"}
                  </CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingStats
                      ? "..."
                      : currentRole === "provider"
                      ? (stats?.average_rating ? `${stats.average_rating}/5` : "N/A")
                      : (stats?.completed_bookings || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentRole === "provider"
                      ? "Average rating"
                      : "Completed jobs"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
              {currentRole === "provider" && (
                <>
                  <Button asChild className="w-full">
                    <Link href="/services/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Post New Service
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/kyc">
                      <Eye className="h-4 w-4 mr-2" />
                      KYC Verification
                    </Link>
                  </Button>
                </>
              )}
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/services">
                      <Search className="h-4 w-4 mr-2" />
                      Browse Services
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/profile">
                      <Settings className="h-4 w-4 mr-2" />
                      Update Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span className="text-sm font-medium">
                      {session.user?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Email:
                    </span>
                    <span className="text-sm font-medium">
                      {session.user?.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Role:</span>
                    <span className="text-sm font-medium capitalize">
                      {currentRole}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {currentRole === "provider"
                  ? "My Services"
                  : "Available Services"}
              </h2>
              {currentRole === "provider" && (
                <Button asChild>
                  <Link href="/services/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Link>
                </Button>
              )}
            </div>

            <ServicesList role={currentRole} session={session} />
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-bold">
              {currentRole === "provider" ? "Service Orders" : "My Bookings"}
            </h2>
            <BookingsList role={currentRole} session={session} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold">Profile Settings</h2>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-sm text-muted-foreground">
                      {session.user?.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <Button variant="outline">Edit Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
