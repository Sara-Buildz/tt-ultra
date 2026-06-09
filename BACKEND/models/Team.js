const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
    {
        id: { type: Number },
        name: { type: String, required: true },
        region: { type: String, required: true },
        players: { type: Number, required: true }
    },
    {
        collection: 'teams',
        versionKey: false
    }
);

module.exports = mongoose.model('Team', teamSchema);
