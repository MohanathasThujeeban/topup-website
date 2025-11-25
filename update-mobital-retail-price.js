// MongoDB script to add retail price to MOBITAL bundle order
// Run this in MongoDB Compass against the topup_db database

db.retailer_orders.updateOne(
  {
    orderNumber: "RO-1764090691391",
    "items.productName": "MOBITAL"
  },
  {
    $set: {
      "items.$[elem].retailPrice": NumberDecimal("49.00")
    }
  },
  {
    arrayFilters: [{ "elem.productName": "MOBITAL" }]
  }
);

print("✅ Updated MOBITAL order with retail price NOK 49.00");
print("Modified count:", db.retailer_orders.getWriteConcernError() ? 0 : 1);

// Verify the update
const updatedOrder = db.retailer_orders.findOne({ orderNumber: "RO-1764090691391" });
print("\n📦 Updated order:");
printjson(updatedOrder.items[0]);
