/**
 * Script de test pour vérifier la connexion HubSpot
 * 
 * Usage: npx tsx scripts/test-hubspot.ts YOUR_ACCESS_TOKEN
 * 
 * Exemple: npx tsx scripts/test-hubspot.ts pat-eu1-xxxxxxxx
 */

const ACCESS_TOKEN = process.argv[2] || ""; // Token passé en argument

if (!ACCESS_TOKEN) {
  console.error("❌ Usage: npx tsx scripts/test-hubspot.ts YOUR_ACCESS_TOKEN");
  process.exit(1);
}

async function testHubSpotConnection() {
  console.log("🔄 Test de connexion HubSpot...\n");

  // 1. Vérifier la connexion
  try {
    const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts?limit=1", {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Erreur de connexion:", error);
      return;
    }

    console.log("✅ Connexion HubSpot OK!\n");
  } catch (error) {
    console.error("❌ Erreur réseau:", error);
    return;
  }

  // 2. Créer un contact de test
  console.log("🔄 Création d'un contact de test...\n");

  const testContact = {
    properties: {
      email: `test-prosplay-${Date.now()}@example.com`,
      firstname: "Test",
      lastname: "Prosplay",
      phone: "+33612345678",
      // Propriétés personnalisées Prosplay (si créées)
      // prosplay_points: "100",
      // prosplay_last_game: new Date().toISOString(),
    },
  };

  try {
    const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testContact),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Erreur création contact:", error);
      return;
    }

    const contact = await response.json();
    console.log("✅ Contact créé avec succès!");
    console.log("   ID:", contact.id);
    console.log("   Email:", contact.properties.email);
    console.log("\n📍 Vérifiez dans HubSpot → Contacts");
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

testHubSpotConnection();
