const post = require('./post-comics')
const schedule = require('node-schedule')

// runs every hour at the 11th minute
schedule.scheduleJob('11 * * * *', () => {
  post()
})
