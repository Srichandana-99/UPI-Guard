#!/usr/bin/env node
/**
 * Create Fraud Test Accounts with Indian Names
 * Run with: node create_fraud_accounts.js
 */

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { run, get } = require('../config/database');

// Sample Indian names and data
const indianFirstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Anita', 'Sanjay', 'Deepa', 'Rahul', 'Kavita'];
const indianLastNames = ['Kumar', 'Sharma', 'Patel', 'Singh', 'Gupta', 'Reddy', 'Nair', 'Desai', 'Joshi', 'Mehta'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];

function generateIndianName() {
    const first = indianFirstNames[Math.floor(Math.random() * indianFirstNames.length)];
    const last = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
    return `${first} ${last}`;
}

function generateIndianEmail(name) {
    const clean = name.toLowerCase().replace(/\s+/g, '');
    const random = Math.floor(Math.random() * 999);
    return `${clean}${random}@gmail.com`;
}

function generateUPIId(email, uid) {
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${username}@secureupi`;
}

async function createFraudAccount(index) {
    const name = generateIndianName();
    const email = generateIndianEmail(name);
    const uid = uuidv4();
    const password = await bcrypt.hash('fraud123', 10);
    const upiId = generateUPIId(email, uid);
    const mobile = `+91 9${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
    const balance = Math.floor(Math.random() * 50000) + 1000;
    
    try {
        // Insert fraud user
        await run(`
            INSERT INTO users (uid, name, email, mobile, password_hash, upi_id, balance, transaction_count, is_fraud_account, transaction_pin, age)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, '1234', 25)
        `, [uid, name, email, mobile, password, upiId, balance, Math.floor(Math.random() * 20) + 5]);
        
        console.log(`✅ Created fraud account: ${name} (${upiId})`);
        
        // Create fraud transactions
        const txnCount = Math.floor(Math.random() * 8) + 3; // 3-10 transactions
        for (let i = 0; i < txnCount; i++) {
            const txnId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            const amount = Math.floor(Math.random() * 10000) + 500;
            const isFraud = Math.random() > 0.3; // 70% are fraud
            const status = isFraud ? 'blocked' : 'approved';
            const fraudProb = isFraud ? (Math.random() * 0.4 + 0.6).toFixed(2) : (Math.random() * 0.3).toFixed(2);
            
            await run(`
                INSERT INTO transactions (
                    transaction_id, sender_uid, sender_upi, recipient_upi, amount,
                    timestamp, latitude, longitude, is_fraud, fraud_probability, 
                    fraud_reasons, status, balance_before, balance_after
                ) VALUES (?, ?, ?, ?, ?, datetime('now', '-${i} days'), ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                txnId,
                uid,
                upiId,
                `recipient${i}@secureupi`,
                amount,
                19.07 + Math.random(), // Mumbai lat
                72.87 + Math.random(), // Mumbai lon
                isFraud ? 1 : 0,
                fraudProb,
                isFraud ? JSON.stringify(['Unusual location', 'High amount', 'New recipient']) : '[]',
                status,
                balance,
                status === 'blocked' ? balance : balance - amount
            ]);
        }
        
        console.log(`   📊 Added ${txnCount} transactions (${Math.floor(txnCount * 0.7)} fraud)`);
        
        return { name, email, upiId, uid, password: 'fraud123' };
    } catch (error) {
        console.error(`❌ Error creating fraud account ${index}:`, error.message);
        return null;
    }
}

async function main() {
    console.log('🔧 Creating Fraud Test Accounts...\n');
    
    const fraudAccounts = [];
    const count = 5; // Create 5 fraud accounts
    
    for (let i = 0; i < count; i++) {
        const account = await createFraudAccount(i + 1);
        if (account) {
            fraudAccounts.push(account);
        }
    }
    
    // Create fraud_account.txt
    const fs = require('fs');
    const content = fraudAccounts.map(acc => `
Name: ${acc.name}
Email: ${acc.email}
UPI ID: ${acc.upiId}
Password: ${acc.password}
Transaction PIN: 1234
Status: FRAUD ACCOUNT
---`).join('\n');
    
    fs.writeFileSync('../fraud_account.txt', content.trim());
    console.log(`\n✅ Created fraud_account.txt with ${fraudAccounts.length} accounts`);
    
    console.log('\n📋 Fraud Account Summary:');
    fraudAccounts.forEach((acc, i) => {
        console.log(`${i + 1}. ${acc.name} - ${acc.upiId}`);
    });
    
    process.exit(0);
}

main().catch(err => {
    console.error('Failed:', err);
    process.exit(1);
});
