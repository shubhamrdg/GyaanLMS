import { Fragment, createElement } from 'react'

const inlinePattern = /(\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_)/g
const headingTags = ['h2', 'h3', 'h4', 'h5', 'h6', 'h6']
const headingSizes = ['text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm', 'text-sm']

const renderText = (text, key) => text.split('\n').flatMap((line, index) => (
  index === 0
    ? [line]
    : [<br key={`${key}-break-${index}`} />, line]
))

const renderInline = (text, keyPrefix) => {
  const nodes = []
  let cursor = 0
  let tokenIndex = 0

  for (const match of text.matchAll(inlinePattern)) {
    const start = match.index ?? 0
    if (start > cursor) {
      nodes.push(...renderText(text.slice(cursor, start), `${keyPrefix}-${tokenIndex++}`))
    }

    let node
    if (match[2]) {
      const href = match[3].trim()
      node = /^(https?:\/\/|mailto:)/i.test(href)
        ? <a href={href} target="_blank" rel="noreferrer" className="text-primary-700 underline underline-offset-2 dark:text-primary-300">{match[2]}</a>
        : match[2]
    } else if (match[5]) {
      node = <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-gray-800">{match[5]}</code>
    } else if (match[6] || match[7]) {
      node = <strong>{match[6] || match[7]}</strong>
    } else {
      node = <em>{match[8] || match[9]}</em>
    }

    nodes.push(<Fragment key={`${keyPrefix}-token-${tokenIndex++}`}>{node}</Fragment>)
    cursor = start + match[0].length
  }

  if (cursor < text.length) {
    nodes.push(...renderText(text.slice(cursor), `${keyPrefix}-${tokenIndex}`))
  }

  return nodes
}

const isBlockStart = (line) => (
  /^ {0,3}(?:#{1,6}\s|```|>\s?|[-*+]\s+|\d+\.\s+)/.test(line)
)

const MarkdownContent = ({ source = '', className = '' }) => {
  if (!source.trim()) return null

  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) {
      index += 1
      continue
    }

    const fence = line.match(/^ {0,3}```\s*([\w-]*)\s*$/)
    if (fence) {
      const codeLines = []
      index += 1
      while (index < lines.length && !/^ {0,3}```\s*$/.test(lines[index])) {
        codeLines.push(lines[index])
        index += 1
      }
      if (index < lines.length) index += 1
      blocks.push(
        <pre key={`code-${blocks.length}`} className="overflow-x-auto rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-800">
          <code className="font-mono">{codeLines.join('\n')}</code>
        </pre>
      )
      continue
    }

    const heading = line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/)
    if (heading) {
      const headingLevel = heading[1].length - 1
      blocks.push(createElement(
        headingTags[headingLevel],
        {
          key: `heading-${blocks.length}`,
          className: `${headingSizes[headingLevel]} font-bold leading-tight text-gray-900 dark:text-white`,
        },
        renderInline(heading[2], `heading-${blocks.length}`)
      ))
      index += 1
      continue
    }

    if (/^ {0,3}>\s?/.test(line)) {
      const quoteLines = []
      while (index < lines.length && /^ {0,3}>\s?/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^ {0,3}>\s?/, ''))
        index += 1
      }
      blocks.push(
        <blockquote key={`quote-${blocks.length}`} className="border-l-4 border-primary-300 pl-4 text-gray-600 dark:border-primary-700 dark:text-gray-300">
          {renderInline(quoteLines.join('\n'), `quote-${blocks.length}`)}
        </blockquote>
      )
      continue
    }

    const listItem = line.match(/^ {0,3}([-*+])\s+(.+)$|^ {0,3}(\d+)\.\s+(.+)$/)
    if (listItem) {
      const ordered = Boolean(listItem[3])
      const items = []
      while (index < lines.length) {
        const item = lines[index].match(/^ {0,3}([-*+])\s+(.+)$|^ {0,3}(\d+)\.\s+(.+)$/)
        if (!item || Boolean(item[3]) !== ordered) break
        items.push(item[2] || item[4])
        index += 1
      }
      const List = ordered ? 'ol' : 'ul'
      blocks.push(
        <List key={`list-${blocks.length}`} className={ordered ? 'list-decimal space-y-1 pl-6' : 'list-disc space-y-1 pl-6'}>
          {items.map((item, itemIndex) => (
            <li key={`list-item-${itemIndex}`}>{renderInline(item, `list-${blocks.length}-${itemIndex}`)}</li>
          ))}
        </List>
      )
      continue
    }

    const paragraphLines = [line]
    index += 1
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
      paragraphLines.push(lines[index])
      index += 1
    }
    blocks.push(
      <p key={`paragraph-${blocks.length}`} className="leading-6 text-gray-600 dark:text-gray-300">
        {renderInline(paragraphLines.join('\n'), `paragraph-${blocks.length}`)}
      </p>
    )
  }

  return <div className={`space-y-3 break-words ${className}`}>{blocks}</div>
}

export default MarkdownContent
