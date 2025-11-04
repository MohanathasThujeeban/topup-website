// MongoDB Script to Create Product from StockPool
// Run this in MongoDB Atlas or MongoDB Compass

// Step 1: Find your StockPool (Lyca11)
const stockPool = db.stockpools.findOne({ name: "Lyca11" });

if (!stockPool) {
  print("ERROR: StockPool 'Lyca11' not found!");
} else {
  print("Found StockPool:", stockPool.name);
  print("Product ID:", stockPool.productId);
  print("Available Quantity:", stockPool.availableQuantity);
  
  // Step 2: Create corresponding Product
  const product = {
    _id: ObjectId(stockPool.productId),
    name: "Lyca11 eSIM Bundle",
    description: stockPool.description || "Norway sim bundle with instant activation",
    productType: "ESIM",
    category: "NORWAY",
    basePrice: NumberDecimal("99.00"),
    discountPercentage: NumberDecimal("0.0"),
    retailerCommissionPercentage: NumberDecimal("30.0"),
    stockQuantity: NumberInt(stockPool.availableQuantity.toString()),
    soldQuantity: NumberInt(stockPool.usedQuantity.toString()),
    lowStockThreshold: NumberInt("5"),
    dataAmount: "1GB",
    validity: "30 days",
    supportedCountries: ["Norway"],
    supportedNetworks: ["Lycamobile"],
    status: "ACTIVE",
    isVisible: true,
    isFeatured: true,
    slug: "lyca11-esim-bundle",
    tags: ["esim", "norway", "lycamobile"],
    metadata: {
      feature_0: "Unlimited national minutes",
      feature_1: "100* Minutes to United Kingdom and more",
      feature_2: "1GB EU Roaming Data",
      feature_3: "eSIM available",
      feature_4: "Instant QR code activation"
    },
    createdDate: new Date(),
    lastModifiedDate: new Date(),
    createdBy: "admin",
    lastModifiedBy: "admin",
    _class: "com.example.topup.demo.entity.Product"
  };
  
  // Step 3: Insert or Update Product
  try {
    const result = db.products.replaceOne(
      { _id: product._id },
      product,
      { upsert: true }
    );
    
    if (result.upsertedCount > 0) {
      print("✅ Product created successfully!");
    } else if (result.modifiedCount > 0) {
      print("✅ Product updated successfully!");
    } else {
      print("✅ Product already exists and is up to date!");
    }
    
    print("\nProduct Details:");
    print("- Name:", product.name);
    print("- Price: NOK", product.basePrice);
    print("- Stock:", product.stockQuantity, "available");
    print("- Status:", product.status);
    print("- Visible:", product.isVisible);
    
    print("\n🎉 Done! Refresh http://localhost:3000/bundles?filter=esim to see the bundle!");
    
  } catch (error) {
    print("ERROR:", error);
  }
}
