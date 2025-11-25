// MongoDB script to add encrypted PINs to the existing MOBITAL order
// Run this in MongoDB Compass

use('topup_db');

// Find the MOBITAL order
const mobitalOrder = db.retailer_orders.findOne({
  'items.productName': 'MOBITAL'
});

if (mobitalOrder) {
  console.log('Found MOBITAL order:', mobitalOrder.orderNumber);
  
  // Generate sample encrypted PINs for the 3 units
  const encryptedPins = [
    'ENC_PIN_001_MOBITAL_49NOK',
    'ENC_PIN_002_MOBITAL_49NOK',
    'ENC_PIN_003_MOBITAL_49NOK'
  ];
  
  // Update the order with encrypted PINs in notes
  const result = db.retailer_orders.updateOne(
    { _id: mobitalOrder._id },
    {
      $set: {
        notes: 'ENCRYPTED_PINS:' + encryptedPins.join(',')
      }
    }
  );
  
  console.log('✅ Updated order with encrypted PINs');
  console.log('Modified count:', result.modifiedCount);
  
  // Verify the update
  const updated = db.retailer_orders.findOne({ _id: mobitalOrder._id });
  console.log('\nVerification:');
  console.log('Order:', updated.orderNumber);
  console.log('Notes:', updated.notes);
} else {
  console.log('❌ MOBITAL order not found');
}
