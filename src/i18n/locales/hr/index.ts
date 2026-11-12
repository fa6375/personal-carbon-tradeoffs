import type { Messages } from '../../types'
import { common } from './common'
import { goals } from './goals'
import { tracking } from './tracking'

export const hr: Messages = {
  ...common,
  ...goals,
  ...tracking,
}
