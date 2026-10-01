import { useState, useRef, useEffect, useCallback } from 'react';
import {
  floatTo16BitPCM,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  pcm16ToAudioBuffer,
  calculateRMS,
} from '../utils/audioUtils';

export type VoiceStatus = 'disconnected' | 'connecting' | 'connected' | 'listening' | 'speaking' | 'error';
export type CounselorType = 'Aarav' | 'Ananya';

export interface TranscriptItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export function useLiveVoice() {
  const [status, setStatus] = useState<VoiceStatus>('disconnected');
  const [counselor, setCounselor] = useState<CounselorType>('Aarav');
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userVolume, setUserVolume] = useState<number>(0);
  const [counselorVolume, setCounselorVolume] = useState<number>(0);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [activeModelText, setActiveModelText] = useState<string>('');
  const [activeUserText, setActiveUserText] = useState<string>('');

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);

  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const isMutedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const currentModelTextRef = useRef<string>('');
  const currentUserTextRef = useRef<string>('');

  // Keep isMutedRef in sync with state
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Audio visualizer analysis loop
  const startVisualizer = useCallback(() => {
    const updateVolumes = () => {
      // Analyze counselor output
      if (outputAnalyserRef.current) {
        const dataArray = new Uint8Array(outputAnalyserRef.current.frequencyBinCount);
        outputAnalyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length / 255;
        setCounselorVolume(avg);
      }

      // Analyze user input
      if (inputAnalyserRef.current && !isMutedRef.current) {
        const dataArray = new Uint8Array(inputAnalyserRef.current.frequencyBinCount);
        inputAnalyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length / 255;
        setUserVolume(avg);
      } else {
        setUserVolume(0);
      }

      animationFrameRef.current = requestAnimationFrame(updateVolumes);
    };

    updateVolumes();
  }, []);

  const stopAllPlayback = useCallback(() => {
    for (const source of activeSourcesRef.current) {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // Source might already have stopped
      }
    }
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;
  }, []);

  const cleanupAudio = useCallback(() => {
    stopAllPlayback();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setUserVolume(0);
    setCounselorVolume(0);
  }, [stopAllPlayback]);

  // Interrupt counselor playback immediately
  const interrupt = useCallback(() => {
    stopAllPlayback();
    setStatus('listening');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'interrupt' }));
    }
  }, [stopAllPlayback]);

  const endSession = useCallback(() => {
    cleanupAudio();
    setStatus('disconnected');
    // Save any pending transcripts
    if (currentModelTextRef.current) {
      const text = currentModelTextRef.current.trim();
      if (text) {
        setTranscripts((prev) => [
          ...prev,
          { id: Math.random().toString(), role: 'model', text, timestamp: new Date() },
        ]);
      }
      currentModelTextRef.current = '';
      setActiveModelText('');
    }
    if (currentUserTextRef.current) {
      const text = currentUserTextRef.current.trim();
      if (text) {
        setTranscripts((prev) => [
          ...prev,
          { id: Math.random().toString(), role: 'user', text, timestamp: new Date() },
        ]);
      }
      currentUserTextRef.current = '';
      setActiveUserText('');
    }
  }, [cleanupAudio]);

  const startSession = useCallback(
    async (selectedCounselor?: CounselorType) => {
      cleanupAudio();
      setErrorMessage(null);
      setStatus('connecting');

      const counselorToUse = selectedCounselor || counselor;
      if (selectedCounselor) {
        setCounselor(selectedCounselor);
      }

      try {
        // 1. Get microphone access (16kHz preferred)
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;

        // 2. Setup audio contexts
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const inputCtx = new AudioContextClass({ sampleRate: 16000 });
        inputAudioCtxRef.current = inputCtx;
        await inputCtx.resume();

        const outputCtx = new AudioContextClass({ sampleRate: 24000 });
        outputAudioCtxRef.current = outputCtx;
        await outputCtx.resume();

        // Setup output analyser for AI visualizer
        const outAnalyser = outputCtx.createAnalyser();
        outAnalyser.fftSize = 256;
        outAnalyser.smoothingTimeConstant = 0.8;
        outAnalyser.connect(outputCtx.destination);
        outputAnalyserRef.current = outAnalyser;

        // Setup input analyser for User mic visualizer
        const inAnalyser = inputCtx.createAnalyser();
        inAnalyser.fftSize = 256;
        inAnalyser.smoothingTimeConstant = 0.8;
        inputAnalyserRef.current = inAnalyser;

        // 3. Connect WebSocket to server Live endpoint
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/live?counselor=${counselorToUse}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('Connected to Gemini Live bridge');
          setStatus('connected');

          // Hook mic audio streaming
          const source = inputCtx.createMediaStreamSource(stream);
          source.connect(inAnalyser);

          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;
          source.connect(processor);
          processor.connect(inputCtx.destination);

          processor.onaudioprocess = (e) => {
            if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) return;

            const inputData = e.inputBuffer.getChannelData(0);
            const rms = calculateRMS(inputData);

            // Send audio chunk if microphone is active
            if (rms > 0.005) {
              const pcmBuffer = floatTo16BitPCM(inputData);
              const base64 = arrayBufferToBase64(pcmBuffer);
              ws.send(JSON.stringify({ type: 'audio', data: base64 }));
            }
          };

          startVisualizer();
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'ready') {
              setStatus('listening');
            } else if (data.type === 'audio' && data.data) {
              setStatus('speaking');
              const buffer = pcm16ToAudioBuffer(
                outputCtx,
                base64ToArrayBuffer(data.data),
                24000
              );

              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outAnalyser);

              const currentTime = outputCtx.currentTime;
              if (nextStartTimeRef.current < currentTime) {
                nextStartTimeRef.current = currentTime;
              }

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;

              activeSourcesRef.current.push(source);
              source.onended = () => {
                const idx = activeSourcesRef.current.indexOf(source);
                if (idx > -1) {
                  activeSourcesRef.current.splice(idx, 1);
                }
                if (activeSourcesRef.current.length === 0) {
                  setStatus('listening');
                }
              };
            } else if (data.type === 'transcript') {
              if (data.role === 'model') {
                currentModelTextRef.current += (currentModelTextRef.current ? ' ' : '') + data.text;
                setActiveModelText(currentModelTextRef.current);
              } else if (data.role === 'user') {
                currentUserTextRef.current += (currentUserTextRef.current ? ' ' : '') + data.text;
                setActiveUserText(currentUserTextRef.current);
              }
            } else if (data.type === 'interrupted') {
              stopAllPlayback();
              setStatus('listening');
            } else if (data.type === 'turnComplete') {
              // Commit current turn transcripts
              if (currentModelTextRef.current) {
                const text = currentModelTextRef.current.trim();
                if (text) {
                  setTranscripts((prev) => [
                    ...prev,
                    { id: Math.random().toString(), role: 'model', text, timestamp: new Date() },
                  ]);
                }
                currentModelTextRef.current = '';
                setActiveModelText('');
              }
              if (currentUserTextRef.current) {
                const text = currentUserTextRef.current.trim();
                if (text) {
                  setTranscripts((prev) => [
                    ...prev,
                    { id: Math.random().toString(), role: 'user', text, timestamp: new Date() },
                  ]);
                }
                currentUserTextRef.current = '';
                setActiveUserText('');
              }
              setStatus('listening');
            } else if (data.type === 'error') {
              setErrorMessage(data.message || 'Voice session error');
              setStatus('error');
            } else if (data.type === 'closed') {
              setStatus('disconnected');
            }
          } catch (err) {
            console.error('Error handling WebSocket message:', err);
          }
        };

        ws.onerror = (err) => {
          console.error('WebSocket connection error:', err);
          setErrorMessage('Could not connect to Live Voice server. Check network or server status.');
          setStatus('error');
        };

        ws.onclose = () => {
          setStatus('disconnected');
        };
      } catch (err: any) {
        console.error('Failed to start session:', err);
        setErrorMessage(
          err.name === 'NotAllowedError'
            ? 'Microphone permission denied. Please allow microphone access to speak.'
            : err.message || 'Failed to start voice consultation.'
        );
        setStatus('error');
      }
    },
    [cleanupAudio, counselor, startVisualizer, stopAllPlayback]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text', text: text.trim() }));
      setTranscripts((prev) => [
        ...prev,
        { id: Math.random().toString(), role: 'user', text: text.trim(), timestamp: new Date() },
      ]);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return {
    status,
    counselor,
    isMuted,
    errorMessage,
    userVolume,
    counselorVolume,
    transcripts,
    activeModelText,
    activeUserText,
    startSession,
    endSession,
    toggleMute,
    interrupt,
    sendTextMessage,
    setCounselor,
  };
}
