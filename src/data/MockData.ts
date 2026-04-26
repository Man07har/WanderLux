import postMaldives from "@/assets/post-maldives.jpg";
import postTokyo from "@/assets/post-tokyo.jpg";
import postPatagonia from "@/assets/post-patagonia.jpg";
import postSahara from "@/assets/post-sahara.jpg";
import postIceland from "@/assets/post-iceland.jpg";
import postAlps from "@/assets/post-alps.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import avatar4 from "@/assets/avatar-4.jpg";
import avatar5 from "@/assets/avatar-5.jpg";

export const users = [
  { id: "1", name: "Aria Vance",     handle: "ariawanders",  avatar: avatar1, country: "Norway" },
  { id: "2", name: "Kenji Mori",     handle: "kenji.frames", avatar: avatar2, country: "Japan" },
  { id: "3", name: "Zola Okafor",    handle: "zolaonfoot",   avatar: avatar3, country: "Morocco" },
  { id: "4", name: "Magnus Hale",    handle: "magnusalpine", avatar: avatar4, country: "Iceland" },
  { id: "5", name: "Lia Mendes",     handle: "lia.salt",     avatar: avatar5, country: "Brazil" },
];

export type Post = {
  id: string;
  user: typeof users[number];
  image: string;
  location: string;
  coords: { x: number; y: number }; // % on flat map
  caption: string;
  tags: string[];
  likes: number;
  comments: number;
  postedAt: string;
  aspect?: "square" | "portrait" | "landscape";
};

export const posts: Post[] = [
  {
    id: "p1", user: users[0], image: postPatagonia,
    location: "Torres del Paine, Patagonia",
    coords: { x: 30, y: 82 },
    caption: "Four days of wind, rain, and one perfect minute of light. Worth every step.",
    tags: ["#patagonia", "#trekking", "#goldenhour"],
    likes: 12483, comments: 214, postedAt: "2h", aspect: "portrait",
  },
  {
    id: "p2", user: users[1], image: postTokyo,
    location: "Shibuya, Tokyo",
    coords: { x: 84, y: 42 },
    caption: "Rain in Shibuya hits different. Neon, reflections, strangers passing through frame.",
    tags: ["#tokyo", "#streetphotography", "#nightcity"],
    likes: 8210, comments: 142, postedAt: "5h", aspect: "square",
  },
  {
    id: "p3", user: users[3], image: postIceland,
    location: "Vatnajökull, Iceland",
    coords: { x: 47, y: 22 },
    caption: "Crawled into the belly of a glacier today. Silence so loud you can hear your own pulse.",
    tags: ["#iceland", "#icecave", "#expedition"],
    likes: 19872, comments: 408, postedAt: "8h", aspect: "portrait",
  },
  {
    id: "p4", user: users[2], image: postSahara,
    location: "Erg Chebbi, Sahara",
    coords: { x: 51, y: 52 },
    caption: "Day three in the dunes. The desert teaches you how small you really are.",
    tags: ["#sahara", "#morocco", "#solotravel"],
    likes: 6543, comments: 88, postedAt: "12h", aspect: "square",
  },
  {
    id: "p5", user: users[4], image: postMaldives,
    location: "Baa Atoll, Maldives",
    coords: { x: 70, y: 60 },
    caption: "Lanterns on still water. No filter, no rush, no signal. Just blue.",
    tags: ["#maldives", "#offgrid", "#bluehour"],
    likes: 22014, comments: 512, postedAt: "1d", aspect: "square",
  },
  {
    id: "p6", user: users[0], image: postAlps,
    location: "Glacier Express, Swiss Alps",
    coords: { x: 52, y: 36 },
    caption: "Eight hours of windows like postcards. The slow way is always the best way.",
    tags: ["#switzerland", "#slowtravel", "#trains"],
    likes: 4380, comments: 71, postedAt: "1d", aspect: "square",
  },
];

export const stories = users.map((u, i) => ({
  ...u,
  destination: ["Lofoten", "Kyoto", "Marrakech", "Reykjavík", "Florianópolis"][i],
}));

export const trendingTags = [
  { tag: "#solotravel", posts: "284K" },
  { tag: "#hiddengems", posts: "192K" },
  { tag: "#vanlife", posts: "1.2M" },
  { tag: "#offgrid", posts: "76K" },
  { tag: "#nightsky", posts: "143K" },
];
