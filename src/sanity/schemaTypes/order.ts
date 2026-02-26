import { defineType, defineField, defineArrayMember } from 'sanity'
import { DocumentsIcon } from '@sanity/icons'

export const order = defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: 'orderNumber',
      title: 'Order Number',
      type: 'string',
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'userId',
      title: 'User ID (Firebase)',
      type: 'string',
      validation: (rule) => rule.required(),
      description: 'Firebase User UID',
    }),
    defineField({
      name: 'customerEmail',
      title: 'Customer Email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'customerPhone',
      title: 'Customer Phone',
      type: 'string',
    }),
    defineField({
      name: 'items',
      title: 'Order Items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'product',
              title: 'Product',
              type: 'reference',
              to: [{ type: 'product' }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'productTitle',
              title: 'Product Title',
              type: 'string',
              description: 'Snapshot of product title at time of order',
            }),
            defineField({
              name: 'variantSize',
              title: 'Size',
              type: 'string',
            }),
            defineField({
              name: 'variantColor',
              title: 'Color',
              type: 'string',
            }),
            defineField({
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
              validation: (rule) => rule.required().min(1).integer(),
            }),
            defineField({
              name: 'price',
              title: 'Price (at time of order)',
              type: 'number',
              validation: (rule) => rule.required().min(0),
            }),
          ],
          preview: {
            select: {
              title: 'productTitle',
              quantity: 'quantity',
              size: 'variantSize',
              color: 'variantColor',
            },
            prepare({ title, quantity, size, color }) {
              return {
                title,
                subtitle: `Qty: ${quantity} | ${size} | ${color}`,
              }
            },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'shippingAddress',
      title: 'Shipping Address',
      type: 'object',
      fields: [
        defineField({
          name: 'street',
          title: 'Street Address',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'city',
          title: 'City',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'state',
          title: 'State',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'postalCode',
          title: 'Postal Code',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'country',
          title: 'Country',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtotal',
      title: 'Subtotal',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'shippingCost',
      title: 'Shipping Cost',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'tax',
      title: 'Tax',
      type: 'number',
      validation: (rule) => rule.min(0),
      initialValue: 0,
    }),
    defineField({
      name: 'total',
      title: 'Total',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'paymentMethod',
      title: 'Payment Method',
      type: 'string',
      options: {
        list: [
          { title: 'Razorpay', value: 'razorpay' },
          { title: 'Cash on Delivery', value: 'cod' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'paymentId',
      title: 'Payment ID',
      type: 'string',
      description: 'Razorpay payment ID or transaction reference',
    }),
    defineField({
      name: 'status',
      title: 'Order Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Processing', value: 'processing' },
          { title: 'Shipped', value: 'shipped' },
          { title: 'Delivered', value: 'delivered' },
          { title: 'Cancelled', value: 'cancelled' },
          { title: 'Refunded', value: 'refunded' },
        ],
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
      initialValue: 'pending',
    }),
    defineField({
      name: 'trackingNumber',
      title: 'Tracking Number',
      type: 'string',
      description: 'Shiprocket or courier tracking number',
    }),
    defineField({
      name: 'notes',
      title: 'Order Notes',
      type: 'text',
      description: 'Internal notes about this order',
    }),
    defineField({
      name: 'createdAt',
      title: 'Order Date',
      type: 'datetime',
      validation: (rule) => rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      orderNumber: 'orderNumber',
      customerName: 'customerName',
      total: 'total',
      status: 'status',
    },
    prepare({ orderNumber, customerName, total, status }) {
      return {
        title: `Order #${orderNumber}`,
        subtitle: `${customerName} | ₹${total} | ${status}`,
      }
    },
  },
})
