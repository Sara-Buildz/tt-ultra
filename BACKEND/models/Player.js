const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        region: { type: String, required: true },
        rank: { type: String, required: true },
        score: { type: String, required: true }
    },
    {
        collection: 'players',
        versionKey: false
    }
);

module.exports = mongoose.model('Player', playerSchema);
