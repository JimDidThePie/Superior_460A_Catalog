import type { Product } from "../types/product";

export const demoProducts: Product[] = [
  {
    id: "variable-speed-pump",
    name: "AquaFlow Variable Speed Pump",
    category: "Pumps",
    description:
      "Energy-efficient circulation pump for quiet daily operation, lower power use, and dependable showroom-ready performance.",
    price: "$1,249",
    specs: ["2.7 HP motor", "Programmable schedules", "Quiet-drive housing", "Energy Star style efficiency"],
    imageUrl:
      "https://images.unsplash.com/photo-1626535554722-08cca9bdb4c5?auto=format&fit=crop&w=1200&q=80",
    modelUrl: "",
    modelEmbedUrl: "",
    productUrl: "",
    featured: true,
    hidden: false,
    sortOrder: 1,
  },
  {
    id: "salt-system",
    name: "ClearSalt Chlorine Generator",
    category: "Sanitizers",
    description:
      "Low-maintenance salt sanitation system built for steady water quality and easy homeowner control.",
    price: "$899",
    specs: ["Up to 40,000 gallons", "Digital output control", "Self-cleaning cell", "Low-salt indicator"],
    imageUrl:
      "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=80",
    modelUrl: "",
    modelEmbedUrl: "",
    productUrl: "",
    featured: false,
    hidden: false,
    sortOrder: 2,
  },
  {
    id: "robotic-cleaner",
    name: "WaveBot Robotic Pool Cleaner",
    category: "Cleaners",
    description:
      "Smart robotic cleaner with wall climbing, fine debris pickup, and a fast rinse filter basket.",
    price: "$1,099",
    specs: ["Cleans floor, walls, and waterline", "60 ft cable", "Top-load basket", "Weekly timer"],
    imageUrl:
      "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?auto=format&fit=crop&w=1200&q=80",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    modelEmbedUrl: "",
    productUrl: "",
    featured: true,
    hidden: false,
    sortOrder: 3,
  },
  {
    id: "led-light",
    name: "Prism LED Pool Light",
    category: "Lighting",
    description:
      "Color-changing LED fixture for nighttime pool ambience, remodels, and new pool installations.",
    price: "$449",
    specs: ["RGB color shows", "Low-voltage design", "Long-life LED array", "Remote automation compatible"],
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    modelUrl: "",
    modelEmbedUrl: "",
    productUrl: "",
    featured: false,
    hidden: false,
    sortOrder: 4,
  },
];
