import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type * as LeadRepositoryModule from "./LeadRepository";

// Real in-memory SQLite so the projectId gate on addEvent runs against actual
// SQL — a mocked builder chain can't prove that a leadId from another project
// fails to insert.

vi.mock("cloudflare:workers", () => ({
  env: { DATABASE_PROVIDER: "d1" },
}));

let client: Client;
let testDb: ReturnType<typeof drizzle>;
let LeadRepository: typeof LeadRepositoryModule.LeadRepository;

beforeAll(async () => {
  client = createClient({ url: "file::memory:" });
  testDb = drizzle(client);
  vi.doMock("@/db", () => ({ db: testDb }));

  await client.executeMultiple(`
    CREATE TABLE nes_leads (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT,
      email TEXT,
      phone TEXT,
      source TEXT NOT NULL DEFAULT 'manual',
      status TEXT NOT NULL DEFAULT 'nuevo',
      amount_usd REAL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE nes_lead_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      channel TEXT,
      body TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  ({ LeadRepository } = await import("./LeadRepository"));
});

afterAll(() => {
  client.close();
});

beforeEach(async () => {
  await client.executeMultiple(`
    DELETE FROM nes_lead_events;
    DELETE FROM nes_leads;
  `);
});

async function seedLead(id: string, projectId: string) {
  await client.execute({
    sql: "INSERT INTO nes_leads (id, project_id) VALUES (?, ?)",
    args: [id, projectId],
  });
}

async function countEvents(): Promise<number> {
  const rows = await client.execute("SELECT * FROM nes_lead_events");
  return rows.rows.length;
}

describe("LeadRepository.addEvent", () => {
  it("writes the event when the lead belongs to the given project", async () => {
    await seedLead("lead_1", "proj_1");

    const event = await LeadRepository.addEvent(
      { leadId: "lead_1", kind: "nota", body: "ok" },
      "proj_1",
    );

    expect(event.leadId).toBe("lead_1");
    expect(await countEvents()).toBe(1);
  });

  it("does not write anything when the lead belongs to a different project", async () => {
    await seedLead("lead_ajena", "proj_2");

    await expect(
      LeadRepository.addEvent(
        { leadId: "lead_ajena", kind: "nota", body: "fuga" },
        "proj_1",
      ),
    ).rejects.toThrow();

    expect(await countEvents()).toBe(0);
  });
});
