import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us — Bugema Hub',
  description: 'Learn about Bugema Hub, the global university community platform connecting students worldwide.',
  openGraph: {
    title: 'About Us — Bugema Hub',
    description: 'Learn about Bugema Hub, the global university community platform connecting students worldwide.',
    type: 'website',
    url: 'https://bugemahub.com/about',
    images: [
      {
        url: 'https://bugemahub.com/images/og-about.jpg',
        width: 1200,
        height: 630,
        alt: 'Bugema Hub - About Us',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us — Bugema Hub',
    description: 'Learn about Bugema Hub, the global university community platform connecting students worldwide.',
    images: ['https://bugemahub.com/images/og-about.jpg'],
  },
  alternates: {
    canonical: 'https://bugemahub.com/about',
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



