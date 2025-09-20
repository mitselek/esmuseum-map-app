// Simple script to debug language behavior
console.log('Testing language behavior on dev server...')

// Kill the dev server if running
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function runTest() {
  try {
    // Test the current language behavior
    const { stdout, stderr } = await execAsync('curl -k https://localhost:3001/ -s')
    console.log('Response from root URL:')
    console.log(stdout.substring(0, 500) + '...')
    
    // Test Ukrainian URL
    const { stdout: ukStdout, stderr: ukStderr } = await execAsync('curl -k https://localhost:3001/uk -s')
    console.log('\nResponse from /uk URL:')
    console.log(ukStdout.substring(0, 500) + '...')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

runTest()