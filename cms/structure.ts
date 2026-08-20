import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('writing').child(
        S.documentTypeList('writing')
          .title('Writing')
          .defaultOrdering([{field: 'publishedAt', direction: 'desc'}]),
      ),
      S.documentTypeListItem('screenshot').child(
        S.documentTypeList('screenshot')
          .title('Screenshots')
          .defaultOrdering([
            {field: 'date.year', direction: 'desc'},
            {field: 'date.month', direction: 'desc'},
          ]),
      ),
    ])
