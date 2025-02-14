export function useStripe() {
  const initiateDonation = async (amount = 500) => {
    try {
      const response = await fetch('https://api.templative.net/stripe/create-donation-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount })
      })
      
      const session = await response.json()

      if (session.error) {
        throw new Error('Error creating donation session')
      }
      
      // Instead of using Stripe.js, directly redirect to the checkout URL
      window.location.href = session.url
    } catch (error) {
      console.error('Donation process error:', error)
      alert('Error processing donation')
    }
  }

  return { initiateDonation }
} 