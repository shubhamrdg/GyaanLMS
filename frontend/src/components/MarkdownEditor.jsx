import MarkdownContent from './MarkdownContent'

const MarkdownEditor = ({ value = '', onChange, id = 'lecture-description' }) => (
  <div>
    <label htmlFor={id} className="label">Lecture Description (Markdown)</label>
    <textarea
      id={id}
      className="input font-mono text-sm"
      rows={6}
      placeholder={'## What you will learn\n- First concept\n- Second concept'}
      value={value}
      onChange={event => onChange(event.target.value)}
      aria-describedby={`${id}-help`}
    />
    <p id={`${id}-help`} className="mt-2 text-xs text-gray-500 dark:text-gray-400">
      Use Markdown headings, lists, links, bold, italics, and code. Raw HTML is not rendered.
    </p>
    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Preview</p>
      {value.trim()
        ? <MarkdownContent source={value} />
        : <p className="text-sm text-gray-400">Your formatted description will appear here.</p>}
    </div>
  </div>
)

export default MarkdownEditor
