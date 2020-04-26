const functions = {
  addTransaction: './addTransaction',
  joinGroup: './joinGroup'
} as { [functionName: string]: string }

for (const name in functions) {
  if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === name) {
    exports[name] = require(functions[name])
  }
}
