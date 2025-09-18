// Mock data for grade form fields
export const mockData = {
  // Raw Materials for Addition/Dilution Settings
  rawMaterials: [
    { value: '', label: 'Select raw material...' },
    { value: 'pig_iron', label: 'Pig Iron', category: 'Furnace' },
    { value: 'steel_scrap', label: 'Steel Scrap', category: 'Furnace' },
    { value: 'cast_iron_returns', label: 'Cast Iron Returns', category: 'Furnace' },
    { value: 'ferro_silicon', label: 'Ferro Silicon', category: 'Additives' },
    { value: 'ferro_manganese', label: 'Ferro Manganese', category: 'Additives' },
    { value: 'ferro_chrome', label: 'Ferro Chrome', category: 'Additives' },
    { value: 'magnesium_ferrosilicon', label: 'Magnesium Ferrosilicon', category: 'Nodularizer' },
    { value: 'rare_earth_alloy', label: 'Rare Earth Alloy', category: 'Nodularizer' },
    { value: 'calcium_silicon', label: 'Calcium Silicon', category: 'Ladle' },
    { value: 'aluminum_wire', label: 'Aluminum Wire', category: 'Ladle' }
  ],

  // Elements for Target Chemistry
  chemistryElements: [
    { value: 'Mn', label: 'Mn - Manganese' },
    { value: 'P', label: 'P - Phosphorus' },
    { value: 'S', label: 'S - Sulfur' },
    { value: 'Cr', label: 'Cr - Chromium' },
    { value: 'Ni', label: 'Ni - Nickel' },
    { value: 'Mo', label: 'Mo - Molybdenum' },
    { value: 'Cu', label: 'Cu - Copper' },
    { value: 'Al', label: 'Al - Aluminum' },
    { value: 'Ti', label: 'Ti - Titanium' },
    { value: 'V', label: 'V - Vanadium' },
    { value: 'Nb', label: 'Nb - Niobium' },
    { value: 'B', label: 'B - Boron' },
    { value: 'N', label: 'N - Nitrogen' },
    { value: 'Mg', label: 'Mg - Magnesium' },
    { value: 'Ca', label: 'Ca - Calcium' },
    { value: 'Ce', label: 'Ce - Cerium' },
    { value: 'La', label: 'La - Lanthanum' },
    { value: 'Pr', label: 'Pr - Praseodymium' },
    { value: 'Nd', label: 'Nd - Neodymium' },
    { value: 'Sm', label: 'Sm - Samarium' },
    { value: 'Eu', label: 'Eu - Europium' },
    { value: 'Gd', label: 'Gd - Gadolinium' },
    { value: 'Tb', label: 'Tb - Terbium' },
    { value: 'Dy', label: 'Dy - Dysprosium' },
    { value: 'Ho', label: 'Ho - Holmium' },
    { value: 'Er', label: 'Er - Erbium' },
    { value: 'Tm', label: 'Tm - Thulium' },
    { value: 'Yb', label: 'Yb - Ytterbium' },
    { value: 'Lu', label: 'Lu - Lutetium' },
    { value: 'Y', label: 'Y - Yttrium' },
    { value: 'Sc', label: 'Sc - Scandium' },
    { value: 'Zr', label: 'Zr - Zirconium' },
    { value: 'Hf', label: 'Hf - Hafnium' },
    { value: 'Ta', label: 'Ta - Tantalum' },
    { value: 'Re', label: 'Re - Rhenium' },
    { value: 'Os', label: 'Os - Osmium' },
    { value: 'Ir', label: 'Ir - Iridium' },
    { value: 'Pt', label: 'Pt - Platinum' },
    { value: 'Au', label: 'Au - Gold' },
    { value: 'Hg', label: 'Hg - Mercury' },
    { value: 'Tl', label: 'Tl - Thallium' },
    { value: 'Pb', label: 'Pb - Lead' },
    { value: 'Bi', label: 'Bi - Bismuth' },
    { value: 'Po', label: 'Po - Polonium' },
    { value: 'At', label: 'At - Astatine' },
    { value: 'Rn', label: 'Rn - Radon' },
    { value: 'Fr', label: 'Fr - Francium' },
    { value: 'Ra', label: 'Ra - Radium' },
    { value: 'Ac', label: 'Ac - Actinium' },
    { value: 'Th', label: 'Th - Thorium' },
    { value: 'Pa', label: 'Pa - Protactinium' },
    { value: 'U', label: 'U - Uranium' },
    { value: 'Np', label: 'Np - Neptunium' },
    { value: 'Pu', label: 'Pu - Plutonium' },
    { value: 'Am', label: 'Am - Americium' },
    { value: 'Cm', label: 'Cm - Curium' },
    { value: 'Bk', label: 'Bk - Berkelium' },
    { value: 'Cf', label: 'Cf - Californium' },
    { value: 'Es', label: 'Es - Einsteinium' },
    { value: 'Fm', label: 'Fm - Fermium' },
    { value: 'Md', label: 'Md - Mendelevium' },
    { value: 'No', label: 'No - Nobelium' },
    { value: 'Lr', label: 'Lr - Lawrencium' },
    { value: 'Sn', label: 'Sn - Tin' }
  ],

  // Add Options for Target Chemistry Table
  addOptions: [
    { value: 'C', label: 'Carbon (C)' },
    { value: 'Si', label: 'Silicon (Si)' },
    { value: 'Mn', label: 'Manganese (Mn)' },
    { value: 'P', label: 'Phosphorus (P)' },
    { value: 'S', label: 'Sulfur (S)' },
    { value: 'Cr', label: 'Chromium (Cr)' },
    { value: 'Ni', label: 'Nickel (Ni)' },
    { value: 'Mo', label: 'Molybdenum (Mo)' },
    { value: 'Cu', label: 'Copper (Cu)' },
    { value: 'Al', label: 'Aluminum (Al)' },
    { value: 'Ti', label: 'Titanium (Ti)' },
    { value: 'V', label: 'Vanadium (V)' },
    { value: 'Nb', label: 'Niobium (Nb)' },
    { value: 'B', label: 'Boron (B)' },
    { value: 'N', label: 'Nitrogen (N)' }
  ],

  // Grade Types
  gradeTypes: [
    { value: 'DI', label: 'DI - Ductile Iron', description: 'Used for high-strength, wear-resistant applications.' },
    { value: 'CI', label: 'CI - Cast Iron', description: 'Commonly used for general engineering components.' },
    { value: 'SS', label: 'SS - Stainless Steel', description: 'Known for corrosion resistance and strength.' },
    { value: 'SG', label: 'SG - Spheroidal Graphite', description: 'Offers good ductility and impact resistance.' },
    { value: 'GI', label: 'GI - Gray Iron', description: 'Economical, good machinability, and damping properties.' }
  ],

  // Module Types
  moduleTypes: [
    { value: 'spectro', label: 'Spectro Module', description: 'Advanced spectroscopy analysis and chemistry management' },
    { value: 'kiosk', label: 'Kiosk Module', description: 'Self-service interface for production floor operations' },
    { value: 'heat_plan', label: 'Heat Plan Module', description: 'Comprehensive heat planning and scheduling system' },
    { value: 'quality_control', label: 'Quality Control Module', description: 'Quality assurance and testing management' },
    { value: 'inventory', label: 'Inventory Module', description: 'Raw material and consumable inventory tracking' },
    { value: 'reporting', label: 'Reporting Module', description: 'Analytics and reporting dashboard' }
  ],

  // Chargemix Materials
  chargemixMaterials: [
    { value: '', label: 'Select raw material...' },
    { value: 'pig_iron', label: 'Pig Iron', category: 'Furnace' },
    { value: 'steel_scrap', label: 'Steel Scrap', category: 'Furnace' },
    { value: 'cast_iron_returns', label: 'Cast Iron Returns', category: 'Furnace' },
    { value: 'silicon_carbide', label: 'Silicon Carbide', category: 'Furnace' },
    { value: 'ferrosilicon', label: 'Ferrosilicon', category: 'Furnace' },
    { value: 'calcium_carbide', label: 'Calcium Carbide', category: 'Additives' },
    { value: 'graphite', label: 'Graphite', category: 'Additives' },
    { value: 'carbon_raiser', label: 'Carbon Raiser', category: 'Additives' },
    { value: 'ferromanganese', label: 'Ferromanganese', category: 'Additives' },
    { value: 'ferro_silicon_magnesium', label: 'Ferro Silicon Magnesium', category: 'Nodularizer' },
    { value: 'nickel_magnesium', label: 'Nickel Magnesium', category: 'Nodularizer' },
    { value: 'magnesium', label: 'Magnesium', category: 'Nodularizer' },
    { value: 'rare_earth_magnesium', label: 'Rare Earth Magnesium', category: 'Nodularizer' },
    { value: 'ladle_sand', label: 'Ladle Sand', category: 'Ladle' },
    { value: 'refractory_brick', label: 'Refractory Brick', category: 'Ladle' },
    { value: 'ladle_lining', label: 'Ladle Lining', category: 'Ladle' },
    { value: 'calcium_wire', label: 'Calcium Wire', category: 'Ladle' }
  ]
};

export default mockData;
