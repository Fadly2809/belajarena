/**
 * Lightweight & Safe Markdown Renderer for AI Chatbot
 * Formats Markdown (headers, bold, italics, tables, code blocks, lists) into clean HTML.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function renderMarkdown(markdown: string): string {
  if (!markdown) return ''

  // Pre-process code blocks so their contents aren't mangled by regex
  const codeBlocks: string[] = []
  let processed = markdown.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const id = codeBlocks.length
    const cleanLang = lang.trim() || 'code'
    const escapedCode = escapeHtml(code.trim())
    
    codeBlocks.push(`
      <div class="my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 text-slate-100 font-mono text-xs shadow-md">
        <div class="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
          <span class="flex items-center gap-1.5 font-bold tracking-wider uppercase text-blue-400">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>${cleanLang}
          </span>
          <span class="text-[10px] text-slate-400">SMPN 6 Kendari</span>
        </div>
        <pre class="p-3.5 overflow-x-auto text-[11px] leading-relaxed"><code>${escapedCode}</code></pre>
      </div>
    `)
    return `__CODE_BLOCK_${id}__`
  })

  // Escape remaining text
  const lines = processed.split('\n')
  const htmlLines: string[] = []
  let inList = false
  let listType: 'ul' | 'ol' = 'ul'
  let inTable = false
  let tableHeaderParsed = false

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // Check code block placeholder
    const codeMatch = line.match(/__CODE_BLOCK_(\d+)__/)
    if (codeMatch) {
      if (inList) { htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false }
      if (inTable) { htmlLines.push('</tbody></table></div>'); inTable = false; tableHeaderParsed = false }
      htmlLines.push(codeBlocks[parseInt(codeMatch[1])])
      continue
    }

    // Check table row
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        if (inList) { htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false }
        htmlLines.push('<div class="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-xs"><table class="min-w-full divide-y divide-slate-200 text-xs">')
        inTable = true
        tableHeaderParsed = false
      }

      // Check if this is the separator row (|---|---|)
      if (/^\|(\s*[-:]+[-| :]*)\|$/.test(line.trim())) {
        tableHeaderParsed = true
        continue
      }

      const cells = line.split('|').slice(1, -1).map(c => c.trim())
      if (!tableHeaderParsed) {
        htmlLines.push('<thead class="bg-slate-100 text-slate-700 font-bold"><tr>')
        cells.forEach(c => htmlLines.push(`<th class="px-3 py-2 text-left">${formatInline(c)}</th>`))
        htmlLines.push('</tr></thead><tbody class="divide-y divide-slate-100 bg-white">')
      } else {
        htmlLines.push('<tr class="hover:bg-slate-50">')
        cells.forEach(c => htmlLines.push(`<td class="px-3 py-2 text-slate-700">${formatInline(c)}</td>`))
        htmlLines.push('</tr>')
      }
      continue
    } else if (inTable) {
      htmlLines.push('</tbody></table></div>')
      inTable = false
      tableHeaderParsed = false
    }

    // Horizontal Rule
    if (/^---|\*\*\*|___$/.test(line.trim())) {
      if (inList) { htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false }
      htmlLines.push('<hr class="my-3 border-slate-200" />')
      continue
    }

    // Headings
    if (line.startsWith('#### ')) {
      if (inList) { htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false }
      htmlLines.push(`<h4 class="text-xs font-bold text-slate-900 mt-3 mb-1.5">${formatInline(line.slice(5))}</h4>`)
      continue
    }
    if (line.startsWith('### ')) {
      if (inList) { htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false }
      htmlLines.push(`<h3 class="text-sm font-bold text-slate-900 mt-3.5 mb-1.5 text-blue-900">${formatInline(line.slice(4))}</h3>`)
      continue
    }
    if (line.startsWith('## ')) {
      if (inList) { htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false }
      htmlLines.push(`<h2 class="text-base font-bold text-slate-900 mt-4 mb-2">${formatInline(line.slice(3))}</h2>`)
      continue
    }
    if (line.startsWith('# ')) {
      if (inList) { htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false }
      htmlLines.push(`<h1 class="text-lg font-bold text-slate-900 mt-4 mb-2">${formatInline(line.slice(2))}</h1>`)
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      if (inList) { htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false }
      htmlLines.push(`<blockquote class="border-l-4 border-blue-500 bg-blue-50/70 rounded-r-lg px-3 py-2 text-xs text-slate-700 italic my-2">${formatInline(line.slice(2))}</blockquote>`)
      continue
    }

    // Bullet List
    const bulletMatch = line.match(/^(\s*)[-*]\s+(.+)/)
    if (bulletMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) htmlLines.push('</ol>')
        htmlLines.push('<ul class="list-disc pl-5 my-1.5 space-y-1">')
        inList = true
        listType = 'ul'
      }
      htmlLines.push(`<li class="text-slate-700">${formatInline(bulletMatch[2])}</li>`)
      continue
    }

    // Numbered List
    const numMatch = line.match(/^(\s*)\d+\.\s+(.+)/)
    if (numMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) htmlLines.push('</ul>')
        htmlLines.push('<ol class="list-decimal pl-5 my-1.5 space-y-1">')
        inList = true
        listType = 'ol'
      }
      htmlLines.push(`<li class="text-slate-700">${formatInline(numMatch[2])}</li>`)
      continue
    }

    // Empty line or paragraph break
    if (!line.trim()) {
      if (inList) { htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false }
      continue
    }

    if (inList) {
      htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>')
      inList = false
    }

    htmlLines.push(`<p class="my-1.5 leading-relaxed text-slate-800">${formatInline(line)}</p>`)
  }

  if (inList) htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>')
  if (inTable) htmlLines.push('</tbody></table></div>')

  return htmlLines.join('\n')
}

function formatInline(text: string): string {
  let res = escapeHtml(text)

  // Bold & Italics
  res = res.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  res = res.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  res = res.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Inline Code
  res = res.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-blue-700 font-mono text-[11px] font-semibold">$1</code>')

  return res
}
