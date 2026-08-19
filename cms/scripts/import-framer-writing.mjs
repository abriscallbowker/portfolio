import {randomUUID} from 'node:crypto'
import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const cmsRoot = path.resolve(here, '..')
const repoRoot = path.resolve(cmsRoot, '..')

await loadEnvFile(path.join(repoRoot, '.env.sanity'))
await loadEnvFile(path.join(cmsRoot, '.env'))

const projectId = process.env.SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || 'hznmqs29'
const dataset = process.env.SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production'
const token = process.env.SANITY_AUTH_TOKEN || process.env.SANITY_API_WRITE_TOKEN
const apiVersion = '2026-08-19'

if (!token) {
  throw new Error('Missing SANITY_AUTH_TOKEN or SANITY_API_WRITE_TOKEN')
}

const csvPath = path.join(repoRoot, 'framer-export.csv')
const mutateUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`
const assetUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/assets/images/${dataset}`

const imageCache = new Map()

async function loadEnvFile(filePath) {
  try {
    const source = await readFile(filePath, 'utf8')
    for (const line of source.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim()
      if (!process.env[key]) process.env[key] = value
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i += 1
      row.push(field)
      field = ''
      if (row.some((value) => value.length > 0)) rows.push(row)
      row = []
    } else {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const headers = rows[0]
  return rows.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])),
  )
}

function key() {
  return randomUUID().replaceAll('-', '').slice(0, 12)
}

function normalizeHref(href) {
  if (!href) return href
  const decoded = decodeEntities(href).trim()
  if (/^[a-z][a-z0-9+.-]*:/i.test(decoded) || decoded.startsWith('/') || decoded.startsWith('#')) {
    return decoded
  }
  return `https://${decoded}`
}

function decodeEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&nbsp;', ' ')
}

function filenameFromUrl(url) {
  try {
    const pathname = new URL(url).pathname
    const base = pathname.split('/').filter(Boolean).at(-1) || 'image'
    return base.includes('.') ? base : `${base}.webp`
  } catch {
    return 'image.webp'
  }
}

async function uploadImage(url) {
  const cached = imageCache.get(url)
  if (cached) return cached

  const imageResponse = await fetch(url)
  if (!imageResponse.ok) {
    throw new Error(`Failed to download ${url}: ${imageResponse.status}`)
  }

  const bytes = Buffer.from(await imageResponse.arrayBuffer())
  const filename = filenameFromUrl(url)
  const uploadResponse = await fetch(`${assetUrl}?filename=${encodeURIComponent(filename)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': imageResponse.headers.get('content-type') || 'application/octet-stream',
    },
    body: bytes,
  })

  if (!uploadResponse.ok) {
    const detail = await uploadResponse.text()
    throw new Error(`Asset upload failed for ${url}: ${uploadResponse.status} ${detail}`)
  }

  const json = await uploadResponse.json()
  const assetId = json.document._id
  imageCache.set(url, assetId)
  return assetId
}

function parseInline(html) {
  const children = []
  const markDefs = []
  const remaining = html.replaceAll(/<br\b[^>]*>/gi, '\n')

  function pushText(text, marks) {
    const decoded = decodeEntities(text)
    if (!decoded) return
    children.push({
      _type: 'span',
      _key: key(),
      marks,
      text: decoded,
    })
  }

  function walk(input, marks) {
    let remaining = input
    const pattern = /<(em|strong|b|i|a)(\s[^>]*)?>([\s\S]*?)<\/\1>/i

    while (remaining.length > 0) {
      const match = remaining.match(pattern)
      if (!match || match.index === undefined) {
        pushText(remaining.replace(/<[^>]+>/g, ''), marks)
        break
      }

      if (match.index > 0) {
        pushText(remaining.slice(0, match.index).replace(/<[^>]+>/g, ''), marks)
      }

      const tag = match[1].toLowerCase()
      const attrs = match[2] || ''
      const inner = match[3]
      const nextMarks = [...marks]

      if (tag === 'em' || tag === 'i') nextMarks.push('em')
      if (tag === 'strong' || tag === 'b') nextMarks.push('strong')
      if (tag === 'a') {
        const href = normalizeHref(attrs.match(/href="([^"]*)"/i)?.[1])
        if (href) {
          const markKey = key()
          markDefs.push({_type: 'link', _key: markKey, href})
          nextMarks.push(markKey)
        }
      }

      walk(inner, nextMarks)
      remaining = remaining.slice(match.index + match[0].length)
    }
  }

  walk(remaining, [])
  return {children, markDefs}
}

function textBlock(style, html, listItem) {
  const {children, markDefs} = parseInline(html)
  if (children.length === 0) {
    children.push({_type: 'span', _key: key(), marks: [], text: ''})
  }

  const block = {
    _type: 'block',
    _key: key(),
    style,
    markDefs,
    children,
  }

  if (listItem) {
    block.listItem = listItem
    block.level = 1
  }

  return block
}

function htmlToBlocks(html, assetsByUrl) {
  const blocks = []
  const pattern =
    /<img\b[^>]*>|<(p|ol|ul|blockquote|h[1-6])\b[^>]*>[\s\S]*?<\/\1>/gi
  const matches = html.match(pattern) || []

  for (const chunk of matches) {
    const imageMatch = chunk.match(/^<img\b([^>]*)>/i)
    if (imageMatch) {
      const attrs = imageMatch[1]
      const src = attrs.match(/src="([^"]*)"/i)?.[1]
      const alt = attrs.match(/alt="([^"]*)"/i)?.[1] || ''
      const assetId = src ? assetsByUrl.get(src) : undefined
      if (assetId) {
        blocks.push({
          _type: 'image',
          _key: key(),
          alt: decodeEntities(alt),
          asset: {_type: 'reference', _ref: assetId},
        })
      }
      continue
    }

    const heading = chunk.match(/^<h([1-6])\b[^>]*>([\s\S]*)<\/h\1>$/i)
    if (heading) {
      blocks.push(textBlock(`h${heading[1]}`, heading[2]))
      continue
    }

    const paragraph = chunk.match(/^<p\b[^>]*>([\s\S]*)<\/p>$/i)
    if (paragraph) {
      const inner = paragraph[1].replaceAll(/<br\b[^>]*>/gi, '\n').trim()
      if (inner.replaceAll(/<[^>]+>/g, '').trim() === '' && !/<img/i.test(inner)) continue
      blocks.push(textBlock('normal', paragraph[1]))
      continue
    }

    const quote = chunk.match(/^<blockquote\b[^>]*>([\s\S]*)<\/blockquote>$/i)
    if (quote) {
      const inner = quote[1].replace(/^<p\b[^>]*>/i, '').replace(/<\/p>$/i, '')
      blocks.push(textBlock('blockquote', inner))
      continue
    }

    const list = chunk.match(/^<(ol|ul)\b[^>]*>([\s\S]*)<\/\1>$/i)
    if (list) {
      const listItem = list[1].toLowerCase() === 'ol' ? 'number' : 'bullet'
      const items = [...list[2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
      for (const item of items) {
        const inner = item[1].replace(/^<p\b[^>]*>/i, '').replace(/<\/p>$/i, '')
        blocks.push(textBlock('normal', inner, listItem))
      }
    }
  }

  return blocks
}

function collectImageUrls(html, coverUrl) {
  const urls = new Set()
  if (coverUrl) urls.add(coverUrl)
  for (const match of html.matchAll(/<img\b[^>]*src="([^"]+)"/gi)) {
    urls.add(match[1])
  }
  return [...urls]
}

function isDraft(value) {
  return value.trim().toLowerCase() === 'true'
}

async function mutate(mutations) {
  const response = await fetch(mutateUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({mutations}),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Mutate failed: ${response.status} ${detail}`)
  }

  return response.json()
}

async function importRow(row) {
  const slug = row.Slug.trim()
  const draft = isDraft(row[':draft'])
  const publishedId = `writing-${slug}`
  const documentId = draft ? `drafts.${publishedId}` : publishedId

  const imageUrls = collectImageUrls(row.Content, row['Cover Image'])
  const assetsByUrl = new Map()
  for (const url of imageUrls) {
    assetsByUrl.set(url, await uploadImage(url))
  }

  const coverAssetId = row['Cover Image'] ? assetsByUrl.get(row['Cover Image']) : undefined
  const body = htmlToBlocks(row.Content, assetsByUrl)

  const document = {
    _id: documentId,
    _type: 'writing',
    title: row.Title,
    slug: {_type: 'slug', current: slug},
    publishedAt: row.Date,
    body,
  }

  if (coverAssetId) {
    document.coverImage = {
      _type: 'image',
      alt: row['Cover Image:alt'] || '',
      asset: {_type: 'reference', _ref: coverAssetId},
    }
  }

  await mutate([{createOrReplace: document}])
  return {id: documentId, published: !draft, images: imageUrls.length, blocks: body.length}
}

const csv = await readFile(csvPath, 'utf8')
const rows = parseCsv(csv)

console.log(`Importing ${rows.length} writing entries from ${path.relative(repoRoot, csvPath)}`)

const results = []
for (const row of rows) {
  process.stdout.write(`- ${row.Slug}... `)
  try {
    const result = await importRow(row)
    results.push({slug: row.Slug, ...result})
    console.log(
      `${result.published ? 'published' : 'draft'} (${result.blocks} blocks, ${result.images} images)`,
    )
  } catch (error) {
    console.log('failed')
    throw error
  }
}

console.log('\nDone.')
for (const result of results) {
  console.log(`  ${result.slug} → ${result.id} (${result.published ? 'published' : 'draft'})`)
}
