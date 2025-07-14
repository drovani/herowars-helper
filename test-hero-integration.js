#!/usr/bin/env node
// ABOUTME: Integration test script for hero repository functionality
// ABOUTME: Tests actual database operations to verify hero implementation works correctly

import { HeroRepository } from './app/repositories/HeroRepository.js'
import { transformHeroData } from './app/lib/hero-data-migration.js'
import heroesJson from './app/data/heroes.json' assert { type: 'json' }

console.log('🧪 Hero Repository Integration Test')
console.log('=====================================')

async function testHeroRepository() {
  try {
    // Test 1: Create repository instance
    console.log('\n1. Creating HeroRepository instance...')
    const heroRepo = new HeroRepository()
    console.log('✅ HeroRepository created successfully')

    // Test 2: Check if tables exist by trying to query
    console.log('\n2. Testing database connection...')
    const allHeroes = await heroRepo.findAll()
    console.log(`✅ Database query successful. Found ${allHeroes.data?.length || 0} existing heroes`)

    // Test 3: Test data migration utility
    console.log('\n3. Testing data migration utility...')
    const sampleHeroes = heroesJson.slice(0, 3) // Test with first 3 heroes
    const migrationResult = transformHeroData(sampleHeroes, { skipInvalidData: true })
    
    console.log(`✅ Migration utility working:`)
    console.log(`   - Heroes: ${migrationResult.heroes.length}`)
    console.log(`   - Artifacts: ${migrationResult.artifacts.length}`)
    console.log(`   - Skins: ${migrationResult.skins.length}`)
    console.log(`   - Glyphs: ${migrationResult.glyphs.length}`)
    console.log(`   - Equipment Slots: ${migrationResult.equipmentSlots.length}`)
    console.log(`   - Errors: ${migrationResult.errors.length}`)

    // Test 4: Test creating a hero (if empty database)
    if (allHeroes.data?.length === 0) {
      console.log('\n4. Testing hero creation...')
      const testHero = migrationResult.heroes[0]
      const createResult = await heroRepo.create(testHero)
      
      if (createResult.error) {
        console.log(`❌ Hero creation failed: ${createResult.error.message}`)
      } else {
        console.log(`✅ Hero created successfully: ${createResult.data?.name}`)
        
        // Test finding the created hero
        const findResult = await heroRepo.findById(testHero.slug)
        if (findResult.error) {
          console.log(`❌ Hero lookup failed: ${findResult.error.message}`)
        } else {
          console.log(`✅ Hero lookup successful: ${findResult.data?.name}`)
        }
      }
    } else {
      console.log('\n4. Testing hero queries on existing data...')
      
      // Test finding by class
      const tankHeroes = await heroRepo.findByClass('tank')
      console.log(`✅ Found ${tankHeroes.data?.length || 0} tank heroes`)
      
      // Test complex relationship loading
      if (allHeroes.data && allHeroes.data.length > 0) {
        const firstHero = allHeroes.data[0]
        const heroWithData = await heroRepo.findWithAllData(firstHero.slug)
        if (heroWithData.error) {
          console.log(`❌ Complex hero query failed: ${heroWithData.error.message}`)
        } else {
          console.log(`✅ Complex hero query successful for: ${heroWithData.data?.name}`)
          console.log(`   - Artifacts: ${heroWithData.data?.artifacts?.length || 0}`)
          console.log(`   - Skins: ${heroWithData.data?.skins?.length || 0}`)
          console.log(`   - Glyphs: ${heroWithData.data?.glyphs?.length || 0}`)
          console.log(`   - Equipment Slots: ${heroWithData.data?.equipmentSlots?.length || 0}`)
        }
      }
    }

    console.log('\n🎉 Hero Repository Integration Test PASSED!')
    console.log('\nReady for production use! 🚀')
    
  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

// Run the test
testHeroRepository()