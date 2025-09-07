import { Screen } from '../types';

interface TutorialText {
    title: string;
    text: string;
}

interface TutorialStep {
    key: string;
    targetId: string;
    screen?: Screen;
    advancesBy: 'next' | 'action';
}

const tutorialTextLibrary: { [key: string]: { [ageGroup: string]: TutorialText } } = {
    // App Onboarding Tutorial
    'app-welcome': {
        gen_alpha: { title: "What's up! 👋", text: "I'm Kai, ur personal guide. I'm about to give you the ultimate tour of this app. Bet." },
        gen_z: { title: "Welcome to LifeLens!", text: "I'm Kai, your personal guide. Think of me as the friendly ghost in the financial machine. Let's get this bread." },
        default: { title: "Welcome to LifeLens!", text: "I'm Kai, your personal guide. Let me show you around your new dashboard for financial and emotional wellness." },
    },
    'app-summary': {
        gen_alpha: { title: "The Deets 📊", text: "This card shows ur 7-day summary of income, expenses, and savings. It's giving... data." },
        gen_z: { title: "Your Financial Vibe Check", text: "This is your 7-day summary. A quick look at where your money's been. No judgment, just facts." },
        default: { title: "Your 7-Day Summary", text: "This card gives you a quick overview of your recent income, expenses, and savings. It's your financial pulse." },
    },
    'app-vault': {
        gen_alpha: { title: "The Vault 🤫", text: "Here you can lock up a goal with a message to ur future self. It's a whole main character moment." },
        gen_z: { title: "The Aevum Vault", text: "This is a time capsule for your goals. Write a message to your future self and open it when you succeed. It's a glow-up thing." },
        default: { title: "The Aevum Vault", text: "This is a special feature where you can seal goals with a message to your future self, unlocking it only when you succeed." },
    },
    'app-log': {
        gen_alpha: { title: "Log Ur Life ✨", text: "This is where the magic happens. Log expenses, income, and moods here. Lowkey, the more you log, the smarter I get." },
        gen_z: { title: "The Logging Hub", text: "The main event. Use these buttons to log expenses, income, and moods. Consistency is key to unlocking the real tea." },
        default: { title: "Log Your Activities", text: "The heart of LifeLens is here. Use these buttons to log expenses, income, and moods. Consistency unlocks powerful insights!" },
    },
    'app-chat': {
        gen_alpha: { title: "Slide into my DMs 💬", text: "Got a question? Need the tea? Tap my icon anytime to chat. I got you." },
        gen_z: { title: "Hit Me Up", text: "Have a question or need advice? Tap my icon anytime for a chat. I'm here to help you navigate the chaos." },
        default: { title: "Chat With Me!", text: "Have a question or need advice? Tap my icon anytime to chat. I'm here to help you on your journey." },
    },
    'app-to-compass': {
        gen_alpha: { title: "To the Compass! 🧭", text: "Aight, next stop: the Inner Compass. It's where you'll find the secret sauce. Tap the Compass icon." },
        gen_z: { title: "Next Up: Inner Compass", text: "Let's check out your Inner Compass. This is where you connect the dots. Tap the Compass icon to continue." },
        default: { title: "Discover Your Compass", text: "Now, let's explore your Inner Compass. This is where the magic happens. Tap the Compass icon to continue." },
    },
     'app-compass-header': {
        gen_alpha: { title: "Map Ur Feels 🧠", text: "This screen helps you see the link between ur feelings and ur spending. It's deep, fr." },
        gen_z: { title: "Map Your Inner World", text: "This screen helps you understand the connection between your feelings and your spending habits. It's the 'why' behind the 'buy'." },
        default: { title: "Map Your Inner World", text: "This screen helps you understand the connection between your feelings and your spending habits." },
    },
    'app-compass-mood': {
        gen_alpha: { title: "Drop a Mood 👇", text: "Start by logging ur mood. Soon you'll see how your vibes affect your wallet. Sheesh." },
        gen_z: { title: "Track Your Mood", text: "Start by logging how you feel. Over time, you'll see how your emotions influence your financial choices. It's self-care." },
        default: { title: "Track Your Mood", text: "Start by logging how you feel. Over time, you'll see how your emotions influence your financial choices." },
    },
    'app-compass-patterns': {
        gen_alpha: { title: "Secret Patterns 🤫", text: "Add more data and I'll spill the tea on your habits right here. It's gonna be iconic." },
        gen_z: { title: "Unlock Secret Patterns", text: "As you add more data, I'll analyze it and reveal interesting patterns about your habits right here. The plot thickens." },
        default: { title: "Unlock Secret Patterns", text: "As you add more data, I'll analyze it and reveal interesting patterns about your habits right here." },
    },
    'app-to-island': {
        gen_alpha: { title: "To the Island! 🏝️", text: "Last stop! Your real-world money moves help you build a whole island. It's a vibe. Tap the Island icon!" },
        gen_z: { title: "Your Financial Legacy", text: "Finally, let's visit your island. Your real-world financial journey powers a game where you build a legacy. Tap the Island icon!" },
        default: { title: "Your Financial Legacy", text: "Finally, let's visit your island. Your real-world financial journey powers a game where you build a legacy. Tap the Island icon!" },
    },
    'app-island-map': {
        gen_alpha: { title: "A New World 🌍", text: "This is your island, but it's all foggy. Complete quests to clear it up. Let's get this started." },
        gen_z: { title: "A World of Possibility", text: "This is your island, shrouded in fog. Completing quests will reveal it piece by piece. Let's focus on your start." },
        default: { title: "A World of Possibility", text: "This is your island, shrouded in fog. Completing quests will reveal it piece by piece. Let's focus on your start." },
    },
    'app-island-welcome': {
        gen_alpha: { title: "Welcome to Ur Island! 🏴‍☠️", text: "Every time you save or hit a goal, you get to build up your paradise. The game tutorial starts now. GLHF!" },
        gen_z: { title: "Welcome to Your Island!", text: "Every saving and goal you achieve helps you build your paradise. A more detailed game tutorial will now begin. Enjoy!" },
        default: { title: "Welcome to Your Island!", text: "Every saving and goal you achieve helps you build your paradise. A more detailed game tutorial will now begin. Enjoy!" },
    },

    // SMS Import Tutorial Texts
    'sms-paste': {
        gen_alpha: { title: "Spill the Tea ☕", text: "Ayo! Drop that SMS receipt here. Let's see the damage. 💀" },
        gen_z: { title: "Decode the receipt", text: "Alright, paste the transaction text here and let's see what we're working with." },
        default: { title: "Paste Your Message", text: "Welcome! To start, please copy and paste your transaction message into this box." },
    },
    'sms-example': {
        gen_alpha: { title: "Try a Demo 🤪", text: "No receipt? No cap. Tap this to see a fake one. It's like a freebie to test the vibes." },
        gen_z: { title: "Use an Example", text: "Don't have a recent transaction text? No stress. Tap here for a demo message to see how it works." },
        default: { title: "Use an Example", text: "If you don't have a message handy, you can tap here to use a sample and see how the analysis works." },
    },
    'sms-analyze': {
        gen_alpha: { title: "Magic Button ✨", text: "Smash this button and my AI brain will do the work. It's kinda goated." },
        gen_z: { title: "Let the AI Cook", text: "Hit 'Analyze' and let the AI break it all down for you. No cap." },
        default: { title: "Analyze the Message", text: "Now, tap here. Kai will instantly read the message and extract the key details for you." },
    },
    'sms-review': {
        gen_alpha: { title: "Vibe Check 👀", text: "Yooo, check it. Is this right? Fix it if my AI brain lagged. 🤖" },
        gen_z: { title: "Review the Details", text: "Here's what the AI found. Give it a vibe check and make any edits if needed." },
        default: { title: "Confirm the Details", text: "Kai has pre-filled the details. Please review and edit them for accuracy." },
    },
    'sms-continue': {
        gen_alpha: { title: "Log the Bread 🍞", text: "Looks good? Hit continue and make it official. We're so back." },
        gen_z: { title: "Continue to Log", text: "If everything looks correct, tap here to move to the final logging screen." },
        default: { title: "Continue to Log", text: "Once you're happy with the details, press continue to add the transaction." },
    },
    'sms-prefill': {
        gen_alpha: { title: "It's All Here! 💅", text: "See? I put all the info in for you. Now you can add your mood and finish up. Slay." },
        gen_z: { title: "Pre-filled for You", text: "I've pre-populated the form with the info from your SMS. Just add your mood and save. Easy." },
        default: { title: "Expense Pre-filled", text: "All the information has been automatically filled in. Now you can add your emotions and save the expense." },
    },
};

const getAgeGroup = (age: number): 'gen_alpha' | 'gen_z' | 'default' => {
    if (age < 18) return 'gen_alpha';
    if (age < 28) return 'gen_z';
    return 'default';
};

const getPersonalizedText = (key: string, age: number): TutorialText => {
    const ageGroup = getAgeGroup(age);
    const textSet = tutorialTextLibrary[key];
    if (!textSet) return { title: 'Error', text: 'Text not found.' };
    return textSet[ageGroup] || textSet['default'];
};


export const appTutorialSteps: TutorialStep[] = [
    { key: 'app-welcome', targetId: 'tutorial-welcome-header', screen: Screen.Home, advancesBy: 'next' },
    { key: 'app-summary', targetId: 'tutorial-summary-card', screen: Screen.Home, advancesBy: 'next' },
    { key: 'app-vault', targetId: 'tutorial-aevum-vault-card', screen: Screen.Home, advancesBy: 'next' },
    { key: 'app-log', targetId: 'tutorial-log-activity-grid', screen: Screen.Home, advancesBy: 'next' },
    { key: 'app-chat', targetId: 'tutorial-ai-chat-button', screen: Screen.Home, advancesBy: 'next' },
    { key: 'app-to-compass', targetId: 'tutorial-nav-compass', screen: Screen.Home, advancesBy: 'action' },
    { key: 'app-compass-header', targetId: 'tutorial-compass-header', screen: Screen.InnerCompass, advancesBy: 'next' },
    { key: 'app-compass-mood', targetId: 'tutorial-mood-tracker', screen: Screen.InnerCompass, advancesBy: 'next' },
    { key: 'app-compass-patterns', targetId: 'tutorial-secret-pattern', screen: Screen.InnerCompass, advancesBy: 'next' },
    { key: 'app-to-island', targetId: 'tutorial-nav-island', screen: Screen.InnerCompass, advancesBy: 'action' },
    { key: 'app-island-map', targetId: 'full-map-view-step', screen: Screen.Game, advancesBy: 'next' },
    { key: 'app-island-welcome', targetId: 'pirates-legacy-header', screen: Screen.Game, advancesBy: 'next' },
];

export const smsImportTutorialSteps: TutorialStep[] = [
    { key: 'sms-paste', targetId: 'tutorial-sms-textarea', screen: Screen.SmsImport, advancesBy: 'next' },
    { key: 'sms-example', targetId: 'tutorial-sms-example-button', screen: Screen.SmsImport, advancesBy: 'action' },
    { key: 'sms-analyze', targetId: 'tutorial-sms-analyze-button', screen: Screen.SmsImport, advancesBy: 'action' },
    { key: 'sms-review', targetId: 'tutorial-sms-results-form', screen: Screen.SmsImport, advancesBy: 'next' },
    { key: 'sms-continue', targetId: 'tutorial-sms-continue-button', screen: Screen.SmsImport, advancesBy: 'action' },
    { key: 'sms-prefill', targetId: 'tutorial-expense-prefill', screen: Screen.AddExpense, advancesBy: 'next' },
];

export const getTutorialStepContent = (
    type: 'app' | 'sms',
    step: number,
    age: number
): TutorialText => {
    const config = type === 'app' ? appTutorialSteps : smsImportTutorialSteps;
    const stepKey = config[step]?.key;
    if (!stepKey) return { title: 'Tutorial Over', text: 'Enjoy the app!' };
    return getPersonalizedText(stepKey, age);
};