import type { Messages } from '../../types'
import { common } from './common'
import { compare } from './compare'
import { goals } from './goals'
import { tracking } from './tracking'

export const hr: Messages = {
  ...common,
  ...compare,
  ...goals,
  ...tracking,
}
