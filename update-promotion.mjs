import { MongoClient, ObjectId } from 'mongodb';

const uri = "mongodb+srv://thujee_db:Thujee%40tamil01923@topupdb.puesjra.mongodb.net/topup_db?retryWrites=true&w=majority&appName=topupdb";

async function updatePromotion() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('topup_db');
    const promotionsCollection = db.collection('promotions');
    
    // Update the NEIRAH promotion
    const result = await promotionsCollection.updateOne(
      { _id: new ObjectId('69063fa4775238f66a858e49') },
      {
        $set: {
          status: 'ACTIVE',
          isActive: true,
          startDate: new Date('2024-11-01T00:00:00.000Z'),
          endDate: new Date('2025-12-31T23:59:59.000Z'),
          lastModifiedDate: new Date()
        }
      }
    );
    
    console.log('✅ Update result:', result);
    console.log(`   Matched: ${result.matchedCount}`);
    console.log(`   Modified: ${result.modifiedCount}`);
    
    // Verify the update
    const promotion = await promotionsCollection.findOne(
      { _id: new ObjectId('69063fa4775238f66a858e49') }
    );
    
    console.log('\n📋 Updated Promotion:');
    console.log('   Promo Code:', promotion.promoCode);
    console.log('   Status:', promotion.status);
    console.log('   Is Active:', promotion.isActive);
    console.log('   Start Date:', promotion.startDate);
    console.log('   End Date:', promotion.endDate);
    console.log('   Discount:', `${promotion.discountValue}%`);
    console.log('   Min Order:', `NOK ${promotion.minOrderValue}`);
    console.log('   Max Discount:', `NOK ${promotion.maxDiscountAmount}`);
    
    console.log('\n🎉 Promotion updated successfully!');
    console.log('💡 Refresh your retailer dashboard to see the animated banner!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

updatePromotion();
