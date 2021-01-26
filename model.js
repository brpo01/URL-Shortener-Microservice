/* Create URL Model */
let mongoose = require('mongoose')

let urlSchema = new mongoose.Schema({
  original : {type: String, required: true},
  short: {type: Number}
})

let urlModel = mongoose.model('URL', urlSchema)

module.exports = urlModel
