const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./db');
const Player = require('./models/Player');
const Team = require('./models/Team');
const Tournament = require('./models/Tournament');

const players = [
    { name: "Babar Hussain", region: "PUNJAB", rank: "1", score: "4500" },
    { name: "Asim Qureshi", region: "SINDH", rank: "2", score: "4200" },
    { name: "Fahad Khawaja", region: "KPK", rank: "3", score: "3900" },
    { name: "Hamza Ali", region: "ISLAMABAD", rank: "4", score: "3700" },
    { name: "Shah Khan", region: "BALOCHISTAN", rank: "5", score: "3500" },
    { name: "Rizwan Ahmad", region: "PUNJAB", rank: "6", score: "3100" },
    { name: "Ayesha Khan", region: "ISLAMABAD", rank: "7", score: "2800", gender: "F" },
    { name: "Mariam Ali", region: "ISLAMABAD", rank: "8", score: "2750", gender: "F" },
    { name: "Zara Ahmed", region: "ISLAMABAD", rank: "9", score: "2700", gender: "F" },
    { name: "Hira Siddiqui", region: "ISLAMABAD", rank: "10", score: "2650", gender: "F" },
    { name: "Usman Tariq", region: "KARACHI", rank: "11", score: "2600", gender: "M" }
];

const tournaments = [
    { id: 1, name: "National Table Tennis Championship", date: "2026-06-15", location: "Lahore", prize: "PKR 500,000" },
    { id: 2, name: "Punjab Open TT Tournament", date: "2026-07-01", location: "Islamabad", prize: "PKR 250,000" },
    { id: 3, name: "Sindh Table Tennis League", date: "2026-07-20", location: "Karachi", prize: "PKR 300,000" },
    { id: 4, name: "Islamabad Winter TT Cup", date: "2026-08-10", location: "Islamabad", prize: "PKR 200,000" },
    { id: 5, name: "National Youth Table Tennis Cup", date: "2026-09-05", location: "Rawalpindi", prize: "PKR 150,000" }
];

const teams = [
    { id: 1, name: "Lahore Table Tennis Club", region: "PUNJAB", players: 12 },
    { id: 2, name: "Karachi TT Academy", region: "SINDH", players: 15 },
    { id: 3, name: "Islamabad Ping Pong Union", region: "ISLAMABAD", players: 8 },
    { id: 4, name: "Peshawar TT Warriors", region: "KPK", players: 10 },
    { id: 5, name: "Quetta Smashers", region: "BALOCHISTAN", players: 9 },
    { id: 6, name: "Rawalpindi Spin Masters", region: "PUNJAB", players: 14 },
    { id: 7, name: "Multan Topspin Syndicate", region: "PUNJAB", players: 11 },
    { id: 8, name: "Hyderabad Paddle Kings", region: "SINDH", players: 13 },
    { id: 9, name: "Faisalabad TT Titans", region: "PUNJAB", players: 16 },
    { id: 10, name: "Abbottabad Elevation TT", region: "KPK", players: 7 },
    { id: 11, name: "Gwadar Coastal Pings", region: "BALOCHISTAN", players: 10 }
];

async function insertMissing(model, docs, key) {
    const values = docs.map(function (doc) {
        return doc[key];
    });
    const existingDocs = await model.find({ [key]: { $in: values } }).select(key).lean();
    const existingValues = new Set(existingDocs.map(function (doc) {
        return doc[key];
    }));
    const missingDocs = docs.filter(function (doc) {
        return !existingValues.has(doc[key]);
    });

    if (!missingDocs.length) {
        return 0;
    }

    await model.collection.insertMany(missingDocs, { ordered: false });
    return missingDocs.length;
}

async function seed() {
    try {
        await connectDB();

        if (mongoose.connection.readyState !== 1) {
            throw new Error('MongoDB connection is not ready.');
        }

        const insertedPlayers = await insertMissing(Player, players, 'name');
        const insertedTournaments = await insertMissing(Tournament, tournaments, 'id');
        const insertedTeams = await insertMissing(Team, teams, 'id');

        console.log('Seed complete.');
        console.log('Players inserted:', insertedPlayers);
        console.log('Tournaments inserted:', insertedTournaments);
        console.log('Teams inserted:', insertedTeams);
    } catch (error) {
        console.error('Seed failed:', error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seed();
