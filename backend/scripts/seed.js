const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Watchlist = require('../src/models/Watchlist');
const PortfolioHolding = require('../src/models/PortfolioHolding');
const ResearchHistory = require('../src/models/ResearchHistory');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vestro';

async function seedData() {
  try {
    console.log('Connecting to MongoDB...', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Create or Update User
    const email = 'riteshparasher87@gmail.com';
    const password = 'Ritesh@22';
    const name = 'Ritesh sharma';

    let user = await User.findOne({ email });
    if (!user) {
      console.log('Creating new user:', email);
      user = new User({
        name,
        email,
        passwordHash: password, // Pre-save hook will hash this
        role: 'user',
        preferences: {
          experienceMode: 'intermediate',
          defaultCurrency: 'INR'
        }
      });
      await user.save();
      console.log('User created successfully.');
    } else {
      console.log('User already exists, updating password and name.');
      user.name = name;
      user.passwordHash = password;
      await user.save();
      console.log('User updated successfully.');
    }

    // Clear existing seed data for this user to avoid duplicates
    await Watchlist.deleteMany({ userId: user._id });
    await PortfolioHolding.deleteMany({ userId: user._id });
    await ResearchHistory.deleteMany({ userId: user._id });

    // 2. Seed Watchlist
    console.log('Seeding Watchlist...');
    const watchlistItems = [
      { userId: user._id, symbol: 'AAPL', companyName: 'Apple Inc.' },
      { userId: user._id, symbol: 'RELIANCE.NS', companyName: 'Reliance Industries Limited' },
      { userId: user._id, symbol: 'TSLA', companyName: 'Tesla, Inc.' },
      { userId: user._id, symbol: 'TCS.NS', companyName: 'Tata Consultancy Services' }
    ];
    await Watchlist.insertMany(watchlistItems);

    // 3. Seed Portfolio
    console.log('Seeding Portfolio...');
    const portfolioHoldings = [
      { userId: user._id, symbol: 'AAPL', companyName: 'Apple Inc.', shares: 15, avgBuyPrice: 150 },
      { userId: user._id, symbol: 'RELIANCE.NS', companyName: 'Reliance Industries Limited', shares: 50, avgBuyPrice: 2500 },
      { userId: user._id, symbol: 'MSFT', companyName: 'Microsoft Corporation', shares: 10, avgBuyPrice: 300 }
    ];
    await PortfolioHolding.insertMany(portfolioHoldings);

    // 4. Seed Research History
    console.log('Seeding Research History...');
    const researchHistory = [
      {
        userId: user._id,
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        reportContext: {
          aiAnalysis: {
            verdict: 'Buy',
            confidence: 85,
            healthScore: 92,
            investmentThesis: 'Apple shows strong financials, a wide economic moat, and consistent cash flow generation.',
            topReasons: ['Strong brand loyalty', 'High margins', 'Robust ecosystem'],
            keyRisks: ['Dependency on iPhone sales', 'Supply chain concentration', 'Regulatory scrutiny']
          }
        },
        summary: 'Strong buy based on robust ecosystem and consistent cash flows.'
      },
      {
        userId: user._id,
        symbol: 'RELIANCE.NS',
        companyName: 'Reliance Industries Limited',
        reportContext: {
          aiAnalysis: {
            verdict: 'Hold',
            confidence: 78,
            healthScore: 80,
            investmentThesis: 'Reliance continues to diversify, but current valuation seems stretched.',
            topReasons: ['Market leadership in Jio and Retail', 'Strong cash flows from O2C'],
            keyRisks: ['High debt levels', 'Intense competition in retail', 'Execution risks in new energy']
          }
        },
        summary: 'Hold. Diversification is positive, but valuation is currently high.'
      }
    ];
    await ResearchHistory.insertMany(researchHistory);

    console.log('Seed data inserted successfully!');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

seedData();
