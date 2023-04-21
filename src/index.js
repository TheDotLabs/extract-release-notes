// SPDX-License-Identifier: MIT
const core = require('@actions/core')
const fs = require('fs')
const readline = require('readline')

const encoding = 'utf8'
const eol = '\n'

main().catch(err => core.setFailed(err.message))
// test().catch(err => core.setFailed(err.message))

async function main() {
    const changelogFile = core.getInput('changelog_file', {required: true})
    core.debug(`changelog-file = '${changelogFile}'`)

    const releaseNotes = await extractReleaseNotes(changelogFile)
    core.debug(`release-notes = '${releaseNotes}'`)

    core.setOutput("release_notes", releaseNotes)
}

// eslint-disable-next-line no-unused-vars
async function test() {
    const changelogFile = 'CHANGELOG.md'
    console.log(`${changelogFile}`)

    const releaseNotes = await extractReleaseNotes(changelogFile)
    console.log(`${releaseNotes}`)

}

async function extractReleaseNotes(changelogFile) {
    const fileStream = fs.createReadStream(changelogFile, {encoding: encoding})
    const rl = readline.createInterface({
        input: fileStream
    })
    const lines = []
    let inside_release = false
    for await (const line of rl) {
        const start_of_a_release = (!!line.startsWith("## ["));
        if (inside_release && start_of_a_release) {
            break
        } else if (inside_release || start_of_a_release) {
            inside_release = true
            core.debug(`'${line}'`)
            lines.push(line)
        }
    }
    let releaseNotes = lines.map(value=>value.toString()).reduce((previousValue, currentValue) => previousValue + eol + currentValue)
    return releaseNotes.trim()
}