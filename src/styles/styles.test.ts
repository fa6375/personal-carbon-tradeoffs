/**
 * Checks of the global styles that jsdom cannot measure: visible focus,
 * reduced motion and WCAG 2.2 contrast of the text colours in the design
 * tokens and the status colours used by the features.
 */
/// <reference types="node" />
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const base = readFileSync(join(here, 'base.css'), 'utf8')
const tokensCss = readFileSync(join(here, 'tokens.css'), 'utf8')

function cssFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name: string) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return cssFiles(path)
    return name.endsWith('.css') ? [path] : []
  })
}

/** Every stylesheet in src, as text. */
const stylesheets = Object.fromEntries(cssFiles(join(here, '..')).map((file) => [file, readFileSync(file, 'utf8')]))
const tokens = Object.fromEntries([...tokensCss.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]))

/** WCAG relative luminance and contrast ratio. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(foreground: string, background: string): number {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (light + 0.05) / (dark + 0.05)
}

describe('focus and motion', () => {
  it('shows a visible focus outline of at least 2px for keyboard users', () => {
    const rule = /:focus-visible\s*\{([^}]*)\}/.exec(base)?.[1] ?? ''
    expect(rule).toMatch(/outline:\s*(\d+)px solid/)
    expect(Number(/outline:\s*(\d+)px/.exec(rule)?.[1])).toBeGreaterThanOrEqual(2)
  })

  it('never removes the outline on :focus-visible in any stylesheet', () => {
    expect(Object.keys(stylesheets).length).toBeGreaterThan(10)
    const offenders = Object.entries(stylesheets)
      .filter(([, css]) => /:focus-visible[^{]*\{[^}]*outline:\s*(none|0)\b/.test(css))
      .map(([file]) => file)
    expect(offenders).toEqual([])
  })

  it('turns off animations and transitions when the user prefers reduced motion', () => {
    const block = /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/.exec(base)?.[1] ?? ''
    expect(block).toMatch(/animation-duration:\s*0\.01ms !important/)
    expect(block).toMatch(/transition-duration:\s*0\.01ms !important/)
    expect(block).toMatch(/animation-iteration-count:\s*1 !important/)
  })
})

describe('colour contrast (WCAG 2.2 AA, 4.5:1 for normal text)', () => {
  const pairs: [string, string, string][] = [
    ['text on background', tokens['color-text'], tokens['color-bg']],
    ['muted text on surface', tokens['color-text-muted'], tokens['color-surface']],
    ['muted text on background', tokens['color-text-muted'], tokens['color-bg']],
    ['muted text on muted surface', tokens['color-text-muted'], tokens['color-surface-muted']],
    ['subtle text on surface', tokens['color-text-subtle'], tokens['color-surface']],
    ['subtle text on background', tokens['color-text-subtle'], tokens['color-bg']],
    ['primary text on surface', tokens['color-primary-text'], tokens['color-surface']],
    ['primary text on soft primary', tokens['color-primary-text'], tokens['color-primary-soft']],
    ['primary text on softer primary', tokens['color-primary-text'], tokens['color-primary-softer']],
    ['white on primary buttons', tokens['color-on-primary'], tokens['color-primary']],
    ['white on primary hover', tokens['color-on-primary'], tokens['color-primary-hover']],
    ['offline / warning text', '#7a4300', '#fdf1e2'],
    ['error text on error background', '#9b231a', '#fbeceb'],
    ['error text on surface', '#9b231a', tokens['color-surface']],
  ]

  it('has every token the checks need', () => {
    for (const name of ['color-text', 'color-text-muted', 'color-text-subtle', 'color-primary', 'color-primary-text', 'color-surface', 'color-bg']) {
      expect(tokens[name], name).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it.each(pairs)('%s is at least 4.5:1', (_name, foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5)
  })

  it('makes the focus outline stand out from the page (3:1 for non-text UI)', () => {
    expect(contrast(tokens['color-focus'], tokens['color-bg'])).toBeGreaterThanOrEqual(3)
    expect(contrast(tokens['color-focus'], tokens['color-surface'])).toBeGreaterThanOrEqual(3)
  })
})
