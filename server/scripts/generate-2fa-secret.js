import speakeasy from "speakeasy";

const secret = speakeasy.generateSecret({
  name: "Coolify Dashboard",
  length: 32,
});

console.log("\n=== 2FA Secret Generation ===\n");
console.log("Add this to your .env file:");
console.log(`ADMIN_2FA_SECRET=${secret.base32}\n`);
console.log("Keep this secret safe and never commit it to git!");
console.log("\n=============================\n");
