import { Fragment, type ReactNode } from 'react'

interface RichTextProps {
  /** Translated text that still contains {placeholders}, e.g. t('account.signedInAs'). */
  text: string
  /** Elements to put in place of each {placeholder}. */
  values: Record<string, ReactNode>
}

/**
 * Puts elements (links, <strong>) inside a translated sentence, so the word
 * order can differ between languages. Unknown placeholders are left as text.
 */
export function RichText({ text, values }: RichTextProps) {
  const parts = text.split(/(\{\w+\})/g)
  return (
    <>
      {parts.map((part, index) => {
        const name = /^\{(\w+)\}$/.exec(part)?.[1]
        return <Fragment key={index}>{name && name in values ? values[name] : part}</Fragment>
      })}
    </>
  )
}
