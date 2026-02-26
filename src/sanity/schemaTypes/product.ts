import { defineType, defineField, defineArrayMember } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Product Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Product Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          validation: (rule) => rule.required().warning('Alt text is important for SEO'),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Product Gallery',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'description',
      title: 'Product Description',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
        }),
      ],
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'compareAtPrice',
      title: 'Compare at Price (Original Price)',
      type: 'number',
      validation: (rule) => rule.min(0),
      description: 'The original price before discount (optional)',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'category' }],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'variants',
      title: 'Product Variants',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'size',
              title: 'Size',
              type: 'string',
              options: {
                list: [
                  { title: 'XS', value: 'xs' },
                  { title: 'S', value: 's' },
                  { title: 'M', value: 'm' },
                  { title: 'L', value: 'l' },
                  { title: 'XL', value: 'xl' },
                  { title: 'XXL', value: 'xxl' },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'color',
              title: 'Color',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'sku',
              title: 'SKU',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'stock',
              title: 'Stock Quantity',
              type: 'number',
              validation: (rule) => rule.required().min(0).integer(),
            }),
            defineField({
              name: 'priceAdjustment',
              title: 'Price Adjustment',
              type: 'number',
              description: 'Additional price for this variant (optional)',
            }),
          ],
          preview: {
            select: {
              size: 'size',
              color: 'color',
              stock: 'stock',
            },
            prepare({ size, color, stock }) {
              return {
                title: `${size?.toUpperCase()} - ${color}`,
                subtitle: `Stock: ${stock}`,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured Product',
      type: 'boolean',
      description: 'Display on homepage',
      initialValue: false,
    }),
    defineField({
      name: 'newArrival',
      title: 'New Arrival',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'bestseller',
      title: 'Bestseller',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'weight',
      title: 'Weight (kg)',
      type: 'number',
      description: 'Product weight for shipping calculations',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'material',
      title: 'Material',
      type: 'string',
      description: 'e.g., Cotton, Polyester, Silk',
    }),
    defineField({
      name: 'careInstructions',
      title: 'Care Instructions',
      type: 'text',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          validation: (rule) => rule.max(60).warning('Keep it under 60 characters'),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          validation: (rule) => rule.max(160).warning('Keep it under 160 characters'),
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
      price: 'price',
    },
    prepare({ title, media, price }) {
      return {
        title,
        subtitle: price ? `₹${price}` : 'No price set',
        media,
      }
    },
  },
})
