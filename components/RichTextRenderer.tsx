'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Typography from '@tiptap/extension-typography'
import { TiptapVideo, CallToAction } from './RichTextExtensions'
import { TextStyleAttributes } from './TextStyleAttributes'

interface RichTextRendererProps {
  value: string
  className?: string
}

const parseRichTextValue = (value: string) => {
  if (!value) return ''
  try {
    const json = JSON.parse(value)
    if (typeof json === 'object' && json !== null) {
      return json
    }
  } catch {
    return value
  }
  return value
}

export function RichTextRenderer({ value, className }: RichTextRendererProps) {
  const editor = useEditor({
    editable: false,
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false, // configuré séparément ci-dessous
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noreferrer noopener', target: '_blank' },
      }),
      Image.configure({
        HTMLAttributes: { loading: 'lazy' },
      }),
      TiptapVideo,
      CallToAction,
      TextStyle,
      TextStyleAttributes,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Typography,
    ],
    content: parseRichTextValue(value),
    editorProps: {
      attributes: {
        class:
          'rte-content prose max-w-full prose-sm sm:prose-base prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:max-w-full prose-blockquote:border-l-primary/40 prose-blockquote:not-italic focus:outline-none',
      },
    },
  })

  if (!editor) {
    return <div className={`rich-text-renderer animate-pulse ${className ?? ''}`} />
  }

  return (
    <div className={`rich-text-renderer ${className ?? ''}`}>
      <EditorContent editor={editor} />
    </div>
  )
}
