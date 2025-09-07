
interface PredefinedRiddleData {
    title: string;
    question: string;
    answer: string;
    options: string[];
}

export const predefinedRiddles: PredefinedRiddleData[] = [
    {
        title: "The Storm Chest",
        question: "I’m the chest you fill before the storm,\nWhen waves get wild I keep you warm.\nNot for gold you plan to spend today —\nA rainy shield for a rainy day.",
        answer: "Emergency fund",
        options: ["Emergency fund", "A Wool Coat", "Buried Treasure"]
    },
    {
        title: "The Captain's Ledger",
        question: "Divide the booty at dawn’s first light,\nA steady share makes future bright.\nSpend, save, share — make the split,\nKeep your ship and crew well-fit.",
        answer: "Budgeting",
        options: ["Budgeting", "A Fair Wind", "A Feast"]
    },
    {
        title: "The Leaky Barrel",
        question: "Every fortnight a coin slips by,\nIf you don’t check, it makes you cry.\nTiny leaks that drip and flow —\nTrack them all so treasure grows.",
        answer: "Track expenses",
        options: ["Track expenses", "Ignoring the Drip", "Patching the Hull"]
    },
    {
        title: "Siren's Isle",
        question: "A tempting island, glitter and song,\nBuy today and you might be wrong.\nWait a tide, count your dubloons —\nPatient captains avoid quick ruins.",
        answer: "Delay gratification",
        options: ["Delay gratification", "Instant Riches", "Following the Song"]
    },
    {
        title: "The Golden Acorn",
        question: "Plant a seed in well-dug ground,\nWatch the sprout turn coins around.\nRisk and time make wealth expand —\nLet your doubloons work for the land.",
        answer: "Investing",
        options: ["Investing", "Farming", "Burying Coins"]
    },
    {
        title: "The Treasure Map",
        question: "A map with routes and named desires,\nMark the peaks you want to hire.\nSave in steps, a plan in sight —\nReach the isle by guided light.",
        answer: "Goal setting",
        options: ["Goal setting", "Daydreaming", "Sailing Blind"]
    },
    {
        title: "The Phantom Toll",
        question: "One-time loot or repeating toll?\nHidden charges take their stroll.\nCancel ghostly monthly claims —\nKeep your coffers free of chains.",
        answer: "Recurring charges",
        options: ["Recurring charges", "A Single Fee", "Barnacles"]
    },
    {
        title: "Many Small Chests",
        question: "If storms come twice, a wiser plan:\nSplit the spoils across the span.\nSome for now, some for years to be —\nSafety and freedom both agree.",
        answer: "Diversify savings",
        options: ["Diversify savings", "One Giant Hoard", "An Empty Hold"]
    },
    {
        title: "The Crew's Pact",
        question: "When pirates meet, they pool their share,\nA common chest for cross-sea fare.\nFriends unite to reach one quest —\nShared goals put plans to test.",
        answer: "Group goals",
        options: ["Group goals", "A Captain's Secret", "A Mutiny"]
    },
    {
        title: "The Parrot's Whisper",
        question: "A tiny hint before you pay,\nA whisper says “pause, think, and weigh.”\nIf impulse’s loud and reason’s thin,\nAnswer truth — do you really win?",
        answer: "Mindful spending",
        options: ["Mindful spending", "Careless Buying", "A Loud Squawk"]
    },
];
