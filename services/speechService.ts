// A service to handle browser's SpeechSynthesis API for voice-overs.

class SpeechService {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private voicesLoaded: Promise<void>;

  constructor() {
    this.synth = window.speechSynthesis;
    this.voicesLoaded = new Promise(resolve => {
        const loadVoices = () => {
            const voices = this.synth.getVoices();
            if (voices.length > 0) {
                // Prefer a male, English voice with a lower pitch for a pirate/genie theme.
                this.voice = voices.find(v => v.name.includes('Google US English') && v.lang.startsWith('en')) || 
                             voices.find(v => v.name.includes('David') && v.lang.startsWith('en')) || 
                             voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Male')) || 
                             voices.find(v => v.lang.startsWith('en')) || 
                             voices[0];
                resolve();
            }
        };

        if (this.synth.getVoices().length > 0) {
            loadVoices();
        } else if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = loadVoices;
        } else {
            // Fallback for browsers that don't fire onvoiceschanged
            setTimeout(() => loadVoices(), 100);
        }
    });
  }
  
  async speak(text: string, userAge?: number): Promise<void> {
    await this.voicesLoaded;
    
    if (!text) {
      return;
    }
    // Cancel any currently speaking utterance before starting a new one
    this.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
        utterance.voice = this.voice;
    }
    
    let rate = 0.9;
    let pitch = 0.8;

    if (userAge) {
      if (userAge < 18) { // Gen Alpha
          rate = 1.1;
          pitch = 1.0;
      } else if (userAge < 28) { // Gen Z
          rate = 1.0;
          pitch = 0.9;
      }
      // Default rate/pitch for Millennial+ is already set
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    this.synth.speak(utterance);
  }

  cancel(): void {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
  }
}

export const speechService = new SpeechService();