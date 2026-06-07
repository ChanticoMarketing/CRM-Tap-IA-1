import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});

async function main() {
  console.log('Connecting to database to apply the atomic sync trigger...');

  // 1. Create the function handle_new_user
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public."User" (id, email, name, role, "createdAt", "updatedAt")
      VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''),
        'user',
        now(),
        now()
      );
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  // 2. Statements for the trigger
  const dropTriggerSQL = 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;';
  const createTriggerSQL = `
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `;

  try {
    console.log('Applying handle_new_user() SQL function...');
    await prisma.$executeRawUnsafe(createFunctionSQL);
    console.log('Function applied successfully.');

    console.log('Dropping existing trigger if it exists...');
    await prisma.$executeRawUnsafe(dropTriggerSQL);
    console.log('Trigger dropped successfully.');

    console.log('Applying on_auth_user_created trigger...');
    await prisma.$executeRawUnsafe(createTriggerSQL);
    console.log('Trigger applied successfully. Sincronización atómica de usuarios activa! ⚡');
  } catch (error) {
    console.error('Error applying trigger/function:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
