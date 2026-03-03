/**
 * Seeds 10 Indian demo accounts + transactions into Firebase Emulators.
 *
 * Prereqs:
 * - `firebase emulators:start --only auth,firestore,functions`
 * - Run this from the `functions/` directory:
 *     node seed-demo-data.js
 */
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function readProjectId() {
  try {
    const firebasercPath = path.resolve(__dirname, '..', '.firebaserc');
    const raw = fs.readFileSync(firebasercPath, 'utf8');
    const cfg = JSON.parse(raw);
    return cfg?.projects?.default || 'demo-project';
  } catch {
    return 'demo-project';
  }
}

function rupees(n) {
  return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const projectId = readProjectId();

  // Point Admin SDK at emulators
  process.env.GCLOUD_PROJECT = projectId;
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

  admin.initializeApp({ projectId });
  const db = admin.firestore();

  const password = 'UPIGuard@123';

  // 10 Indian demo accounts (7 flagged)
  const accounts = [
    { uid: 'demo_u01', full_name: 'Aarav Sharma', email: 'aarav.sharma@upi-demo.in', mobile: '+919812345601', fraud: true, upi_id: 'aarav.sharma@secureupi', balance: 125000 },
    { uid: 'demo_u02', full_name: 'Diya Patel', email: 'diya.patel@upi-demo.in', mobile: '+919812345602', fraud: true, upi_id: 'diya.patel@secureupi', balance: 92000 },
    { uid: 'demo_u03', full_name: 'Vihaan Iyer', email: 'vihaan.iyer@upi-demo.in', mobile: '+919812345603', fraud: true, upi_id: 'vihaan.iyer@secureupi', balance: 68000 },
    { uid: 'demo_u04', full_name: 'Meera Nair', email: 'meera.nair@upi-demo.in', mobile: '+919812345604', fraud: true, upi_id: 'meera.nair@secureupi', balance: 54000 },
    { uid: 'demo_u05', full_name: 'Kabir Singh', email: 'kabir.singh@upi-demo.in', mobile: '+919812345605', fraud: true, upi_id: 'kabir.singh@secureupi', balance: 150000 },
    { uid: 'demo_u06', full_name: 'Ananya Gupta', email: 'ananya.gupta@upi-demo.in', mobile: '+919812345606', fraud: true, upi_id: 'ananya.gupta@secureupi', balance: 81000 },
    { uid: 'demo_u07', full_name: 'Arjun Reddy', email: 'arjun.reddy@upi-demo.in', mobile: '+919812345607', fraud: true, upi_id: 'arjun.reddy@secureupi', balance: 47000 },
    { uid: 'demo_u08', full_name: 'Ishaan Verma', email: 'ishaan.verma@upi-demo.in', mobile: '+919812345608', fraud: false, upi_id: 'ishaan.verma@secureupi', balance: 113000 },
    { uid: 'demo_u09', full_name: 'Saanvi Joshi', email: 'saanvi.joshi@upi-demo.in', mobile: '+919812345609', fraud: false, upi_id: 'saanvi.joshi@secureupi', balance: 76000 },
    { uid: 'demo_u10', full_name: 'Rohan Kulkarni', email: 'rohan.kulkarni@upi-demo.in', mobile: '+919812345610', fraud: false, upi_id: 'rohan.kulkarni@secureupi', balance: 99000 }
  ];

  // Create Auth users
  for (const a of accounts) {
    try {
      await admin.auth().createUser({
        uid: a.uid,
        email: a.email,
        password,
        displayName: a.full_name,
        phoneNumber: a.mobile
      });
    } catch (e) {
      // Ignore if already exists
      if (!String(e?.message || '').includes('already exists')) {
        console.error('Failed to create auth user', a.email, e);
        throw e;
      }
    }
  }

  // Give Functions emulator time to run onUserCreated triggers
  await sleep(600);

  // Ensure user docs exist + enrich them with consistent fields
  for (const a of accounts) {
    await db.collection('users').doc(a.uid).set(
      {
        uid: a.uid,
        name: a.full_name,
        full_name: a.full_name,
        email: a.email,
        mobile: a.mobile,
        upi_id: a.upi_id,
        upiId: a.upi_id, // legacy
        balance: a.balance,
        is_fraud_risk: a.fraud,
        is_blocked: false,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        transaction_count: 0,
        totalSent: 0,
        totalReceived: 0
      },
      { merge: true }
    );
  }

  // Helper for updating balances for seeded txns
  const balances = new Map(accounts.map((a) => [a.uid, a.balance]));
  const upiByUid = new Map(accounts.map((a) => [a.uid, a.upi_id]));

  const now = Date.now();
  const txns = [
    // Completed transactions (affect balances)
    { id: `TXN${now}A1`, from: 'demo_u08', to: 'demo_u09', amount: 1250, status: 'Completed' },
    { id: `TXN${now}A2`, from: 'demo_u09', to: 'demo_u10', amount: 3000, status: 'Completed' },
    { id: `TXN${now}A3`, from: 'demo_u10', to: 'demo_u08', amount: 750, status: 'Completed' },
    { id: `TXN${now}A4`, from: 'demo_u02', to: 'demo_u08', amount: 5000, status: 'Completed' },
    { id: `TXN${now}A5`, from: 'demo_u06', to: 'demo_u09', amount: 2200, status: 'Completed' },
    { id: `TXN${now}A6`, from: 'demo_u01', to: 'demo_u10', amount: 9000, status: 'Completed' },
    { id: `TXN${now}A7`, from: 'demo_u03', to: 'demo_u09', amount: 12000, status: 'Completed' },
    { id: `TXN${now}A8`, from: 'demo_u04', to: 'demo_u08', amount: 1800, status: 'Completed' },
    { id: `TXN${now}A9`, from: 'demo_u05', to: 'demo_u10', amount: 15000, status: 'Completed' },
    { id: `TXN${now}B1`, from: 'demo_u08', to: 'demo_u01', amount: 4500, status: 'Completed' },
    { id: `TXN${now}B2`, from: 'demo_u09', to: 'demo_u02', amount: 2000, status: 'Completed' },
    { id: `TXN${now}B3`, from: 'demo_u10', to: 'demo_u03', amount: 3200, status: 'Completed' },

    // Blocked transactions (do NOT affect balances)
    { id: `TXN${now}F1`, from: 'demo_u07', to: 'demo_u08', amount: 65000, status: 'Blocked', fraud: true, reasons: ['High amount', 'New receiver', 'Suspicious time'] },
    { id: `TXN${now}F2`, from: 'demo_u03', to: 'demo_u10', amount: 80000, status: 'Blocked', fraud: true, reasons: ['Critical amount to new receiver'] },
    { id: `TXN${now}F3`, from: 'demo_u02', to: 'demo_u09', amount: 52000, status: 'Blocked', fraud: true, reasons: ['High velocity', 'Location mismatch'] },
    { id: `TXN${now}F4`, from: 'demo_u01', to: 'demo_u08', amount: 70000, status: 'Blocked', fraud: true, reasons: ['High amount', 'Suspicious time'] }
  ];

  // Write txns + update balances for Completed ones
  let tick = 0;
  for (const t of txns) {
    const ts = admin.firestore.Timestamp.fromMillis(now - tick * 60_000);
    tick += 1;

    const senderUpi = upiByUid.get(t.from);
    const recipientUpi = upiByUid.get(t.to);

    if (t.status === 'Completed') {
      balances.set(t.from, (balances.get(t.from) || 0) - t.amount);
      balances.set(t.to, (balances.get(t.to) || 0) + t.amount);
    }

    await db.collection('transactions').doc(t.id).set({
      transaction_id: t.id,
      sender_uid: t.from,
      sender_upi: senderUpi,
      recipient_uid: t.to,
      recipient_upi: recipientUpi,
      amount: t.amount,
      timestamp: ts,
      status: t.status,
      is_fraud: Boolean(t.fraud),
      fraud_probability: t.fraud ? 0.91 : 0.04,
      fraud_reasons: t.reasons || []
    });

    if (t.status === 'Blocked') {
      await db.collection('fraudAlerts').doc(t.id).set({
        transaction_id: t.id,
        sender_uid: t.from,
        recipient_uid: t.to,
        sender_upi: senderUpi,
        recipient_upi: recipientUpi,
        amount: t.amount,
        fraud_probability: 0.91,
        fraud_reasons: t.reasons || [],
        resolved: false,
        timestamp: ts
      });
    }
  }

  // Persist updated balances + simple counters
  for (const a of accounts) {
    const finalBal = balances.get(a.uid);
    const sentTotal = txns.filter((t) => t.status === 'Completed' && t.from === a.uid).reduce((s, t) => s + t.amount, 0);
    const recvTotal = txns.filter((t) => t.status === 'Completed' && t.to === a.uid).reduce((s, t) => s + t.amount, 0);
    const count = txns.filter((t) => t.from === a.uid || t.to === a.uid).length;

    await db.collection('users').doc(a.uid).set(
      {
        balance: finalBal,
        transaction_count: count,
        totalSent: sentTotal,
        totalReceived: recvTotal
      },
      { merge: true }
    );
  }

  // Write TXT file with details
  const lines = [];
  lines.push('UPI Guard Demo Accounts (India)');
  lines.push('');
  lines.push(`Password for all accounts: ${password}`);
  lines.push('');
  for (const a of accounts) {
    const finalBal = balances.get(a.uid);
    lines.push(`Name: ${a.full_name}`);
    lines.push(`Email: ${a.email}`);
    lines.push(`Mobile: ${a.mobile}`);
    lines.push(`UPI ID: ${a.upi_id}`);
    lines.push(`Fraud Flagged: ${a.fraud ? 'YES' : 'NO'}`);
    lines.push(`Balance: ${rupees(finalBal)}`);
    lines.push(`UID: ${a.uid}`);
    lines.push('---');
  }

  lines.push('');
  lines.push('Seeded Transactions Summary');
  lines.push(`Completed: ${txns.filter((t) => t.status === 'Completed').length}`);
  lines.push(`Blocked: ${txns.filter((t) => t.status === 'Blocked').length}`);

  const outPath = path.resolve(__dirname, '..', 'demo_accounts_india.txt');
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');

  console.log(`✅ Seed complete. Wrote ${outPath}`);
}

main().catch((e) => {
  console.error('❌ Seed failed', e);
  process.exit(1);
});

