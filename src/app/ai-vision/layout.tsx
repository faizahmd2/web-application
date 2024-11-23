import { Inter } from "next/font/google"
import "./style.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AI Vision Tools",
  description: "AI-powered image and text analysis tools",
}

export default function AIVisionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  )
}