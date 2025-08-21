import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generarRutTemporal(id) {
  return `TEMP-${String(id).padStart(6, '0')}`;
}

async function main() {
  const clientes = await prisma.client.findMany({
    where: { OR: [{ rut: null }, { rut: '' }] },
    select: { id: true, rut: true },
  });

  if (clientes.length === 0) {
    console.log('No hay clientes sin RUT. Nada que hacer.');
    return;
  }

  for (const c of clientes) {
    const rut = generarRutTemporal(c.id);
    await prisma.client.update({
      where: { id: c.id },
      data: { rut },
    });
    console.log(`Cliente ${c.id} -> rut=${rut}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


