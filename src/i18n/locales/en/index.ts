/** English source messages. Every other language must have the same keys (checked by TypeScript and tests). */
import { common } from './common'
import { compare } from './compare'
import { goals } from './goals'
import { tracking } from './tracking'

export const en = {
  ...common,
  ...compare,
  ...goals,
  ...tracking,
}
