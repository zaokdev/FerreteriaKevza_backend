import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  // --- Roles ---
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "cliente" },
      update: {},
      create: { name: "cliente" },
    }),
    prisma.role.upsert({
      where: { name: "admin_demo" },
      update: {},
      create: { name: "admin_demo" },
    }),
    prisma.role.upsert({
      where: { name: "owner" },
      update: {},
      create: { name: "owner" },
    }),
  ]);

  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));
  console.log("✓ Roles");

  // --- Usuarios ---
  await Promise.all([
    prisma.user.upsert({
      where: { email: "kevinzaok@outlook.com" },
      update: {},
      create: {
        username: "Kevin",
        email: "kevinzaok@outlook.com",
        password: await bcrypt.hash(process.env.OWNER_PASSWORD, 10),
        isVerified: true,
        idRole: roleMap["owner"],
      },
    }),
    prisma.user.upsert({
      where: { email: "demo@kevza.com" },
      update: {},
      create: {
        username: "Admin Demo",
        email: "demo@kevza.com",
        password: await bcrypt.hash("demo1234", 10),
        isVerified: true,
        idRole: roleMap["admin_demo"],
      },
    }),
    prisma.user.upsert({
      where: { email: "cliente@kevza.com" },
      update: {},
      create: {
        username: "Cliente Test",
        email: "cliente@kevza.com",
        password: await bcrypt.hash("cliente1234", 10),
        isVerified: true,
        idRole: roleMap["cliente"],
      },
    }),
  ]);
  console.log("✓ Usuarios");

  // --- Categorías ---
  const categoryNames = [
    "Herramienta manual",
    "Herramienta eléctrica",
    "Tornillería y fijación",
    "Plomería",
    "Eléctrico",
    "Pintura y acabados",
  ];

  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  );

  const cat = Object.fromEntries(categories.map((c) => [c.name, c.id]));
  console.log("✓ Categorías");

  // --- Productos ---
  const productCount = await prisma.product.count();
  if (productCount > 0) {
    console.log("✓ Productos (ya existen, se omiten)");
  } else {
    const products = [
      // Herramienta manual — 15
      {
        name: "Martillo de carpintero 16 oz",
        description: "Cabeza de acero forjado 16 oz con mango de fibra de vidrio. Uña curva para extracción de clavos. Ideal para carpintería y construcción general.",
        precio: 189.0, stock: 50, cat: "Herramienta manual", isFeatured: true,
      },
      {
        name: "Desarmador Phillips #2",
        description: "Punta Phillips #2 de acero cromo-vanadio endurecida. Mango ergonómico antideslizante con grip bimaterial para mayor torque.",
        precio: 45.0, stock: 80, cat: "Herramienta manual",
      },
      {
        name: 'Desarmador plano 1/4"',
        description: 'Hoja de acero CrV 1/4" con punta tratada térmicamente. Mango de doble material con zona de agarre suave y cabeza giratoria.',
        precio: 38.0, stock: 75, cat: "Herramienta manual",
      },
      {
        name: 'Pinzas de presión 10"',
        description: 'Pinzas tipo Vise-Grip 10" con ajuste de apertura mediante tornillo. Bloqueo seguro, cuerpo de acero forjado. Para sujeción y trabajo en metal.',
        precio: 165.0, stock: 35, cat: "Herramienta manual",
      },
      {
        name: "Cinta métrica 5 metros",
        description: "Cinta de acero inoxidable 5m con cubierta ABS resistente a golpes. Escala en centímetros y pulgadas. Freno automático de palanca.",
        precio: 79.0, stock: 60, cat: "Herramienta manual",
      },
      {
        name: "Nivel de burbuja 60 cm",
        description: "Cuerpo de aluminio extruido con 3 matraces de nivelación. Exactitud ±0.5 mm/m. Para obras de albañilería, instalaciones y carpintería.",
        precio: 220.0, stock: 25, cat: "Herramienta manual",
      },
      {
        name: 'Llave ajustable 12"',
        description: 'Mandíbula de acero cromo-níquel con ajuste fino. Apertura máxima 34mm. Para tuercas y tornillos en medidas estándar y métricas.',
        precio: 245.0, stock: 30, cat: "Herramienta manual",
      },
      {
        name: "Segueta arco ajustable",
        description: 'Arco metálico con tensión regulable, acepta hojas de 10 y 12". Mango pistola con grip antideslizante. Para corte de metal y PVC.',
        precio: 145.0, stock: 28, cat: "Herramienta manual",
      },
      {
        name: 'Paleta de albañil 10"',
        description: 'Hoja de acero templado 10" soldada a mango metálico con agarre de madera. Para aplicación y nivelado de mezclas en mampostería.',
        precio: 89.0, stock: 40, cat: "Herramienta manual",
      },
      {
        name: 'Lima plana bastarda 10"',
        description: 'Lima de corte bastardo en acero de alta dureza. Perfil plano de doble cara para limado general de metal, madera dura y plásticos.',
        precio: 65.0, stock: 45, cat: "Herramienta manual",
      },
      {
        name: 'Cincel plano 1"',
        description: 'Cincel de acero al carbono 1" con tratamiento térmico. Para labrado de piedra, demolición de concreto y desmontaje de azulejo.',
        precio: 75.0, stock: 38, cat: "Herramienta manual",
      },
      {
        name: "Mazo de goma 2 lbs",
        description: "Cabeza de goma negra 2 lbs con mango de madera lacado. No daña superficies sensibles. Para ensambles, cerámica y trabajo de chapas.",
        precio: 155.0, stock: 22, cat: "Herramienta manual",
      },
      {
        name: 'Pata de cabra 24"',
        description: 'Palanca de acero de alta resistencia 24" con punta curva y punta plana. Para desmontaje, extracción de clavos y apalancamiento.',
        precio: 185.0, stock: 18, cat: "Herramienta manual",
      },
      {
        name: "Pistola para silicón manual",
        description: "Cuerpo de acero estampado con mecanismo de émbolo y liberación rápida. Compatible con cartuchos de 300ml. Flujo suave y controlado.",
        precio: 95.0, stock: 42, cat: "Herramienta manual",
      },
      {
        name: "Escuadra de carpintero 30 cm",
        description: "Escuadra de acero inoxidable 30cm con ángulo 90° garantizado y escala grabada en mm. Para trazado preciso en madera y metalurgia.",
        precio: 110.0, stock: 32, cat: "Herramienta manual",
      },

      // Herramienta eléctrica — 12
      {
        name: "Taladro percutor 500W",
        description: "Motor 500W con función percutora para concreto y mampostería. Mandril de 13mm de llave, 2800 RPM. Empuñadura lateral y maletín incluidos.",
        precio: 1250.0, stock: 15, cat: "Herramienta eléctrica", isFeatured: true,
      },
      {
        name: 'Esmeriladora angular 4.5"',
        description: 'Motor 730W con disco de 4.5". Velocidad sin carga 11,000 RPM. Para desbaste, corte y pulido de metal y mampostería. Guarda ajustable.',
        precio: 890.0, stock: 12, cat: "Herramienta eléctrica",
      },
      {
        name: 'Sierra circular 7.25"',
        description: 'Motor 1400W con hoja 7.25" y profundidad de corte 65mm a 90°. Guía paralela y base de aluminio incluidas. Para madera y tableros.',
        precio: 1450.0, stock: 8, cat: "Herramienta eléctrica",
      },
      {
        name: "Lijadora orbital 1/4 hoja",
        description: "Motor 160W con órbita de 2.5mm. Plato de 93x93mm compatible con lija estándar sin adhesivo. Bolsa recolectora de polvo incluida.",
        precio: 750.0, stock: 10, cat: "Herramienta eléctrica",
      },
      {
        name: "Caladora 450W",
        description: "Motor 450W con 3,200 cpm y corte a bisel ajustable hasta 45°. Compatible con hojas T-shank. Para madera, metal y plástico.",
        precio: 980.0, stock: 9, cat: "Herramienta eléctrica",
      },
      {
        name: "Atornillador inalámbrico 12V",
        description: "Motor 12V con batería de ion-litio y cargador incluidos. Par máximo 30 Nm, velocidad variable. Portabrocas magnético 1/4\" hexagonal.",
        precio: 1150.0, stock: 11, cat: "Herramienta eléctrica",
      },
      {
        name: "Cepillo eléctrico 560W",
        description: "Motor 560W con tambor a 16,000 RPM. Ancho de cepillado 82mm, profundidad ajustable 0-1mm. Para nivelado de puertas y superficies en madera.",
        precio: 1320.0, stock: 6, cat: "Herramienta eléctrica",
      },
      {
        name: "Rotomartillo SDS 800W",
        description: "Motor 800W con sistema SDS para cambio de broca sin llave. 4000 golpes/min, 3 modos: taladro, percutor y cincel. Para concreto y roca.",
        precio: 1980.0, stock: 7, cat: "Herramienta eléctrica",
      },
      {
        name: "Router fresadora 1HP",
        description: 'Motor 1HP con collets de 1/4" y 1/2". Velocidad variable 10,000-30,000 RPM. Base ajustable en aluminio para canteado y moldurado en madera.',
        precio: 1890.0, stock: 5, cat: "Herramienta eléctrica",
      },
      {
        name: 'Tronzadora 14"',
        description: 'Motor 2000W con disco abrasivo 14" para corte de metal y perfiles estructurales. Mesa pivotante con tope de ángulo y tornillo de banco.',
        precio: 2450.0, stock: 4, cat: "Herramienta eléctrica",
      },
      {
        name: "Dremel multifuncional 130W",
        description: "Motor 130W de alta velocidad, 5,000-32,000 RPM variables. Incluye 50 accesorios para corte, grabado, pulido y rectificado de precisión.",
        precio: 1680.0, stock: 8, cat: "Herramienta eléctrica",
      },
      {
        name: "Sopladora industrial 500W",
        description: "Motor 500W con flujo de aire regulable en dos velocidades. Para limpieza de equipos, remoción de polvo y secado rápido en taller.",
        precio: 680.0, stock: 10, cat: "Herramienta eléctrica",
      },

      // Tornillería y fijación — 15
      {
        name: 'Tornillo autorroscante 8x1" caja x100',
        description: 'Tornillo autorroscante punta broca cabeza Phillips, acabado fosfatado negro. Caja de 100 piezas. Para fijación en lámina y perfil ligero.',
        precio: 55.0, stock: 70, cat: "Tornillería y fijación",
      },
      {
        name: "Taquete fischer 8mm caja x50",
        description: "Taquete de nylon 8mm con expansión radial uniforme y nervaduras antirrotación. Caja de 50 piezas. Para fijaciones en concreto y tabique.",
        precio: 75.0, stock: 90, cat: "Tornillería y fijación",
      },
      {
        name: 'Ancla de plomo 3/8" caja x25',
        description: 'Ancla de plomo 3/8" con alta resistencia al arrancamiento. Caja de 25 piezas. Para cargas pesadas en concreto y mampostería sólida.',
        precio: 48.0, stock: 45, cat: "Tornillería y fijación",
      },
      {
        name: 'Tornillo hexagonal 1/4x1" caja x50',
        description: 'Tornillo de cabeza hexagonal grado 5 zincado, paso grueso. Caja de 50 piezas. Para estructuras metálicas y ensambles industriales.',
        precio: 65.0, stock: 55, cat: "Tornillería y fijación",
      },
      {
        name: 'Tuerca hexagonal 1/4" caja x100',
        description: 'Tuerca hexagonal estándar zincada, paso grueso. Caja de 100 piezas. Complemento directo para tornillos y esparragos de 1/4".',
        precio: 38.0, stock: 80, cat: "Tornillería y fijación",
      },
      {
        name: 'Arandela plana 1/4" caja x100',
        description: 'Arandela plana de acero zincado 1/4" SAE. Caja de 100 piezas. Para distribución de carga y protección de superficies en ensambles.',
        precio: 28.0, stock: 95, cat: "Tornillería y fijación",
      },
      {
        name: 'Clavo liso 2.5" kg',
        description: 'Clavo de cabeza plana punta diamante, acabado brillante, kilogramo. Para carpintería, tarima y construcción general en madera.',
        precio: 45.0, stock: 60, cat: "Tornillería y fijación",
      },
      {
        name: 'Clavo para concreto 2" caja x100',
        description: 'Clavo endurecido con punta cuadrada y cabeza redonda. Caja de 100 piezas. Fijación directa en concreto sin necesidad de taquete.',
        precio: 85.0, stock: 50, cat: "Tornillería y fijación",
      },
      {
        name: 'Pija para madera 3x1" caja x100',
        description: 'Tornillo de cabeza cónica Phillips punta aguda para madera, zincado. Caja de 100 piezas. Para ensambles en madera blanda y dura.',
        precio: 42.0, stock: 65, cat: "Tornillería y fijación",
      },
      {
        name: 'Tornillo para drywall 6x1.5" caja x100',
        description: 'Tornillo punta broca cabeza Bugle, fosfatado negro. Caja de 100 piezas. Para fijación de placa de yeso en perfil de calibre 25.',
        precio: 38.0, stock: 75, cat: "Tornillería y fijación",
      },
      {
        name: "Taquete de plástico 6mm caja x100",
        description: "Taquete de nylon 6mm con nervaduras antirrotación. Caja de 100 piezas. Para tornillos de 3-4mm en concreto, tabique y block.",
        precio: 55.0, stock: 85, cat: "Tornillería y fijación",
      },
      {
        name: 'Espárrago roscado 3/8"x1m',
        description: 'Barra roscada de acero galvanizado 3/8" en varilla de 1m. Para instalaciones suspendidas, soportes ajustables y anclajes estructurales.',
        precio: 68.0, stock: 30, cat: "Tornillería y fijación",
      },
      {
        name: 'Pin de expansión 3/8"x3" caja x25',
        description: 'Perno de expansión mecánica con tuerca y arandela incluidas. Caja de 25 piezas. Alta capacidad de carga en concreto sólido.',
        precio: 95.0, stock: 40, cat: "Tornillería y fijación",
      },
      {
        name: 'Remache pop 3/16" caja x100',
        description: 'Remache de aluminio cabeza redonda 3/16". Caja de 100 piezas. Para unión permanente de lámina, tela metálica y perfiles delgados.',
        precio: 65.0, stock: 55, cat: "Tornillería y fijación",
      },
      {
        name: 'Tornillo de ojo 1/4" caja x20',
        description: 'Tornillo de ojo cerrado con rosca de 1/4". Caja de 20 piezas. Para colgado de cargas, instalación de cables y tirantes de tensión.',
        precio: 75.0, stock: 35, cat: "Tornillería y fijación",
      },

      // Plomería — 13
      {
        name: 'Llave de paso 1/2"',
        description: 'Llave esférica de latón cromado 1/2" con palanca mariposa. Para corte de agua fría y caliente en instalaciones domésticas y comerciales.',
        precio: 135.0, stock: 40, cat: "Plomería", isFeatured: true,
      },
      {
        name: 'Tubo PVC hidráulico 1/2" (3m)',
        description: 'Tubo de PVC cédula 40, presión de trabajo 315 PSI, tramo de 3m. Para redes de agua fría a presión en instalaciones residenciales.',
        precio: 89.0, stock: 55, cat: "Plomería",
      },
      {
        name: 'Codo PVC 90° 1/2" pza',
        description: 'Codo de PVC 90° campana x espiga 1/2" para sistemas hidráulicos a presión. Unión por pegamento de contacto para PVC.',
        precio: 8.5, stock: 200, cat: "Plomería",
      },
      {
        name: 'Tee PVC 1/2" pza',
        description: 'Tee de PVC 1/2" para derivaciones en sistemas de agua a presión. Unión por pegamento, compatible con tubo hidráulico cédula 40.',
        precio: 12.0, stock: 150, cat: "Plomería",
      },
      {
        name: 'Reducción PVC 3/4" a 1/2"',
        description: 'Reducción bushing de PVC de 3/4" a 1/2" para adaptación entre diámetros. Para redes hidráulicas a presión con unión por pegamento.',
        precio: 15.0, stock: 100, cat: "Plomería",
      },
      {
        name: "Silicón transparente 280ml",
        description: "Sellador de silicón transparente de acetato en cartucho de 280ml. Resistente al agua y moho. Para baños, cocinas y sellado de fachadas.",
        precio: 72.0, stock: 45, cat: "Plomería",
      },
      {
        name: "Teflón rollo 12mm",
        description: "Cinta de PTFE 12mm de ancho, espesor estándar. Para sellado hermético de roscas en tuberías de agua fría, caliente y gas.",
        precio: 18.0, stock: 120, cat: "Plomería",
      },
      {
        name: "Manguera flexible para lavabo 50cm",
        description: "Manguera de acero trenzado 50cm con conexiones 1/2\" macho-hembra. Para alimentación de lavabos y depósitos de inodoro.",
        precio: 65.0, stock: 38, cat: "Plomería",
      },
      {
        name: "Flotador para tinaco",
        description: "Válvula de flotador de latón con bola de plástico para tinaco y cisterna. Corte automático al alcanzar el nivel máximo de llenado.",
        precio: 185.0, stock: 20, cat: "Plomería",
      },
      {
        name: 'Llave de jardín 3/4"',
        description: 'Llave de paso de jardín con rosca exterior 3/4". Cuerpo de bronce resistente a la intemperie. Para tomas exteriores y mangueras.',
        precio: 165.0, stock: 25, cat: "Plomería",
      },
      {
        name: "Mezcladora para lavabo cromada",
        description: "Mezcladora monomando para lavabo con acabado cromado de alta resistencia. Incluye flexible y desagüe. Para agua fría y caliente.",
        precio: 450.0, stock: 12, cat: "Plomería",
      },
      {
        name: "Trampa P para lavabo",
        description: 'Trampa tipo P de PVC 1.5" para lavabo. Previene retorno de gases del desagüe. Unión deslizante con tuerca y arandela de compresión.',
        precio: 245.0, stock: 18, cat: "Plomería",
      },
      {
        name: "Sello de hule para WC",
        description: 'Sello de goma para inodoro de 3" y 4". Repuesto universal para base de WC, evita fugas de agua y retorno de gases del drenaje.',
        precio: 85.0, stock: 35, cat: "Plomería",
      },

      // Eléctrico — 13
      {
        name: "Cable THW calibre 12 (100m)",
        description: "Cable de cobre 100% THW calibre 12 en bobina de 100m. Aislamiento termoplástico para 600V. Para instalaciones residenciales e industriales.",
        precio: 980.0, stock: 20, cat: "Eléctrico", isFeatured: true,
      },
      {
        name: "Contacto triple con tierra",
        description: "Contacto de pared triple polarizado con clavija de tierra, 15A/125V. Cuerpo de nylon de alta resistencia para instalación empotrada.",
        precio: 55.0, stock: 100, cat: "Eléctrico",
      },
      {
        name: "Cinta aislante negra paquete x5",
        description: "Cinta aislante de PVC negro 19mm x 20m, paquete de 5 rollos. Resistente a 600V, rango de temperatura 0-60°C. Para empalmes y aislar conductores.",
        precio: 65.0, stock: 75, cat: "Eléctrico",
      },
      {
        name: "Interruptor sencillo de pared",
        description: "Interruptor de palanca sencillo 15A/120V con placa incluida. Para circuitos de iluminación en instalaciones residenciales estándar.",
        precio: 48.0, stock: 60, cat: "Eléctrico",
      },
      {
        name: "Apagador doble con placa",
        description: "Apagador doble de palanca 15A con placa de acero inoxidable incluida. Para dos circuitos independientes de iluminación en una caja.",
        precio: 125.0, stock: 45, cat: "Eléctrico",
      },
      {
        name: "Foco LED 9W E27",
        description: "Foco LED 9W base E27, luz blanca 6500K. Equivalente a 60W incandescente, 800 lm de flujo luminoso, vida útil 25,000 horas.",
        precio: 45.0, stock: 120, cat: "Eléctrico",
      },
      {
        name: "Luminaria LED 18W sobreponer",
        description: "Luminaria de sobreponer redonda 18W, luz blanca 6000K. Diámetro 22cm, 1600 lm. Para interiores residenciales y comerciales.",
        precio: 285.0, stock: 30, cat: "Eléctrico",
      },
      {
        name: "Cable duplex calibre 14 (100m)",
        description: "Cable duplex de cobre 100% calibre 14, bobina de 100m. Aislamiento de PVC para 300V. Para extensiones y circuitos de baja carga.",
        precio: 720.0, stock: 18, cat: "Eléctrico",
      },
      {
        name: "Centro de carga 8 circuitos",
        description: "Panel de distribución para 8 circuitos con cubierta metálica incluida. Barras de neutro y tierra. Para instalaciones residenciales y locales.",
        precio: 685.0, stock: 10, cat: "Eléctrico",
      },
      {
        name: "Breaker 1 polo 15A",
        description: "Interruptor termomagnético 1 polo 15A/120V. Para protección de circuitos ramales residenciales en paneles de distribución estándar.",
        precio: 145.0, stock: 40, cat: "Eléctrico",
      },
      {
        name: "Clavija tipo T macho 15A",
        description: "Clavija macho tipo T de 15A/125V con cuerpo de policarbonato resistente. Para conexión de equipos a red doméstica con tierra física.",
        precio: 38.0, stock: 80, cat: "Eléctrico",
      },
      {
        name: "Contacto de piso cromado",
        description: "Contacto de piso de acero inoxidable 15A con tapa abatible de cierre automático. Para instalación a ras de piso en oficinas y salas.",
        precio: 320.0, stock: 15, cat: "Eléctrico",
      },
      {
        name: "Multímetro digital básico",
        description: "Multímetro digital con pantalla LCD, mide voltaje AC/DC, corriente y resistencia. Incluye puntas de prueba y funda protectora de hule.",
        precio: 380.0, stock: 22, cat: "Eléctrico",
      },

      // Pintura y acabados — 12
      {
        name: "Pintura vinílica blanca 19L",
        description: "Pintura vinílica de alta cubrición color blanco en cubeta de 19 litros. Rendimiento aprox. 40m² por mano. Para interiores y exteriores.",
        precio: 620.0, stock: 18, cat: "Pintura y acabados", isFeatured: true,
      },
      {
        name: 'Rodillo de pintura 9"',
        description: 'Rodillo de felpa 3/8" de 9" con mango metálico roscado. Para superficies lisas y semitexturizadas. Compatible con vinílica y esmaltes.',
        precio: 95.0, stock: 50, cat: "Pintura y acabados",
      },
      {
        name: 'Brocha de 4"',
        description: 'Brocha de 4" con cerdas de nylon-poliéster de alta retención. Para aplicación de pintura vinílica, esmalte y barniz en superficies planas.',
        precio: 58.0, stock: 65, cat: "Pintura y acabados",
      },
      {
        name: "Lija al agua grano 220 pza",
        description: "Lija al agua grano 220 en hoja de 23x28cm. Para lijado fino entre manos de pintura y acabados en madera, metal y carrocería.",
        precio: 12.0, stock: 150, cat: "Pintura y acabados",
      },
      {
        name: "Sellador de yeso 4L",
        description: "Sellador acrílico para yeso y concreto en cubeta de 4 litros. Fija superficies porosas antes de pintar. Rendimiento 10-12m² por litro.",
        precio: 285.0, stock: 20, cat: "Pintura y acabados",
      },
      {
        name: "Pintura esmalte colores 1L",
        description: "Esmalte alquídico brillante en lata de 1 litro. Alta resistencia a la intemperie y al roce. Para metal, madera y concreto.",
        precio: 145.0, stock: 35, cat: "Pintura y acabados",
      },
      {
        name: "Masilla lista para usar 4kg",
        description: "Masilla de acabado acrílica en cubeta de 4kg. Para corrección de imperfecciones en muros y plafones previo a la aplicación de pintura.",
        precio: 185.0, stock: 22, cat: "Pintura y acabados",
      },
      {
        name: "Sellador acrílico transparente 300ml",
        description: "Sellador acrílico transparente flexible en cartucho de 300ml. Resistente a la intemperie. Para juntas en ventanas, puertas y fachadas.",
        precio: 68.0, stock: 40, cat: "Pintura y acabados",
      },
      {
        name: "Thinner 1L",
        description: "Solvente diluyente para esmaltes y lacas alquídicas en lata de 1 litro. Para ajuste de viscosidad y limpieza de equipo de pintura.",
        precio: 55.0, stock: 55, cat: "Pintura y acabados",
      },
      {
        name: "Charola para rodillo",
        description: 'Charola de plástico de alta resistencia con nervaduras de escurrido antideslizantes. Compatible con rodillos de 7 y 9". Con soporte de rodillo.',
        precio: 48.0, stock: 60, cat: "Pintura y acabados",
      },
      {
        name: "Cinta para enmascarar 48mm x40m",
        description: "Cinta adhesiva de papel crepé 48mm x 40m. Para enmascarar superficies antes de pintar. Retira limpiamente sin dejar residuo adhesivo.",
        precio: 35.0, stock: 80, cat: "Pintura y acabados",
      },
      {
        name: "Lija papel grano 100 pza",
        description: "Lija de papel grano 100 en hoja estándar 23x28cm. Para desbaste en madera, yeso y superficies previo al acabado o primer coat.",
        precio: 8.0, stock: 200, cat: "Pintura y acabados",
      },
    ];

    await prisma.product.createMany({
      data: products.map((p) => ({
        name: p.name,
        precio: p.precio,
        stock: p.stock,
        idCategory: cat[p.cat],
        isFeatured: p.isFeatured ?? false,
        isActive: true,
      })),
    });

    console.log(`✓ Productos (${products.length} creados)`);
  }

  console.log("\nSeed completado.");
  console.log("─────────────────────────────────────────");
  console.log("  owner      → kevinzaok@outlook.com / .env");
  console.log("  admin_demo → demo@kevza.com        / demo1234");
  console.log("  cliente    → cliente@kevza.com     / cliente1234");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
