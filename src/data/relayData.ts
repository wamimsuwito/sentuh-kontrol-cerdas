import { RelayCategory } from "@/types/relay";

export const relayCategories: RelayCategory[] = [
  {
    id: "aneka-kopi",
    name: "Aneka Kopi",
    emoji: "☕",
    items: [
      { id: "kopi-hitam", name: "Kopi Hitam", relayNumber: 0, category: "aneka-kopi" },
      { id: "kapal-api-mix", name: "Kapal Api Mix", relayNumber: 1, category: "aneka-kopi" },
      { id: "gula-aren", name: "Gula Aren", relayNumber: 2, category: "aneka-kopi" },
      { id: "susu-panas", name: "Susu Panas", relayNumber: 3, category: "aneka-kopi" }
    ]
  },
  {
    id: "minuman-dingin",
    name: "Minuman Dingin",
    emoji: "🥤",
    items: [
      { id: "es-teh", name: "Teh Pucuk", relayNumber: 4, category: "minuman-dingin" },
      { id: "es-jeruk", name: "Susu Beruang", relayNumber: 5, category: "minuman-dingin" },
      { id: "es-kopi", name: "Mizone", relayNumber: 6, category: "minuman-dingin" },
      { id: "jus-buah", name: "Air Mineral", relayNumber: 7, category: "minuman-dingin" }
    ]
  },
  {
    id: "makanan-ringan",
    name: "Snack, Biskuit & Pop Mie",
    emoji: "🍟",
    items: [
      { id: "keripik", name: "Pop Mie Goreng", relayNumber: 8, category: "makanan-ringan" },
      { id: "biskuit", name: "Pop Mie Kuah", relayNumber: 9, category: "makanan-ringan" },
      { id: "kacang", name: "Roma Kelapa", relayNumber: 10, category: "makanan-ringan" },
      { id: "permen", name: "Teh Manis Panas", relayNumber: 11, category: "makanan-ringan" }
    ]
  },
  {
    id: "rokok-ketengah",
    name: "Rokok Ketengan",
    emoji: "🚬",
    items: [
      { id: "marlboro", name: "surya", relayNumber: 12, category: "rokok-ketengah" },
      { id: "gudang-garam", name: "Jarum Coklat", relayNumber: 13, category: "rokok-ketengah" },
      { id: "sampoerna", name: "Sampoerna Mild", relayNumber: 14, category: "rokok-ketengah" },
      { id: "djarum", name: "Rc Biru", relayNumber: 15, category: "rokok-ketengah" }
    ]
  }
];
