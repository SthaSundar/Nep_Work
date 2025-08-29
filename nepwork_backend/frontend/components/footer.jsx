import Link from "next/link"
import Image from "next/image"

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white flex justify-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center">
                            <Image
                                src="/logo.png"
                                alt="NepWork"
                                width={24}
                                height={24}
                                className="h-32 w-44"
                                sizes="contain"
                            />
                        </div>
                        <p className="text-gray-300 mb-4 max-w-md pr-6 text-left">
                            Connecting skilled freelancers and service providers with clients who need quality work done.
                            Join our platform to discover amazing services or showcase your expertise.
                        </p>
                        <div className="flex space-x-4">
                            <span className="text-gray-400 text-sm">Connect with us</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/services" className="text-gray-300 hover:text-white transition-colors">
                                    Browse Services
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories" className="text-gray-300 hover:text-white transition-colors">
                                    Service Categories
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/help" className="text-gray-300 hover:text-white transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/disputes" className="text-gray-300 hover:text-white transition-colors">
                                    Dispute Resolution
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © 2024 NepWork. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Terms
                            </Link>
                            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Privacy
                            </Link>
                            <Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Cookies
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
