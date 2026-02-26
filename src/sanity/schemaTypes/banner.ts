import { defineType, defineField } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export const banner = defineType({
  name: 'banner',
  title: 'Homepage Banner',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Banner Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Banner Image',
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
      name: 'mobileImage',
      title: 'Mobile Banner Image',
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
      description: 'Optional: Use different image for mobile devices',
    }),
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      type: 'string',
    }),
    defineField({
      name: 'buttonLink',
      title: 'Button Link',
      type: 'string',
      description: 'e.g., /shop or /collections/summer',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first',
      validation: (rule) => rule.required().integer(),
      initialValue: 0,
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Show this banner on the homepage',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      isActive: 'isActive',
    },
    prepare({ title, media, isActive }) {
      return {
        title,
        subtitle: isActive ? 'Active' : 'Inactive',
        media,
      }
    },
  },
})
