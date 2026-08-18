import { Extension, getStyleProperty } from '@tiptap/core'
import '@tiptap/extension-text-style'

/**
 * Adds a small set of global attributes on the `textStyle` mark so font-family,
 * font-size, line-height and letter-spacing are persisted in the Tiptap JSON.
 *
 * This avoids depending on external community packages for font-size / line-height
 * and keeps parsing/rendering consistent between editor and renderer.
 */

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textStyleAttrs: {
      setFontFamily: (fontFamily: string) => ReturnType
      unsetFontFamily: () => ReturnType
      setFontSize: (fontSize: string) => ReturnType
      unsetFontSize: () => ReturnType
      setLineHeight: (lineHeight: string) => ReturnType
      unsetLineHeight: () => ReturnType
      setLetterSpacing: (letterSpacing: string) => ReturnType
      unsetLetterSpacing: () => ReturnType
    }
  }
}

declare module '@tiptap/extension-text-style' {
  interface TextStyleAttributes {
    fontFamily?: string | null
    fontSize?: string | null
    lineHeight?: string | null
    letterSpacing?: string | null
  }
}

export const TextStyleAttributes = Extension.create({
  name: 'textStyleAttributes',

  addOptions() {
    return { types: ['textStyle'] }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              getStyleProperty(element, 'font-family') ?? (element.style.fontFamily || null),
            renderHTML: (attributes) => {
              if (!attributes.fontFamily) return {}
              return { style: `font-family: ${attributes.fontFamily}` }
            },
          },
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              getStyleProperty(element, 'font-size') ?? (element.style.fontSize || null),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
          lineHeight: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              getStyleProperty(element, 'line-height') ?? (element.style.lineHeight || null),
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {}
              return { style: `line-height: ${attributes.lineHeight}` }
            },
          },
          letterSpacing: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              getStyleProperty(element, 'letter-spacing') ?? (element.style.letterSpacing || null),
            renderHTML: (attributes) => {
              if (!attributes.letterSpacing) return {}
              return { style: `letter-spacing: ${attributes.letterSpacing}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontFamily:
        (fontFamily: string) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontFamily }).run(),
      unsetFontFamily:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontFamily: null }).removeEmptyTextStyle().run(),
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
      setLineHeight:
        (lineHeight: string) =>
        ({ chain }) =>
          chain().setMark('textStyle', { lineHeight }).run(),
      unsetLineHeight:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { lineHeight: null }).removeEmptyTextStyle().run(),
      setLetterSpacing:
        (letterSpacing: string) =>
        ({ chain }) =>
          chain().setMark('textStyle', { letterSpacing }).run(),
      unsetLetterSpacing:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { letterSpacing: null }).removeEmptyTextStyle().run(),
    }
  },
})
