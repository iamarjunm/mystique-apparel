import { defineType, defineField } from 'sanity'
import { CogIcon } from '@sanity/icons'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
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
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'Upload a square image (recommended 512x512px)',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Physical Address',
      type: 'text',
    }),
    defineField({
      name: 'socialMedia',
      title: 'Social Media',
      type: 'object',
      fields: [
        defineField({
          name: 'instagram',
          title: 'Instagram URL',
          type: 'url',
        }),
        defineField({
          name: 'facebook',
          title: 'Facebook URL',
          type: 'url',
        }),
        defineField({
          name: 'twitter',
          title: 'Twitter URL',
          type: 'url',
        }),
        defineField({
          name: 'pinterest',
          title: 'Pinterest URL',
          type: 'url',
        }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'Default SEO',
      type: 'object',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Default Meta Title',
          type: 'string',
          validation: (rule) => rule.max(60).warning('Keep it under 60 characters'),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Default Meta Description',
          type: 'text',
          validation: (rule) => rule.max(160).warning('Keep it under 160 characters'),
        }),
        defineField({
          name: 'ogImage',
          title: 'Default Open Graph Image',
          type: 'image',
          description: 'Used when sharing on social media (recommended 1200x630px)',
        }),
      ],
    }),
    defineField({
      name: 'shippingSettings',
      title: 'Shipping Settings',
      type: 'object',
      fields: [
        defineField({
          name: 'freeShippingThreshold',
          title: 'Free Shipping Threshold',
          type: 'number',
          description: 'Minimum order value for free shipping',
          validation: (rule) => rule.min(0),
        }),
        defineField({
          name: 'standardShippingCost',
          title: 'Standard Shipping Cost',
          type: 'number',
          validation: (rule) => rule.min(0),
        }),
      ],
    }),
    defineField({
      name: 'announcementBar',
      title: 'Announcement Bar',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show Announcement Bar',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'text',
          title: 'Announcement Text',
          type: 'string',
        }),
        defineField({
          name: 'link',
          title: 'Link (optional)',
          type: 'string',
        }),
        defineField({
          name: 'backgroundColor',
          title: 'Background Color',
          type: 'string',
          description: 'Hex color code (e.g., #000000)',
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      }
    },
  },
})
