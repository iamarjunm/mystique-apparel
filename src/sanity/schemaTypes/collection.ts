import { defineType, defineField, defineArrayMember } from 'sanity'
import { ImagesIcon } from '@sanity/icons'

export const collection = defineType({
  name: 'collection',
  title: 'Collection',
  type: 'document',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Collection Title',
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
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'image',
      title: 'Collection Image',
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'products',
      title: 'Products in Collection',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'product' }],
        }),
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured Collection',
      type: 'boolean',
      description: 'Display on homepage',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      productCount: 'products',
    },
    prepare({ title, media, productCount }) {
      return {
        title,
        subtitle: productCount ? `${productCount.length} products` : 'No products',
        media,
      }
    },
  },
})
