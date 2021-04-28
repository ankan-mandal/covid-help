const mongoose = require("mongoose")

const dataSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    requirement: {
        type: String,
        required: true,
    },
    detail: {
        type: String,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    who: {
        type: String,
        required: true,
    }, 
    uuid: {
        type: String,
        required: true
    },
    date: { type : Date, default: Date.now },
})

module.exports = mongoose.model('Data', dataSchema)