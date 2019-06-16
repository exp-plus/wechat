import Miniprogram from './lib/miniprogram'
import OfficialAccount from './lib/official-account'
import Lark from './lib/lark'
declare module 'egg' {
    interface Application {
        miniprogram: Miniprogram
        officialAccount: OfficialAccount
        lark: Lark
    }
}