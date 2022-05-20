import { default as chalk } from 'chalk'
import { default as express } from 'express'
import { highlight } from 'cli-highlight'

const app = express()
const port = 3000

app.use(express.json())
app.use((req, res, next) => {
    const time = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
    const body = JSON.stringify(req.body, null, 2)
    const send = res.send

    // Hack to store response body for logging
    res.send = function (body) {
        this.body = body.trim()
        send.apply(this, arguments)
    }

    console.log(`
${chalk.gray(time)} ${chalk.green.bold(req.method)} ${req.url}
${highlight(body, { language: 'json' })}`)

    next()

    if (res.body) {
        console.log(`
${chalk.gray('-'.repeat(8))} ${chalk.blue.bold(res.statusCode + ' ' + res.statusMessage)}
${highlight(res.body, { language: 'xml' })}`)
    } else {
        console.log(`
${chalk.gray('-'.repeat(8))} ${chalk.blue.bold(res.statusCode + ' ' + res.statusMessage)}`)
    }
})

app.post('/say-hello', (req, res) => res.send(`
<Bxml>
  <SpeakSentence>Hello world!</SpeakSentence>
</Bxml>
`))

app.post('/say-digits', (req, res) => res.send(`
<Bxml>
  <SpeakSentence>You dialed: ${req.body.digits}</SpeakSentence>
</Bxml>
`))

app.post('/gather', (req, res) => res.send(`
<Bxml>
  <Gather 
    gatherUrl="/say-digits"
    maxDigits="3"
    firstDigitTimeout="60"/>
</Bxml>
`))

app.listen(port, () => {
    console.log(`Programmable Voice app listening on port ${port}`)
})