const fs = require('fs')
const { get } = require('axios')
const config = require('./config.json')
const Twitter = require('twitter')
const t = new Twitter(config)

// you can probably change this 
// to another image-based subreddit
const subreddit = 'comics'
const count = 20

const url = `https://www.reddit.com/r/${subreddit}/top/.json?sort=top&t=day&count=${count}`

module.exports = async () => {
  try {
    const response = await get(url)

    // only post the ones with +1537 upvotes
    const top = response.data.data.children
      .filter(post => post.data.score > 1537)

    await Promise.all(
      top.map(async c => {
        const post = c.data

        const image_url = post.preview.images[0].source.url
        const image_response = await get(image_url, {
          responseType: 'arraybuffer'
        })

        const buf = new Buffer(image_response.data)
        const filename = `${post.id}.jpg`

        if (fs.existsSync(`comics/${filename}`)) {
          console.log(`${filename} was already posted`)
          return
        }

        fs.writeFileSync(`comics/${filename}`, buf)

        const file = fs.readFileSync(`comics/${filename}`)

        console.log(`${filename} saved. Posting...`)

        await t
          .post('media/upload', { media: file })
          .then(async (media, response) => {
            const tweet = {
              status: `"${post.title}" by /u/${post.author}`,
              media_ids: media.media_id_string
            }

            await t.post('statuses/update', tweet).then((result, response) => {
              console.log(`OK: ${result.id} `)
            })
          })
      })
    )
  } catch (err) {
    console.log(err)
  }
}
