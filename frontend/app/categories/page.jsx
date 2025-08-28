"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Filter, Grid3X3, List } from "lucide-react"

const mockCategories = [
    {
        id: 1,
        name: "Home Services",
        description: "Cleaning, maintenance, and home improvement services",
        serviceCount: 45,
        icon: "🏠"
    },
    {
        id: 2,
        name: "Tech Services",
        description: "IT support, web development, and technical assistance",
        serviceCount: 32,
        icon: "💻"
    },
    {
        id: 3,
        name: "Creative Services",
        description: "Design, writing, and creative work",
        serviceCount: 28,
        icon: "🎨"
    },
    {
        id: 4,
        name: "Automotive",
        description: "Car repair, maintenance, and detailing",
        serviceCount: 19,
        icon: "🚗"
    },
    {
        id: 5,
        name: "Beauty & Wellness",
        description: "Hair, makeup, massage, and wellness services",
        serviceCount: 23,
        icon: "💄"
    },
    {
        id: 6,
        name: "Professional Services",
        description: "Consulting, legal, and business services",
        serviceCount: 15,
        icon: "👔"
    }
]

export default function CategoriesPage() {
    const [categories, setCategories] = useState(mockCategories)
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState("grid")

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Service Categories
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Explore our comprehensive range of service categories to find exactly what you need
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>

                            <div className="flex border border-gray-300 rounded-lg">
                                <Button
                                    variant={viewMode === "grid" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("grid")}
                                    className="rounded-r-none"
                                >
                                    <Grid3X3 className={`h-4 w-4`} color="black"/>
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                    className="rounded-l-none"
                                >
                                    <List className="h-4 w-4" color="black"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {filteredCategories.map((category) => (
                        <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl">{category.icon}</div>
                                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {category.serviceCount} services
                                    </span>
                                </div>
                                <CardTitle className="text-xl">{category.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 mb-4">{category.description}</p>
                                <Button className="w-full" variant="outline">
                                    Browse Services
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredCategories.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No categories found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
