import ListingDetailPage from '../../../components/ListingDetailPage'

// Mock listing data - in a real app, this would come from an API
const mockListing = {
  id: '1',
  title: 'Introduction to Computer Science - 9th Edition',
  price: 45000,
  currency: 'UGX' as const,
  condition: 'Good' as const,
  images: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop'
  ],
  description: `Excellent condition textbook for Computer Science 101 course. This is the 9th edition which is the current version being used.

Key Features:
• Minimal highlighting and notes
• All pages intact and in good condition
• Cover shows minor wear but overall excellent
• Perfect for CS majors or anyone interested in programming

This textbook covers fundamental programming concepts, data structures, algorithms, and software engineering principles. It's been a great resource throughout the semester and I'm selling it because I've completed the course.

The book originally cost UGX 120,000, so you're getting a great deal at UGX 45,000. Perfect for next semester's students!

Available for pickup at Main Campus or can arrange delivery within campus area.`,
  seller: {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
    rating: 4.8,
    joinDate: new Date('2023-01-15'),
    totalSales: 23
  },
  location: 'Main Campus - Library Building',
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  isSold: false,
  isSaved: false
}

export default function ListingDetail() {
  const handleSave = (listingId: string) => {
    console.log('Save listing:', listingId)
  }

  const handleMessageSeller = (sellerId: string) => {
    console.log('Message seller:', sellerId)
  }

  const handleMakeOffer = (listingId: string, offerAmount: number) => {
    console.log('Make offer:', listingId, offerAmount)
  }

  return (
    <ListingDetailPage
      listing={mockListing}
      onSave={handleSave}
      onMessageSeller={handleMessageSeller}
      onMakeOffer={handleMakeOffer}
      currency="UGX"
    />
  )
}
