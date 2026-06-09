const mongoose = require('mongoose');

const connectDB = async () => {
    console.log('\n[MongoDB DEBUG] ─── connection diagnostics start ───');

    // STEP 1 — Environment variable (code/config issue if missing)
    const uri = (process.env.MONGO_URI || '').trim();
    console.log('[MongoDB DEBUG] Step 1 — MONGO_URI loaded:', uri ? 'YES' : 'NO');
    if (!uri) {
        console.error('❌ MongoDB: MONGO_URI is missing in BACKEND/.env');
        console.error('[MongoDB DEBUG] Fix: add MONGO_URI=mongodb+srv://... to BACKEND/.env');
        return;
    }
    console.log('[MongoDB DEBUG]   URI length:', uri.length);
    console.log('[MongoDB DEBUG]   URI scheme:', uri.startsWith('mongodb+srv://') ? 'mongodb+srv (Atlas SRV)' : uri.startsWith('mongodb://') ? 'mongodb (standard)' : 'UNKNOWN — check format');
    console.log("RAW MONGO URI:", process.env.MONGO_URI);
    // STEP 2 — URI format (code/config issue if malformed)
    let hostname = '';
    try {
        // Strip scheme for parsing — handle multi-host URIs
        const stripped = uri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'https://');
        // For multi-host URIs, only parse the first host
        const singleHost = stripped.replace(/,([^,]+):(\d+)/g, '');
        const parsed = new URL(singleHost);
        hostname = parsed.hostname;
        console.log('[MongoDB DEBUG] Step 2 — URI parse: OK');
        console.log('[MongoDB DEBUG]   Has username:', parsed.username ? 'YES' : 'NO');
        console.log('[MongoDB DEBUG]   Has password:', parsed.password ? 'YES (hidden)' : 'NO');
    } catch (parseErr) {
        console.error('[MongoDB DEBUG] Step 2 — URI parse: FAILED');
        console.error('[MongoDB DEBUG]   Parse error:', parseErr.message);
        console.error('❌ MongoDB: invalid MONGO_URI format — fix .env before retrying');
        return;
    }

    // STEP 3 — DNS SRV lookup (network/DNS issue if this fails — NOT auth)
    // querySrv ECONNREFUSED happens HERE: OS cannot reach DNS resolver for SRV records
    if (uri.startsWith('mongodb+srv://') && hostname) {
        const srvTarget = '_mongodb._tcp.' + hostname;
        console.log('[MongoDB DEBUG] Step 3 — DNS SRV lookup:', srvTarget);
        try {
            const srvRecords = await dns.resolveSrv(srvTarget);
            console.log('[MongoDB DEBUG]   SRV lookup: OK (' + srvRecords.length + ' record(s))');
            if (srvRecords[0]) {
                console.log('[MongoDB DEBUG]   First target:', srvRecords[0].name + ':' + srvRecords[0].port);
            }
        } catch (dnsErr) {
            console.error('[MongoDB DEBUG]   SRV lookup: FAILED');
            console.error('[MongoDB DEBUG]   DNS error:', dnsErr.message);
            console.error('[MongoDB DEBUG] ─── DIAGNOSIS ───');
            console.error('[MongoDB DEBUG] This is a NETWORK/DNS failure, NOT wrong username/password.');
            console.error('[MongoDB DEBUG] querySrv ECONNREFUSED = DNS resolver refused the SRV query.');
            console.error('[MongoDB DEBUG] Common causes: firewall, VPN, school/corporate network,');
            console.error('[MongoDB DEBUG] DNS blocked, or no internet. Auth errors appear LATER as');
            console.error('[MongoDB DEBUG] "bad auth" / "Authentication failed" — not at SRV stage.');
            console.error('[MongoDB DEBUG] Try: different network, disable VPN, or use standard');
            console.error('[MongoDB DEBUG] mongodb:// connection string from Atlas (non-SRV).');
        }
    } else {
        console.log('[MongoDB DEBUG] Step 3 — DNS SRV lookup: skipped (not mongodb+srv URI)');
    }

    // STEP 4 — mongoose.connect (auth/TLS issues surface here if DNS passed)
    console.log('[MongoDB DEBUG] Step 4 — mongoose.connect()...');
    try {
        await mongoose.connect(uri);
        console.log('✅ MongoDB: connected successfully');
        console.log('   Database:', mongoose.connection.name);
        console.log('   Host:', mongoose.connection.host);
        console.log('[MongoDB DEBUG] ─── connection diagnostics end (SUCCESS) ───\n');
    } catch (error) {
        console.error('❌ MongoDB: connection failed');
        console.error('   Error:', error.message);
        console.error('[MongoDB DEBUG] Step 4 — mongoose.connect: FAILED');
        console.error('[MongoDB DEBUG]   Error code:', error.code || '(none)');
        console.error('[MongoDB DEBUG]   Error name:', error.name || '(none)');
        if (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED')) {
            console.error('[MongoDB DEBUG] ─── DIAGNOSIS ───');
            console.error('[MongoDB DEBUG] DNS/SRV resolution failure — network/DNS issue, not bad password.');
        } else if (error.message.includes('auth') || error.message.includes('Authentication')) {
            console.error('[MongoDB DEBUG] ─── DIAGNOSIS ───');
            console.error('[MongoDB DEBUG] Authentication failure — check Atlas username/password in URI.');
        } else if (error.message.includes('IP') || error.message.includes('whitelist')) {
            console.error('[MongoDB DEBUG] ─── DIAGNOSIS ───');
            console.error('[MongoDB DEBUG] IP not whitelisted — add your IP in Atlas Network Access.');
        }
        console.error('[MongoDB DEBUG] ─── connection diagnostics end (FAILED) ───\n');
    }
};

module.exports = connectDB;
