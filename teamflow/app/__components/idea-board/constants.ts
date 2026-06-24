import type { IdeaReaction, StickyNote } from "@/src/entities/models/idea-board";

export const NOTE_WIDTH = 180;
export const NOTE_HEIGHT = 130;
export const FUN_ITEM_SIZE = 56;

export type EmojiTool = {
  id: string;
  label: string;
  fallback: string;
  lottieSrc: string;
};

const EMOJI_LOTTIE_BASE_URL = "https://fonts.gstatic.com/s/e/notoemoji/latest";
const toLottieUrl = (codepoint: string) => `${EMOJI_LOTTIE_BASE_URL}/${codepoint}/lottie.json`;

export const EMOJI_TOOLS: readonly EmojiTool[] = [
  { id: "party_popper", label: "Party Popper", fallback: "\u{1F389}", lottieSrc: toLottieUrl("1f389") },
  { id: "heart_eyes", label: "Heart Eyes", fallback: "\u{1F60D}", lottieSrc: toLottieUrl("1f60d") },
  { id: "smile", label: "Smile", fallback: "\u{1F604}", lottieSrc: toLottieUrl("1f604") },
  { id: "star_struck", label: "Star Struck", fallback: "\u{1F929}", lottieSrc: toLottieUrl("1f929") },
  { id: "sparkles", label: "Sparkles", fallback: "\u{2728}", lottieSrc: toLottieUrl("2728") },
  { id: "grinning", label: "Grinning", fallback: "\u{1F600}", lottieSrc: toLottieUrl("1f600") },
  { id: "fire", label: "Fire", fallback: "\u{1F525}", lottieSrc: toLottieUrl("1f525") },
  { id: "rocket", label: "Rocket", fallback: "\u{1F680}", lottieSrc: toLottieUrl("1f680") },
  { id: "sparkling_heart", label: "Sparkling Heart", fallback: "\u{1F496}", lottieSrc: toLottieUrl("1f496") },
  { id: "celebrate", label: "Party Face", fallback: "\u{1F973}", lottieSrc: toLottieUrl("1f973") },
  { id: "tears_of_joy", label: "Tears of Joy", fallback: "\u{1F602}", lottieSrc: toLottieUrl("1f602") },
  { id: "clap", label: "Clap", fallback: "\u{1F44F}", lottieSrc: toLottieUrl("1f44f") },
  { id: "thumbs_up", label: "Thumbs Up", fallback: "\u{1F44D}", lottieSrc: toLottieUrl("1f44d") },
  { id: "ok_hand", label: "OK Hand", fallback: "\u{1F44C}", lottieSrc: toLottieUrl("1f44c") },
  { id: "muscle", label: "Muscle", fallback: "\u{1F4AA}", lottieSrc: toLottieUrl("1f4aa") },
  { id: "rofl", label: "ROFL", fallback: "\u{1F923}", lottieSrc: toLottieUrl("1f923") },
  { id: "zany", label: "Zany", fallback: "\u{1F92A}", lottieSrc: toLottieUrl("1f92a") },
  { id: "wink", label: "Wink", fallback: "\u{1F609}", lottieSrc: toLottieUrl("1f609") },
  { id: "tongue", label: "Tongue", fallback: "\u{1F61B}", lottieSrc: toLottieUrl("1f61b") },
  { id: "sunglasses_star", label: "Party Eyes", fallback: "\u{1F92D}", lottieSrc: toLottieUrl("1f92d") },
  { id: "mind_blown", label: "Mind Blown", fallback: "\u{1F92F}", lottieSrc: toLottieUrl("1f92f") },
  { id: "cool", label: "Cool", fallback: "\u{1F60E}", lottieSrc: toLottieUrl("1f60e") },
  { id: "thinking", label: "Thinking", fallback: "\u{1F914}", lottieSrc: toLottieUrl("1f914") },
  { id: "relieved", label: "Relieved", fallback: "\u{1F60C}", lottieSrc: toLottieUrl("1f60c") },
  { id: "woozy", label: "Woozy", fallback: "\u{1F974}", lottieSrc: toLottieUrl("1f974") },
  { id: "money_face", label: "Money Face", fallback: "\u{1F911}", lottieSrc: toLottieUrl("1f911") },
  { id: "upside_down", label: "Upside Down", fallback: "\u{1F643}", lottieSrc: toLottieUrl("1f643") },
  { id: "skull", label: "Skull", fallback: "\u{1F480}", lottieSrc: toLottieUrl("1f480") },
  { id: "ghost", label: "Ghost", fallback: "\u{1F47B}", lottieSrc: toLottieUrl("1f47b") },
  { id: "alien", label: "Alien", fallback: "\u{1F47D}", lottieSrc: toLottieUrl("1f47d") },
  { id: "robot", label: "Robot", fallback: "\u{1F916}", lottieSrc: toLottieUrl("1f916") },
  { id: "clown", label: "Clown", fallback: "\u{1F921}", lottieSrc: toLottieUrl("1f921") },
  { id: "monocle", label: "Monocle", fallback: "\u{1F9D0}", lottieSrc: toLottieUrl("1f9d0") },
  { id: "cowboy", label: "Cowboy", fallback: "\u{1F920}", lottieSrc: toLottieUrl("1f920") },
  { id: "devil_smile", label: "Smiling Devil", fallback: "\u{1F608}", lottieSrc: toLottieUrl("1f608") },
  { id: "poop", label: "Poop", fallback: "\u{1F4A9}", lottieSrc: toLottieUrl("1f4a9") },
  { id: "eyes", label: "Eyes", fallback: "\u{1F440}", lottieSrc: toLottieUrl("1f440") },
] as const;

const EMOJI_TOOL_BY_ID = new Map(EMOJI_TOOLS.map((emojiTool) => [emojiTool.id, emojiTool]));
const EMOJI_TOOL_BY_FALLBACK = new Map(EMOJI_TOOLS.map((emojiTool) => [emojiTool.fallback, emojiTool]));

export function getEmojiToolByValue(value: string) {
  return EMOJI_TOOL_BY_ID.get(value) ?? EMOJI_TOOL_BY_FALLBACK.get(value) ?? null;
}

export const SHAPE_TOOLS = [
  { type: "rectangle", label: "Rectangle", icon: "\u25A1" },
  { type: "circle", label: "Circle", icon: "\u25EF" },
  { type: "triangle", label: "Triangle", icon: "\u25B3" },
  { type: "diamond", label: "Diamond", icon: "\u25C7" },
  { type: "pentagon", label: "Pentagon", icon: "\u2B20" },
  { type: "hexagon", label: "Hexagon", icon: "\u2B21" },
  { type: "star", label: "Star", icon: "\u2606" },
  { type: "arrow", label: "Arrow", icon: "\u279C" },
  { type: "line", label: "Line", icon: "\uFF0F" },
] as const;

export const NOTE_PAD_COLORS = ["#ffe082", "#f8bbd0", "#b3e5fc", "#c5e1a5", "#ffcc80", "#d1c4e9"] as const;

export const INITIAL_REACTIONS: Record<IdeaReaction, number> = {
  love: 7,
  party: 5,
  fire: 3,
  clap: 4,
};

export const CATEGORY_COLORS: Record<StickyNote["category"], string> = {
  location: "#ffe082",
  menu: "#ffcc80",
  allergies: "#f8bbd0",
  schedule: "#c5e1a5",
  music: "#b3e5fc",
  general: "#d1c4e9",
};

