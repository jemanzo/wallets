// =============================
// CONSOLE TOOLS
// =============================

const chalk = require('chalk')
const repl = require('repl')

class ConsoleTools {
  open (prompt, varArray, tips) {
    if (process.argv.indexOf('--no-console') > -1) {
      console.log('ConsoleTools: running in "--no-console" mode')
      return false
    }
    if (tips) {
      console.log('')
      if (Array.isArray(tips)) {
        for (let i = 0; i < tips.length; i++) {
          console.log(tips[i])
        }
      } else { console.log(tips) }
      console.log('')
    }
    prompt = `${(chalk) ? chalk.yellowBright(prompt) : prompt} > `
    const replServer = repl.start({ prompt, useGlobal: true, ignoreUndefined: true })
    Object.assign(replServer.context, varArray)
    return replServer
  }
  displayPrompt () {
    if (repl) { repl.repl.displayPrompt() }
  }
}

module.exports = new ConsoleTools()
