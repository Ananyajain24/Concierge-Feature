// Who actually gets assigned when a guest books an airport transfer or a
// scooter in-app. A small real roster, not a name generated on the fly —
// so two guests booked back to back can be assigned the same driver, the way
// a small local fleet actually works.
import { eq } from "drizzle-orm";
import { db } from "../client";
import { serviceProviders } from "../schema/index";

interface ProviderSeed {
  role: "driver" | "scooter_rental";
  name: string;
  phone: string;
  vehicle?: string;
  notes?: string;
}

const GOA_PROVIDERS: ProviderSeed[] = [
  { role: "driver", name: "Prakash Naik", phone: "+91 98221 40873", vehicle: "Toyota Innova, white, GA-01 AB 4021" },
  { role: "driver", name: "Melvyn D'Souza", phone: "+91 90111 62384", vehicle: "Maruti Ertiga, silver, GA-07 CD 1189" },
  { role: "driver", name: "Suresh Gaonkar", phone: "+91 96579 20456", vehicle: "Toyota Innova Crysta, black, GA-02 EF 7735" },
  {
    role: "scooter_rental",
    name: "Bardez Bike Rentals",
    phone: "+91 88888 30291",
    notes: "Delivered and collected at the villa. Helmets for two included.",
  },
];

export async function seedGoaProviders(destinationId: string): Promise<void> {
  const existing = await db.select().from(serviceProviders).where(eq(serviceProviders.destinationId, destinationId));
  if (existing.length > 0) return; // idempotent — don't duplicate the roster on re-seed
  await db.insert(serviceProviders).values(GOA_PROVIDERS.map((p) => ({ destinationId, ...p })));
  console.log(`  Service providers: ${GOA_PROVIDERS.length}`);
}
