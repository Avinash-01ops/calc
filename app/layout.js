import './globals.css'

export const metadata = {
  title: 'Trip Logger - Authentication',
  description: 'Secure trip logging with Supabase authentication',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
