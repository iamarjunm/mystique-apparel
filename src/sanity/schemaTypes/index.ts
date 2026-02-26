import { type SchemaTypeDefinition } from 'sanity'

// Import all schema types
import { product } from './product'
import { category } from './category'
import { collection } from './collection'
import { banner } from './banner'
import { order } from './order'
import { siteSettings } from './siteSettings'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    product,
    category,
    collection,
    banner,
    order,
    siteSettings,
  ],
}
