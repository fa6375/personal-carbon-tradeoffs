/** English source messages. Every other language must have the same keys (checked by TypeScript and tests). */
import { common } from './common'
import { goals } from './goals'
import { tracking } from './tracking'

export const en = {
  ...common,
  ...goals,
  ...tracking,
}
