import {defineField, defineType} from 'sanity'
import {ImagesIcon} from '@sanity/icons'

export const screenshot = defineType({
  name: 'screenshot',
  title: 'Screenshots',
  type: 'document',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'file',
      options: {accept: 'video/*'},
    }),
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description: 'Describe the image or video for accessibility.',
      validation: (rule) => rule.warning('Alt text is important for accessibility'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      description: 'description',
    },
    prepare({title, media, description}) {
      return {
        title,
        subtitle: description,
        media,
      }
    },
  },
})
