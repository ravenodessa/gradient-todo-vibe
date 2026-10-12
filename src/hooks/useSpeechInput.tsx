import { useCallback, useEffect, useRef, useState } from 'react';

type Recognition = any;

export const useSpeechInput = (lang: string, onText: (text: string) => void, onError?: () => void) => {
  const [listening, setListening] = useState(false);
  const recRef = useRef<Recognition | null>(null);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;

  const Ctor = typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : undefined;
  const supported = !!Ctor;

  const stop = useCallback(() => {
    recRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      onTextRef.current(text.trim());
    };
    rec.onerror = (e: any) => {
      if (e.error !== 'aborted' && e.error !== 'no-speech') onError?.();
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      onError?.();
    }
  }, [Ctor, lang, onError]);

  useEffect(() => () => recRef.current?.abort?.(), []);

  return { supported, listening, start, stop };
};
