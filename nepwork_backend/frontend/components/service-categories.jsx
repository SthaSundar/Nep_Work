"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, Paintbrush, Code, Camera, Car, Home, Heart, Briefcase } from "lucide-react"
import Link from "next/link"

const categories = [
    {
        id: "home-services",
        title: "Home Services",
        description: "Cleaning, repairs, maintenance, and more",
        icon: Home,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        href: "/services/home-services"
    },
    {
        id: "tech-services",
        title: "Tech Services",
        description: "Web development, app creation, IT support",
        icon: Code,
        color: "text-green-600",
        bgColor: "bg-green-50",
        href: "/services/tech-services"
    },
    {
        id: "creative-services",
        title: "Creative Services",
        description: "Design, photography, content creation",
        icon: Camera,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        href: "/services/creative-services"
    },
    {
        id: "automotive",
        title: "Automotive",
        description: "Car repairs, maintenance, detailing",
        icon: Car,
        color: "text-red-600",
        bgColor: "bg-red-50",
        href: "/services/automotive"
    },
    {
        id: "beauty-wellness",
        title: "Beauty & Wellness",
        description: "Hair, makeup, massage, fitness",
        icon: Heart,
        color: "text-pink-600",
        bgColor: "bg-pink-50",
        href: "/services/beauty-wellness"
    },
    {
        id: "professional",
        title: "Professional Services",
        description: "Consulting, legal, accounting",
        icon: Briefcase,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        href: "/services/professional"
    }
]

export default function ServiceCategories() {
    return (
        <section className="py-16 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Explore Service Categories
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Find the perfect service for your needs or showcase your expertise in your field
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => {
                        const IconComponent = category.icon
                        return (
                            <Link key={category.id} href={category.href}>
                                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                                    <CardHeader className="text-center">
                                        <div className={`mx-auto w-16 h-16 rounded-full ${category.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                            <IconComponent className={`w-8 h-8 ${category.color}`} />
                                        </div>
                                        <CardTitle className="text-xl font-semibold text-gray-900">
                                            {category.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        <p className="text-gray-600">{category.description}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
