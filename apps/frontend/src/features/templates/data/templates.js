const localTemplateSpecs = [
  ["001", "28s"],
  ["002", "19s"],
  ["003", "14s"],
  ["004", "26s"],
  ["005", "42s"],
  ["006", "60s"],
  ["007", "48s"],
  ["008", "44s"],
  ["009", "26s"],
  ["010", "40s"],
  ["011", "49s"],
  ["012", "43s"],
  ["013", "53s"],
  ["014", "69s"],
  ["015", "84s"],
  ["016", "60s"],
  ["017", "56s"],
  ["018", "22s"],
  ["019", "35s"],
  ["020", "42s"],
];

const defaultPrompt =
  "Bugun sizga bitta muhim fikrni aytaman: oddiy gapni aniq, qisqa va esda qoladigan qilib yetkazing.";

const localTemplates = localTemplateSpecs.map(([number, length]) => ({
  id: `local-template-${number}`,
  title: `Template ${number}`,
  tone: "Confident",
  length,
  mediaType: "video",
  media: `/assets/templates/local/local-template-${number}.mp4`,
  poster: `/assets/templates/local/local-template-${number}-poster.jpg`,
  sourcePath: `/Users/gg/Public/videogen/vd-gen.api-service/media/templates/template_${number}/test${Number(number)}.mp4`,
  prompt: defaultPrompt,
}));

export const templates = [
  ...localTemplates,
  {
    id: "instagram-dz7gcvtfocc",
    title: "Instagram template",
    tone: "Confident",
    length: "51s",
    mediaType: "video",
    media: "/assets/templates/instagram-dz7gcvtfocc.mp4",
    poster: "/assets/templates/instagram-dz7gcvtfocc-poster.jpg",
    sourceUrl: "https://www.instagram.com/p/DZ7GcVTFOcc/",
    prompt: "Bugun sizga bitta oddiy fikrni aytaman: natija olish uchun avval aniq template tanlang.",
  },
];
