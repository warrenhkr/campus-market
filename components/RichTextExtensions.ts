import { Node, mergeAttributes } from '@tiptap/core'

export interface VideoOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (attributes: { src: string; poster?: string; width?: string; height?: string }) => ReturnType
    }
    callToAction: {
      setCallToAction: (attributes: {
        label?: string
        href?: string
        background?: string
        textColor?: string
        borderRadius?: string
        align?: 'left' | 'center' | 'right'
      }) => ReturnType
    }
  }
}

export const TiptapVideo = Node.create<VideoOptions>({
  name: 'video',
  group: 'block',
  draggable: true,
  selectable: true,
  atom: true,

  addOptions() {
    return { HTMLAttributes: {} }
  },

  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
      width: { default: '100%' },
      height: { default: 'auto' },
      controls: { default: true },
    }
  },

  parseHTML() {
    return [{ tag: 'video[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'video',
      mergeAttributes(
        this.options.HTMLAttributes,
        {
          controls: 'controls',
          class: 'rte-video',
          style: 'max-width:100%;height:auto;display:block;border-radius:1rem;overflow:hidden;',
        },
        HTMLAttributes
      ),
    ]
  },

  addCommands() {
    return {
      setVideo:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: attributes }),
    }
  },
})

export const CallToAction = Node.create({
  name: 'callToAction',
  group: 'block',
  draggable: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      label: { default: 'JE PROFITE' },
      href: { default: '#' },
      background: { default: '#2563eb' },
      textColor: { default: '#ffffff' },
      borderRadius: { default: '9999px' },
      align: { default: 'center' },
    }
  },

  parseHTML() {
    return [{ tag: 'a[data-cta-button="true"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const { label, background, textColor, borderRadius, align, ...rest } = HTMLAttributes
    const justify = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'
    return [
      'div',
      { style: `display:flex;justify-content:${justify};width:100%;` },
      [
        'a',
        mergeAttributes(
          {
            'data-cta-button': 'true',
            target: '_blank',
            rel: 'noreferrer noopener',
            style: `display:inline-flex;justify-content:center;align-items:center;padding:0.9rem 1.6rem;font-weight:700;text-decoration:none;background:${background};color:${textColor};border-radius:${borderRadius};line-height:1;`,
          },
          rest
        ),
        label || 'JE PROFITE',
      ],
    ]
  },

  addCommands() {
    return {
      setCallToAction:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: attributes }),
    }
  },
})
