import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const descriptions = {
  "Martillo de carpintero 16 oz": "Cabeza de acero forjado 16 oz con mango de fibra de vidrio. Uña curva para extracción de clavos. Ideal para carpintería y construcción general.",
  "Desarmador Phillips #2": "Punta Phillips #2 de acero cromo-vanadio endurecida. Mango ergonómico antideslizante con grip bimaterial para mayor torque.",
  'Desarmador plano 1/4"': 'Hoja de acero CrV 1/4" con punta tratada térmicamente. Mango de doble material con zona de agarre suave y cabeza giratoria.',
  'Pinzas de presión 10"': 'Pinzas tipo Vise-Grip 10" con ajuste de apertura mediante tornillo. Bloqueo seguro, cuerpo de acero forjado. Para sujeción y trabajo en metal.',
  "Cinta métrica 5 metros": "Cinta de acero inoxidable 5m con cubierta ABS resistente a golpes. Escala en centímetros y pulgadas. Freno automático de palanca.",
  "Nivel de burbuja 60 cm": "Cuerpo de aluminio extruido con 3 matraces de nivelación. Exactitud ±0.5 mm/m. Para obras de albañilería, instalaciones y carpintería.",
  'Llave ajustable 12"': 'Mandíbula de acero cromo-níquel con ajuste fino. Apertura máxima 34mm. Para tuercas y tornillos en medidas estándar y métricas.',
  "Segueta arco ajustable": 'Arco metálico con tensión regulable, acepta hojas de 10 y 12". Mango pistola con grip antideslizante. Para corte de metal y PVC.',
  'Paleta de albañil 10"': 'Hoja de acero templado 10" soldada a mango metálico con agarre de madera. Para aplicación y nivelado de mezclas en mampostería.',
  'Lima plana bastarda 10"': 'Lima de corte bastardo en acero de alta dureza. Perfil plano de doble cara para limado general de metal, madera dura y plásticos.',
  'Cincel plano 1"': 'Cincel de acero al carbono 1" con tratamiento térmico. Para labrado de piedra, demolición de concreto y desmontaje de azulejo.',
  "Mazo de goma 2 lbs": "Cabeza de goma negra 2 lbs con mango de madera lacado. No daña superficies sensibles. Para ensambles, cerámica y trabajo de chapas.",
  'Pata de cabra 24"': 'Palanca de acero de alta resistencia 24" con punta curva y punta plana. Para desmontaje, extracción de clavos y apalancamiento.',
  "Pistola para silicón manual": "Cuerpo de acero estampado con mecanismo de émbolo y liberación rápida. Compatible con cartuchos de 300ml. Flujo suave y controlado.",
  "Escuadra de carpintero 30 cm": "Escuadra de acero inoxidable 30cm con ángulo 90° garantizado y escala grabada en mm. Para trazado preciso en madera y metalurgia.",
  "Taladro percutor 500W": "Motor 500W con función percutora para concreto y mampostería. Mandril de 13mm de llave, 2800 RPM. Empuñadura lateral y maletín incluidos.",
  'Esmeriladora angular 4.5"': 'Motor 730W con disco de 4.5". Velocidad sin carga 11,000 RPM. Para desbaste, corte y pulido de metal y mampostería. Guarda ajustable.',
  'Sierra circular 7.25"': 'Motor 1400W con hoja 7.25" y profundidad de corte 65mm a 90°. Guía paralela y base de aluminio incluidas. Para madera y tableros.',
  "Lijadora orbital 1/4 hoja": "Motor 160W con órbita de 2.5mm. Plato de 93x93mm compatible con lija estándar sin adhesivo. Bolsa recolectora de polvo incluida.",
  "Caladora 450W": "Motor 450W con 3,200 cpm y corte a bisel ajustable hasta 45°. Compatible con hojas T-shank. Para madera, metal y plástico.",
  "Atornillador inalámbrico 12V": 'Motor 12V con batería de ion-litio y cargador incluidos. Par máximo 30 Nm, velocidad variable. Portabrocas magnético 1/4" hexagonal.',
  "Cepillo eléctrico 560W": "Motor 560W con tambor a 16,000 RPM. Ancho de cepillado 82mm, profundidad ajustable 0-1mm. Para nivelado de puertas y superficies en madera.",
  "Rotomartillo SDS 800W": "Motor 800W con sistema SDS para cambio de broca sin llave. 4000 golpes/min, 3 modos: taladro, percutor y cincel. Para concreto y roca.",
  "Router fresadora 1HP": 'Motor 1HP con collets de 1/4" y 1/2". Velocidad variable 10,000-30,000 RPM. Base ajustable en aluminio para canteado y moldurado en madera.',
  'Tronzadora 14"': 'Motor 2000W con disco abrasivo 14" para corte de metal y perfiles estructurales. Mesa pivotante con tope de ángulo y tornillo de banco.',
  "Dremel multifuncional 130W": "Motor 130W de alta velocidad, 5,000-32,000 RPM variables. Incluye 50 accesorios para corte, grabado, pulido y rectificado de precisión.",
  "Sopladora industrial 500W": "Motor 500W con flujo de aire regulable en dos velocidades. Para limpieza de equipos, remoción de polvo y secado rápido en taller.",
  'Tornillo autorroscante 8x1" caja x100': 'Tornillo autorroscante punta broca cabeza Phillips, acabado fosfatado negro. Caja de 100 piezas. Para fijación en lámina y perfil ligero.',
  "Taquete fischer 8mm caja x50": "Taquete de nylon 8mm con expansión radial uniforme y nervaduras antirrotación. Caja de 50 piezas. Para fijaciones en concreto y tabique.",
  'Ancla de plomo 3/8" caja x25': 'Ancla de plomo 3/8" con alta resistencia al arrancamiento. Caja de 25 piezas. Para cargas pesadas en concreto y mampostería sólida.',
  'Tornillo hexagonal 1/4x1" caja x50': 'Tornillo de cabeza hexagonal grado 5 zincado, paso grueso. Caja de 50 piezas. Para estructuras metálicas y ensambles industriales.',
  'Tuerca hexagonal 1/4" caja x100': 'Tuerca hexagonal estándar zincada, paso grueso. Caja de 100 piezas. Complemento directo para tornillos y esparragos de 1/4".',
  'Arandela plana 1/4" caja x100': 'Arandela plana de acero zincado 1/4" SAE. Caja de 100 piezas. Para distribución de carga y protección de superficies en ensambles.',
  'Clavo liso 2.5" kg': 'Clavo de cabeza plana punta diamante, acabado brillante, kilogramo. Para carpintería, tarima y construcción general en madera.',
  'Clavo para concreto 2" caja x100': 'Clavo endurecido con punta cuadrada y cabeza redonda. Caja de 100 piezas. Fijación directa en concreto sin necesidad de taquete.',
  'Pija para madera 3x1" caja x100': 'Tornillo de cabeza cónica Phillips punta aguda para madera, zincado. Caja de 100 piezas. Para ensambles en madera blanda y dura.',
  'Tornillo para drywall 6x1.5" caja x100': 'Tornillo punta broca cabeza Bugle, fosfatado negro. Caja de 100 piezas. Para fijación de placa de yeso en perfil de calibre 25.',
  "Taquete de plástico 6mm caja x100": "Taquete de nylon 6mm con nervaduras antirrotación. Caja de 100 piezas. Para tornillos de 3-4mm en concreto, tabique y block.",
  'Espárrago roscado 3/8"x1m': 'Barra roscada de acero galvanizado 3/8" en varilla de 1m. Para instalaciones suspendidas, soportes ajustables y anclajes estructurales.',
  'Pin de expansión 3/8"x3" caja x25': 'Perno de expansión mecánica con tuerca y arandela incluidas. Caja de 25 piezas. Alta capacidad de carga en concreto sólido.',
  'Remache pop 3/16" caja x100': 'Remache de aluminio cabeza redonda 3/16". Caja de 100 piezas. Para unión permanente de lámina, tela metálica y perfiles delgados.',
  'Tornillo de ojo 1/4" caja x20': 'Tornillo de ojo cerrado con rosca de 1/4". Caja de 20 piezas. Para colgado de cargas, instalación de cables y tirantes de tensión.',
  'Llave de paso 1/2"': 'Llave esférica de latón cromado 1/2" con palanca mariposa. Para corte de agua fría y caliente en instalaciones domésticas y comerciales.',
  'Tubo PVC hidráulico 1/2" (3m)': 'Tubo de PVC cédula 40, presión de trabajo 315 PSI, tramo de 3m. Para redes de agua fría a presión en instalaciones residenciales.',
  'Codo PVC 90° 1/2" pza': 'Codo de PVC 90° campana x espiga 1/2" para sistemas hidráulicos a presión. Unión por pegamento de contacto para PVC.',
  'Tee PVC 1/2" pza': 'Tee de PVC 1/2" para derivaciones en sistemas de agua a presión. Unión por pegamento, compatible con tubo hidráulico cédula 40.',
  'Reducción PVC 3/4" a 1/2"': 'Reducción bushing de PVC de 3/4" a 1/2" para adaptación entre diámetros. Para redes hidráulicas a presión con unión por pegamento.',
  "Silicón transparente 280ml": "Sellador de silicón transparente de acetato en cartucho de 280ml. Resistente al agua y moho. Para baños, cocinas y sellado de fachadas.",
  "Teflón rollo 12mm": "Cinta de PTFE 12mm de ancho, espesor estándar. Para sellado hermético de roscas en tuberías de agua fría, caliente y gas.",
  "Manguera flexible para lavabo 50cm": 'Manguera de acero trenzado 50cm con conexiones 1/2" macho-hembra. Para alimentación de lavabos y depósitos de inodoro.',
  "Flotador para tinaco": "Válvula de flotador de latón con bola de plástico para tinaco y cisterna. Corte automático al alcanzar el nivel máximo de llenado.",
  'Llave de jardín 3/4"': 'Llave de paso de jardín con rosca exterior 3/4". Cuerpo de bronce resistente a la intemperie. Para tomas exteriores y mangueras.',
  "Mezcladora para lavabo cromada": "Mezcladora monomando para lavabo con acabado cromado de alta resistencia. Incluye flexible y desagüe. Para agua fría y caliente.",
  "Trampa P para lavabo": 'Trampa tipo P de PVC 1.5" para lavabo. Previene retorno de gases del desagüe. Unión deslizante con tuerca y arandela de compresión.',
  "Sello de hule para WC": 'Sello de goma para inodoro de 3" y 4". Repuesto universal para base de WC, evita fugas de agua y retorno de gases del drenaje.',
  "Cable THW calibre 12 (100m)": "Cable de cobre 100% THW calibre 12 en bobina de 100m. Aislamiento termoplástico para 600V. Para instalaciones residenciales e industriales.",
  "Contacto triple con tierra": "Contacto de pared triple polarizado con clavija de tierra, 15A/125V. Cuerpo de nylon de alta resistencia para instalación empotrada.",
  "Cinta aislante negra paquete x5": "Cinta aislante de PVC negro 19mm x 20m, paquete de 5 rollos. Resistente a 600V, rango de temperatura 0-60°C. Para empalmes y aislar conductores.",
  "Interruptor sencillo de pared": "Interruptor de palanca sencillo 15A/120V con placa incluida. Para circuitos de iluminación en instalaciones residenciales estándar.",
  "Apagador doble con placa": "Apagador doble de palanca 15A con placa de acero inoxidable incluida. Para dos circuitos independientes de iluminación en una caja.",
  "Foco LED 9W E27": "Foco LED 9W base E27, luz blanca 6500K. Equivalente a 60W incandescente, 800 lm de flujo luminoso, vida útil 25,000 horas.",
  "Luminaria LED 18W sobreponer": "Luminaria de sobreponer redonda 18W, luz blanca 6000K. Diámetro 22cm, 1600 lm. Para interiores residenciales y comerciales.",
  "Cable duplex calibre 14 (100m)": "Cable duplex de cobre 100% calibre 14, bobina de 100m. Aislamiento de PVC para 300V. Para extensiones y circuitos de baja carga.",
  "Centro de carga 8 circuitos": "Panel de distribución para 8 circuitos con cubierta metálica incluida. Barras de neutro y tierra. Para instalaciones residenciales y locales.",
  "Breaker 1 polo 15A": "Interruptor termomagnético 1 polo 15A/120V. Para protección de circuitos ramales residenciales en paneles de distribución estándar.",
  "Clavija tipo T macho 15A": "Clavija macho tipo T de 15A/125V con cuerpo de policarbonato resistente. Para conexión de equipos a red doméstica con tierra física.",
  "Contacto de piso cromado": "Contacto de piso de acero inoxidable 15A con tapa abatible de cierre automático. Para instalación a ras de piso en oficinas y salas.",
  "Multímetro digital básico": "Multímetro digital con pantalla LCD, mide voltaje AC/DC, corriente y resistencia. Incluye puntas de prueba y funda protectora de hule.",
  "Pintura vinílica blanca 19L": "Pintura vinílica de alta cubrición color blanco en cubeta de 19 litros. Rendimiento aprox. 40m² por mano. Para interiores y exteriores.",
  'Rodillo de pintura 9"': 'Rodillo de felpa 3/8" de 9" con mango metálico roscado. Para superficies lisas y semitexturizadas. Compatible con vinílica y esmaltes.',
  'Brocha de 4"': 'Brocha de 4" con cerdas de nylon-poliéster de alta retención. Para aplicación de pintura vinílica, esmalte y barniz en superficies planas.',
  "Lija al agua grano 220 pza": "Lija al agua grano 220 en hoja de 23x28cm. Para lijado fino entre manos de pintura y acabados en madera, metal y carrocería.",
  "Sellador de yeso 4L": "Sellador acrílico para yeso y concreto en cubeta de 4 litros. Fija superficies porosas antes de pintar. Rendimiento 10-12m² por litro.",
  "Pintura esmalte colores 1L": "Esmalte alquídico brillante en lata de 1 litro. Alta resistencia a la intemperie y al roce. Para metal, madera y concreto.",
  "Masilla lista para usar 4kg": "Masilla de acabado acrílica en cubeta de 4kg. Para corrección de imperfecciones en muros y plafones previo a la aplicación de pintura.",
  "Sellador acrílico transparente 300ml": "Sellador acrílico transparente flexible en cartucho de 300ml. Resistente a la intemperie. Para juntas en ventanas, puertas y fachadas.",
  "Thinner 1L": "Solvente diluyente para esmaltes y lacas alquídicas en lata de 1 litro. Para ajuste de viscosidad y limpieza de equipo de pintura.",
  "Charola para rodillo": 'Charola de plástico de alta resistencia con nervaduras de escurrido antideslizantes. Compatible con rodillos de 7 y 9". Con soporte de rodillo.',
  "Cinta para enmascarar 48mm x40m": "Cinta adhesiva de papel crepé 48mm x 40m. Para enmascarar superficies antes de pintar. Retira limpiamente sin dejar residuo adhesivo.",
  "Lija papel grano 100 pza": "Lija de papel grano 100 en hoja estándar 23x28cm. Para desbaste en madera, yeso y superficies previo al acabado o primer coat.",
};

async function main() {
  console.log("Actualizando descripciones de productos...");

  let updated = 0;
  let notFound = 0;

  for (const [name, description] of Object.entries(descriptions)) {
    const result = await prisma.product.updateMany({
      where: { name },
      data: { description },
    });

    if (result.count > 0) {
      updated++;
    } else {
      console.warn(`  ⚠ No encontrado: "${name}"`);
      notFound++;
    }
  }

  console.log(`✓ ${updated} productos actualizados`);
  if (notFound > 0) {
    console.log(`⚠ ${notFound} productos no encontrados`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
