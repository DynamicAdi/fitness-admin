import { type SchemaTypeDefinition } from 'sanity'
import blog from './blog'
import blockContent from './blockContent'
import user from './user'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blog, blockContent, user],
}