/**
 * Migration Script: Multi-Hospital Support
 * 
 * This script safely migrates existing data to support multi-hospital architecture.
 * It creates a default hospital and assigns all existing records to it.
 * 
 * SAFE TO RUN MULTIPLE TIMES - Uses idempotent operations
 * 
 * Usage: node src/utils/migration-multi-hospital.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { User, Area, Task, ChecklistEntry, StaffRecord, Hospital } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/daily-checklist';

const DEFAULT_HOSPITAL = {
  name: 'Sugar & Heart Clinic',
  code: 'DEFAULT',
  isDefault: true,
  isActive: true,
  address: '',
  phone: '',
  email: ''
};

async function migrate() {
  try {
    console.log('🔄 Starting Multi-Hospital Migration...\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Create or get default hospital
    console.log('📍 Step 1: Creating/Getting Default Hospital...');
    let defaultHospital = await Hospital.findOne({ code: 'DEFAULT' });
    
    if (!defaultHospital) {
      defaultHospital = await Hospital.create(DEFAULT_HOSPITAL);
      console.log(`   ✅ Created default hospital: ${defaultHospital.name} (${defaultHospital._id})`);
    } else {
      // Ensure it's marked as default
      if (!defaultHospital.isDefault) {
        defaultHospital.isDefault = true;
        await defaultHospital.save();
      }
      console.log(`   ℹ️  Default hospital already exists: ${defaultHospital.name} (${defaultHospital._id})`);
    }

    const hospitalId = defaultHospital._id;

    // Step 2: Migrate Users
    console.log('\n📍 Step 2: Migrating Users...');
    const usersWithoutHospital = await User.countDocuments({ hospital: null });
    if (usersWithoutHospital > 0) {
      const userResult = await User.updateMany(
        { hospital: null },
        { $set: { hospital: hospitalId } }
      );
      console.log(`   ✅ Updated ${userResult.modifiedCount} users`);
    } else {
      console.log('   ℹ️  All users already have hospital assigned');
    }

    // Step 3: Migrate Areas
    console.log('\n📍 Step 3: Migrating Areas...');
    const areasWithoutHospital = await Area.countDocuments({ hospital: null });
    if (areasWithoutHospital > 0) {
      const areaResult = await Area.updateMany(
        { hospital: null },
        { $set: { hospital: hospitalId } }
      );
      console.log(`   ✅ Updated ${areaResult.modifiedCount} areas`);
    } else {
      console.log('   ℹ️  All areas already have hospital assigned');
    }

    // Step 4: Migrate Tasks
    console.log('\n📍 Step 4: Migrating Tasks...');
    const tasksWithoutHospital = await Task.countDocuments({ hospital: null });
    if (tasksWithoutHospital > 0) {
      const taskResult = await Task.updateMany(
        { hospital: null },
        { $set: { hospital: hospitalId } }
      );
      console.log(`   ✅ Updated ${taskResult.modifiedCount} tasks`);
    } else {
      console.log('   ℹ️  All tasks already have hospital assigned');
    }

    // Step 5: Migrate Checklist Entries
    console.log('\n📍 Step 5: Migrating Checklist Entries...');
    const entriesWithoutHospital = await ChecklistEntry.countDocuments({ hospital: null });
    if (entriesWithoutHospital > 0) {
      const entryResult = await ChecklistEntry.updateMany(
        { hospital: null },
        { $set: { hospital: hospitalId } }
      );
      console.log(`   ✅ Updated ${entryResult.modifiedCount} checklist entries`);
    } else {
      console.log('   ℹ️  All checklist entries already have hospital assigned');
    }

    // Step 6: Migrate Staff Records
    console.log('\n📍 Step 6: Migrating Staff Records...');
    const recordsWithoutHospital = await StaffRecord.countDocuments({ hospital: null });
    if (recordsWithoutHospital > 0) {
      const recordResult = await StaffRecord.updateMany(
        { hospital: null },
        { $set: { hospital: hospitalId } }
      );
      console.log(`   ✅ Updated ${recordResult.modifiedCount} staff records`);
    } else {
      console.log('   ℹ️  All staff records already have hospital assigned');
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(50));
    console.log(`Default Hospital: ${defaultHospital.name} (${defaultHospital.code})`);
    console.log(`Hospital ID: ${hospitalId}`);
    console.log('');
    console.log('Total Records:');
    console.log(`   Users: ${await User.countDocuments()}`);
    console.log(`   Areas: ${await Area.countDocuments()}`);
    console.log(`   Tasks: ${await Task.countDocuments()}`);
    console.log(`   Checklist Entries: ${await ChecklistEntry.countDocuments()}`);
    console.log(`   Staff Records: ${await StaffRecord.countDocuments()}`);
    console.log('='.repeat(50));
    console.log('\n✅ Migration completed successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
migrate();

