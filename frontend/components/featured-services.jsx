"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock } from "lucide-react"
import Link from "next/link"

const featuredServices = [
    {
        id: 1,
        title: "Professional Web Development",
        provider: "TechPro Solutions",
        description: "Custom website development with modern design and responsive layout",
        category: "Tech Services",
        rating: 4.8,
        reviews: 127,
        location: "Kathmandu",
        price: "Rs. 25,000",
        duration: "2-3 weeks",
        image: "/logo.png"
    },
    {
        id: 2,
        title: "Home Cleaning Service",
        provider: "CleanHome Pro",
        description: "Professional home cleaning service with eco-friendly products",
        category: "Home Services",
        rating: 4.9,
        reviews: 89,
        location: "Lalitpur",
        price: "Rs. 2,500",
        duration: "3-4 hours",
        image: "/logo.png"
    },
    {
        id: 3,
        title: "Professional Photography",
        provider: "Capture Moments",
        description: "Event photography, portraits, and commercial photography services",
        category: "Creative Services",
        rating: 4.7,
        reviews: 156,
        location: "Bhaktapur",
        price: "Rs. 15,000",
        duration: "1 day",
        image: "/logo.png"
    }
]

export default function FeaturedServices() {
    return (
        <section className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Featured Services
                    </h2>
                    <p className="text-xl text-slate-200 max-w-2xl mx-auto">
                        Discover top-rated services from verified professionals
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {featuredServices.map((service) => (
                        <Card key={service.id} className="hover:shadow-lg transition-all duration-300">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-blue-600 font-medium">{service.category}</span>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-medium">{service.rating}</span>
                                        <span className="text-sm text-white">({service.reviews})</span>
                                    </div>
                                </div>
                                <CardTitle className="text-xl">{service.title}</CardTitle>
                                <CardDescription className="text-sm text-blue-600">
                                    by {service.provider}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-white mb-4">{service.description}</p>

                                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {service.location}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {service.duration}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-2xl font-bold text-blue-600">{service.price}</span>
                                </div>

                                <Button asChild className="w-full">
                                    <Link href={`/services/${service.id}`}>
                                        View Details
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-center">
                    <Button asChild size="lg" variant="outline">
                        <Link href="/services">
                            View All Services
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
