const skillArjuna = [
  {
    namaSkill: "Sasmita Duta",
    deskripsi:
      "Arjuna membangkitkan semangat kepahlawanan dalam dirinya. Meningkatkan serangan fisik untuk beberapa giliran melalui ketajaman nalar dan kepiawaian berdiplomasi.",
    efek: {
      atk: +25, // Buff ATK +25%
    },
    tipe: "Buff Type",
    cooldown: 8,
    durasi: 4,
    tenagaSukma: 2,
  },
  {
    namaSkill: "Semedi Kawelasan",
    deskripsi:
      "Dengan khusyuk bertapa, Arjuna menyembuhkan tubuhnya melalui energi spiritual. Cocok digunakan dalam keadaan terdesak.",
    efek: {
      heal: 30, // Heal 30% HP
    },
    tipe: "Support Type",
    cooldown: 12,
    durasi: null,
    tenagaSukma: 4,
  },
  {
    namaSkill: "Panuntun Jiwa",
    deskripsi:
      "Arjuna menyalakan api semangat dalam dirinya, memacu kecepatan serangan dan ketepatan dalam setiap tusukan panahnya.",
    efek: {
      atk: +15,
      atkSpd: +15,
    },
    tipe: "Buff Type",
    cooldown: 10,
    durasi: 6,
    tenagaSukma: 4,
  },
];

const skillDuryudana = [
  {
    namaSkill: "Gada Wisa Astina",
    deskripsi:
      "Duryudana melemparkan serangan kepada musuh dengan warisan kerajaan Astina, menghasilkan serangan brutal yang mampu menembus pertahanan keras sekalipun.",
    efek: {
      baseDamage: 30,
      bonusDamagePercent: 20, // 20% dari ATK
    },
    tipe: "Attack",
    cooldown: 9,
    durasi: null, // langsung/instant
    tenagaSukma: 4,
  },
  {
    namaSkill: "Daya Wisesa",
    deskripsi:
      "Mengaktifkan kekuatan tubuh besi yang dilatih oleh Baladewa, tubuh Duryudana menjadi sangat tahan pukul selama beberapa waktu.",
    efek: {
      immuneDamage: true,
    },
    tipe: "Defence",
    cooldown: 12,
    durasi: 3,
    tenagaSukma: 5,
  },
  {
    namaSkill: "Raja Tanpa Tunduk",
    deskripsi:
      "Dengan semangat pantang menyerah, Duryudana memperkuat semangat tempurnya, meningkatkan kekuatan serangannya selama beberapa saat. Cocok untuk membalikkan keadaan.",
    efek: {
      atk: +20,
    },
    tipe: "Buff",
    cooldown: 8,
    durasi: 3,
    tenagaSukma: 3,
  },
];


export { skillArjuna, skillDuryudana };