// Modifiez score et thresholds, puis rechargez index.html.
// Seuils dans l’ordre : Bronze, Silver, Gold, Platinum, Diamond.
// Records et derniers seuils retenus dans « Créer son profil Voltaic ».
window.BENCHMARK_DATA = {
  title: "Tracking Benchmark by Akira",
  player: "Raffou",
  categories: [
    { name: "Smoothness", description: "Un suivi fluide et stable", scenarios: [
      { name: "Pasu Track Smooth", score: 4464, thresholds: [3800,4700,5200,5800,6400] },
      { name: "Smoothbot Voltaic Easy", score: 1250, thresholds: [1700,2100,2400,2800,3100] },
      { name: "Air Voltaic Invincible 1", score: 2241, thresholds: [2200,2700,3300,3800,4300] }
    ]},
    { name: "Reactive Tracking", description: "Réagir aux changements de direction", scenarios: [
      { name: "Cata IC Fast Strafes", score: 1425.94, thresholds: [1250,1600,1850,2100,2350] },
      { name: "Close Fast Strafes Invincible", score: 5022, thresholds: [5000,6850,7800,8800,9800] },
      { name: "VSS GP9", score: 3966.75, thresholds: [4000,5700,6500,7300,8200] }
    ]},
    { name: "Precise Tracking", description: "Précision et micro-corrections", scenarios: [
      { name: "Thin Aiming Long", score: 1371, thresholds: [900,1200,1370,1500,1650] },
      { name: "Narrow Strafe", score: 624.14, thresholds: [500,790,900,1000,1100] },
      { name: "VT ControlStrafes Valorant", score: 1910, thresholds: [1400,1900,2260,2550,2850] }
    ]},
    { name: "Strafing & Movement", description: "Coordonner déplacement et visée", scenarios: [
      { name: "AD_Strafing_Trainer_Close", score: 7236, thresholds: [7000,10000,14400,16500,18500] },
      { name: "VT PatStrafe Intermediate", score: 1335.95, thresholds: [1300,1800,2370,2800,3200] },
      { name: "Air Angelic 4 Voltaic Easy", score: 1986, thresholds: [1800,2200,2600,3000,3300] }
    ]}
  ]
};
