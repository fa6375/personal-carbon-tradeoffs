import type { Messages } from '../../types'
import { common } from './common'
import { goals } from './goals'
import { tracking } from './tracking'

export const de: Messages = {
  ...common,
  ...goals,
  ...tracking,
}
