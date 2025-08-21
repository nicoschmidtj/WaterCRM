export type Region = { nombre: string; provincias: { nombre: string }[] };
export const REGIONES: Region[] = [
  { nombre: "Arica y Parinacota", provincias: [{ nombre: "Arica" }, { nombre: "Parinacota" }] },
  { nombre: "Tarapacá", provincias: [{ nombre: "Iquique" }, { nombre: "Tamarugal" }] },
  { nombre: "Antofagasta", provincias: [{ nombre: "Antofagasta" }, { nombre: "El Loa" }, { nombre: "Tocopilla" }] },
  { nombre: "Atacama", provincias: [{ nombre: "Copiapó" }, { nombre: "Chañaral" }, { nombre: "Huasco" }] },
  { nombre: "Coquimbo", provincias: [{ nombre: "Elqui" }, { nombre: "Choapa" }, { nombre: "Limarí" }] },
  { nombre: "Valparaíso", provincias: [
    { nombre: "Valparaíso" }, { nombre: "Marga Marga" }, { nombre: "Quillota" }, { nombre: "San Antonio" },
    { nombre: "San Felipe de Aconcagua" }, { nombre: "Los Andes" }, { nombre: "Petorca" }, { nombre: "Isla de Pascua" }
  ] },
  { nombre: "Metropolitana de Santiago", provincias: [
    { nombre: "Santiago" }, { nombre: "Chacabuco" }, { nombre: "Cordillera" }, { nombre: "Maipo" }, { nombre: "Melipilla" }, { nombre: "Talagante" }
  ] },
  { nombre: "Libertador General Bernardo O'Higgins", provincias: [{ nombre: "Cachapoal" }, { nombre: "Colchagua" }, { nombre: "Cardenal Caro" }] },
  { nombre: "Maule", provincias: [{ nombre: "Talca" }, { nombre: "Curicó" }, { nombre: "Linares" }, { nombre: "Cauquenes" }] },
  { nombre: "Ñuble", provincias: [{ nombre: "Diguillín" }, { nombre: "Itata" }, { nombre: "Punilla" }] },
  { nombre: "Biobío", provincias: [{ nombre: "Concepción" }, { nombre: "Arauco" }, { nombre: "Biobío" }] },
  { nombre: "La Araucanía", provincias: [{ nombre: "Cautín" }, { nombre: "Malleco" }] },
  { nombre: "Los Ríos", provincias: [{ nombre: "Valdivia" }, { nombre: "Ranco" }] },
  { nombre: "Los Lagos", provincias: [{ nombre: "Llanquihue" }, { nombre: "Osorno" }, { nombre: "Chiloé" }, { nombre: "Palena" }] },
  { nombre: "Aysén del General Carlos Ibáñez del Campo", provincias: [{ nombre: "Coyhaique" }, { nombre: "Aysén" }, { nombre: "General Carrera" }, { nombre: "Capitán Prat" }] },
  { nombre: "Magallanes y de la Antártica Chilena", provincias: [{ nombre: "Magallanes" }, { nombre: "Última Esperanza" }, { nombre: "Tierra del Fuego" }, { nombre: "Antártica Chilena" }] }
];


