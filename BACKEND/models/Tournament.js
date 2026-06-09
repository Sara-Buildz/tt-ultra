const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema(
    {
        id: { type: Number },
        name: { type: String, required: true },
        date: { type: String, required: true },
        location: { type: String, required: true },
        prize: { type: String }
    },
    {
        collection: 'tournaments',
        versionKey: false
    }
);

module.exports = mongoose.model('Tournament', tournamentSchema);
