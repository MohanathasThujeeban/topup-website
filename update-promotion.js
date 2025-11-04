// MongoDB update script for NEIRAH promotion
db = db.getSiblingDB('topup');

const result = db.promotions.updateOne(
  { _id: ObjectId('69063fa4775238f66a858e49') },
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

print('Update result:', JSON.stringify(result));

// Verify the update
const promotion = db.promotions.findOne({ _id: ObjectId('69063fa4775238f66a858e49') });
print('Updated promotion status:', promotion.status);
print('Updated promotion isActive:', promotion.isActive);
print('Updated promotion startDate:', promotion.startDate);
print('Updated promotion endDate:', promotion.endDate);
