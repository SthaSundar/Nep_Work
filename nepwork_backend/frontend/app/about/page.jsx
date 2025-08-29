import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Target, Award, Shield } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">
                        About NepWork
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Connecting skilled freelancers and service providers with clients who need quality work done.
                        We're building a community where talent meets opportunity.
                    </p>
                </div>

                {/* Mission & Vision */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-6 w-6 text-blue-600" />
                                Our Mission
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                To democratize access to quality services by connecting talented professionals
                                with clients who need their expertise, creating opportunities for growth and
                                success for both parties.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-6 w-6 text-green-600" />
                                Our Vision
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                To become the leading platform for service discovery and professional
                                networking, empowering individuals to build successful careers and
                                businesses through meaningful connections.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Values */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                        Our Core Values
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="text-center">
                            <CardHeader>
                                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <CardTitle className="text-lg">Community</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">
                                    Building strong connections between service providers and clients
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="text-center">
                            <CardHeader>
                                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <Award className="h-6 w-6 text-green-600" />
                                </div>
                                <CardTitle className="text-lg">Quality</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">
                                    Ensuring high standards in all services and interactions
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="text-center">
                            <CardHeader>
                                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                    <Target className="h-6 w-6 text-purple-600" />
                                </div>
                                <CardTitle className="text-lg">Innovation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">
                                    Continuously improving our platform and user experience
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="text-center">
                            <CardHeader>
                                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                    <Shield className="h-6 w-6 text-orange-600" />
                                </div>
                                <CardTitle className="text-lg">Trust</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">
                                    Creating a safe and reliable environment for all users
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                        Platform Statistics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
                            <div className="text-gray-600">Active Users</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
                            <div className="text-gray-600">Services Offered</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-purple-600 mb-2">50+</div>
                            <div className="text-gray-600">Categories</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-orange-600 mb-2">95%</div>
                            <div className="text-gray-600">Satisfaction Rate</div>
                        </div>
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Join our community today and discover amazing services or showcase your expertise.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/auth/signin"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            Sign Up Now
                        </a>
                        <a
                            href="/contact"
                            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
