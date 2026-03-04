export async function createGameDiscount(client, { code, gameName, tier = 'standard' }) {
  const now = new Date()
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const offerPools = {
    low: [
      {
        label: '₹50 OFF on orders above ₹799',
        data: {
          discountType: 'fixed',
          fixedAmountOff: 50,
          minimumPurchaseAmount: 799,
        },
      },
      {
        label: 'Free Shipping on orders above ₹699',
        data: {
          discountType: 'freeShipping',
          minimumPurchaseAmount: 699,
        },
      },
      {
        label: '5% OFF on orders above ₹799',
        data: {
          discountType: 'percentage',
          percentageOff: 5,
          minimumPurchaseAmount: 799,
        },
      },
    ],
    standard: [
      {
        label: '8% OFF on orders above ₹999',
        data: {
          discountType: 'percentage',
          percentageOff: 8,
          minimumPurchaseAmount: 999,
        },
      },
      {
        label: '₹100 OFF on orders above ₹1299',
        data: {
          discountType: 'fixed',
          fixedAmountOff: 100,
          minimumPurchaseAmount: 1299,
        },
      },
      {
        label: 'Free Shipping on orders above ₹999',
        data: {
          discountType: 'freeShipping',
          minimumPurchaseAmount: 999,
        },
      },
      {
        label: '7% OFF on orders above ₹1199',
        data: {
          discountType: 'percentage',
          percentageOff: 7,
          minimumPurchaseAmount: 1199,
        },
      },
    ],
    high: [
      {
        label: '10% OFF on orders above ₹1499',
        data: {
          discountType: 'percentage',
          percentageOff: 10,
          minimumPurchaseAmount: 1499,
        },
      },
      {
        label: '₹150 OFF on orders above ₹1799',
        data: {
          discountType: 'fixed',
          fixedAmountOff: 150,
          minimumPurchaseAmount: 1799,
        },
      },
      {
        label: 'Free Shipping on orders above ₹1299',
        data: {
          discountType: 'freeShipping',
          minimumPurchaseAmount: 1299,
        },
      },
      {
        label: '9% OFF on orders above ₹1399',
        data: {
          discountType: 'percentage',
          percentageOff: 9,
          minimumPurchaseAmount: 1399,
        },
      },
    ],
  }

  const pool = offerPools[tier] || offerPools.standard
  const selected = pool[Math.floor(Math.random() * pool.length)]

  await client.create({
    _type: 'discountCode',
    code,
    description: `${gameName} reward: ${selected.label}`,
    appliesTo: 'entireOrder',
    usageLimit: 1,
    usageLimitPerCustomer: 1,
    startDate: now.toISOString(),
    endDate: end.toISOString(),
    isActive: true,
    timesUsed: 0,
    ...selected.data,
  })

  return selected
}
