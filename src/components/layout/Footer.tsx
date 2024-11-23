"use client"

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">© 2024 Your Company. All rights reserved.</p>
          <div className="space-x-4">
            <Link href="/about" className="text-gray-600 hover:text-purple-600">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-purple-600">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}