import { supabase } from '../../supabaseClient';
import fs from 'fs';
import path from 'path';

// Note: Ensure this is run from the 'backend' directory
const CURRICULUM_DATA = JSON.parse(fs.readFileSync(path.join(process.cwd(), '../data/curriculum.json'), 'utf8'));
const CANDIDATES_DATA = JSON.parse(fs.readFileSync(path.join(process.cwd(), '../data/candidates.json'), 'utf8'));

async function seed() {
  console.log("🌱 Starting Database Seed...");

  console.log("Seeding Curriculum Modules...");
  for (const mod of CURRICULUM_DATA.modules) {
    const { error } = await supabase.from('curriculum_modules').upsert({
      n: mod.n,
      title: mod.title,
      day_start: mod.days[0],
      day_end: mod.days[1]
    });
    if (error) console.error("❌ Error inserting module", error);
  }
  console.log("✅ Modules seeded.");

  console.log("Seeding Curriculum Days...");
  for (const day of CURRICULUM_DATA.days) {
    // Find matching module based on day range
    const mod = CURRICULUM_DATA.modules.find((m: any) => day.day >= m.days[0] && day.day <= m.days[1]);
    
    const { error } = await supabase.rpc('upsert_curriculum_day_from_json', {
      payload: {
        day: day.day,
        module_n: mod ? mod.n : null,
        title: day.title,
        type: day.type,
        tools: day.tools || [],
        objectives: day.objectives || []
      }
    });
    if (error) {
       console.error(`❌ Error inserting day ${day.day}`, error);
    }
  }
  console.log("✅ Days seeded.");

  console.log("Seeding Candidates...");
  for (const cand of CANDIDATES_DATA.candidates) {
    const payload = {
      id: cand.member.id,
      name: cand.member.name,
      job_role: cand.member.jobRole,
      years_experience: cand.member.yearsExperience,
      education: cand.member.education,
      status: cand.member.status,
      signals: cand.signals,
      missions: cand.missions || []
    };
    const { error } = await supabase.rpc('upsert_candidate_from_json', { payload });
    if (error) {
       console.error(`❌ Error inserting candidate ${cand.member.id}`, error);
    }
  }
  console.log("✅ Candidates seeded.");

  console.log("🚀 Seeding complete!");
}

seed();
