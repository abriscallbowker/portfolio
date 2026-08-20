import {defineField, defineType} from 'sanity'
import {ImagesIcon} from '@sanity/icons'

const MONTHS = [
  {title: 'January', value: 1},
  {title: 'February', value: 2},
  {title: 'March', value: 3},
  {title: 'April', value: 4},
  {title: 'May', value: 5},
  {title: 'June', value: 6},
  {title: 'July', value: 7},
  {title: 'August', value: 8},
  {title: 'September', value: 9},
  {title: 'October', value: 10},
  {title: 'November', value: 11},
  {title: 'December', value: 12},
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({length: currentYear - 2009}, (_, index) => {
  const year = currentYear + 1 - index
  return {title: String(year), value: year}
})

const MONTH_LABELS = MONTHS.map((month) => month.title.slice(0, 3))

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
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          {title: 'Mobile', value: 'mobile'},
          {title: 'Laptop', value: 'laptop'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'object',
      options: {columns: 2},
      fields: [
        defineField({
          name: 'month',
          title: 'Month',
          type: 'number',
          options: {list: MONTHS},
          validation: (rule) => rule.required().min(1).max(12),
        }),
        defineField({
          name: 'year',
          title: 'Year',
          type: 'number',
          options: {list: YEARS},
          validation: (rule) => rule.required().integer().min(2010),
        }),
      ],
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
      type: 'type',
      month: 'date.month',
      year: 'date.year',
    },
    prepare({title, media, type, month, year}) {
      const typeLabel = type === 'laptop' ? 'Laptop' : type === 'mobile' ? 'Mobile' : undefined
      const dateLabel =
        typeof month === 'number' && typeof year === 'number'
          ? `${MONTH_LABELS[month - 1] ?? month} ${year}`
          : undefined
      return {
        title,
        subtitle: [typeLabel, dateLabel].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
