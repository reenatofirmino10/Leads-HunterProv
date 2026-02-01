import React, { useState, useEffect, useRef, useCallback } from 'react';
import { interpretVoiceCommand } from '../services/geminiService';
import { VoiceCommandResult } from '../types';
import Spinner from './Spinner';
import { Mic, X, AlertTriangle, CheckCircle } from 'lucide-react';

interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommandParsed: (result: VoiceCommandResult) => void;
}

// FIX: Define a minimal interface for the SpeechRecognition instance to provide type safety.
interface SpeechRecognitionInstance {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

type Status = 'idle' | 'listening' | 'processing' | 'confirming' | 'error';

// Check for browser support
// FIX: Cast window to `any` to access non-standard properties and rename variable to avoid type/value collision.
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognitionAPI;

const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({ isOpen, onClose, onCommandParsed }) => {
  const [status, setStatus] = useState<Status>('idle');
  const [transcript, setTranscript] = useState('');
  const [interpretedCommand, setInterpretedCommand] = useState<VoiceCommandResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // FIX: Use the custom interface for the ref type.
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const startListening = useCallback(() => {
    if (!isSpeechRecognitionSupported || !recognitionRef.current) {
        setErrorMessage('Reconhecimento de voz não é suportado neste navegador.');
        setStatus('error');
        return;
    }

    setStatus('listening');
    setTranscript('');
    setInterpretedCommand(null);
    setErrorMessage('');
    recognitionRef.current.start();
  }, []);

  useEffect(() => {
    if (!isSpeechRecognitionSupported) return;

    // FIX: Use the renamed API constant and explicitly type the instance.
    const recognition: SpeechRecognitionInstance = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setTranscript(speechToText);
      setStatus('processing');
    };
    
    recognition.onerror = (event) => {
      setErrorMessage(`Erro no reconhecimento de voz: ${event.error}`);
      setStatus('error');
    };

    recognition.onend = () => {
      // FIX: Use functional update to avoid stale state in closure.
      setStatus(prevStatus => {
        if (prevStatus === 'listening') {
          return 'idle'; // Ended without capturing anything
        }
        return prevStatus;
      });
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      recognition.stop();
    };
  // FIX: Run this effect only once on mount to avoid re-creating the recognition instance on status changes.
  }, []);


  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      recognitionRef.current?.stop();
      setStatus('idle');
    }
  }, [isOpen, startListening]);

  useEffect(() => {
    if (status === 'processing' && transcript) {
      interpretVoiceCommand(transcript)
        .then(result => {
          setInterpretedCommand(result);
          setStatus('confirming');
        })
        .catch(err => {
          setErrorMessage(err.message || 'Não consegui identificar claramente seu comando.');
          setStatus('error');
        });
    }
  }, [status, transcript]);
  
  useEffect(() => {
    if (status === 'confirming' && interpretedCommand) {
      const timer = setTimeout(() => {
        onCommandParsed(interpretedCommand);
      }, 2500); // Wait a bit for user to see the confirmation
      return () => clearTimeout(timer);
    }
  }, [status, interpretedCommand, onCommandParsed]);

  if (!isOpen) return null;

  const renderContent = () => {
    switch (status) {
      case 'listening':
        return (
          <div className="text-center">
            <Mic size={48} className="mx-auto text-[#2563EB] animate-pulse mb-4" />
            <h3 className="text-2xl font-bold text-[#111827]">Ouvindo...</h3>
            <p className="text-[#6B7280] mt-2">Fale o que você deseja prospectar.</p>
          </div>
        );
      case 'processing':
        return (
            <>
                <Spinner />
                <p className="text-center text-[#6B7280] mt-4 italic">Você disse: "{transcript}"</p>
            </>
        );
      case 'confirming':
        return (
            <div className="text-center">
                <CheckCircle size={48} className="mx-auto text-[#16A34A] mb-4" />
                <h3 className="text-2xl font-bold text-[#111827]">Comando Interpretado!</h3>
                <p className="text-[#6B7280] mt-2 italic">Você disse: "{transcript}"</p>
                <div className="mt-4 text-left bg-[#F3F4F6] p-4 rounded-lg space-y-2 border border-[#E5E7EB]">
                    <p><span className="font-semibold text-[#6B7280]">Tipo:</span> {interpretedCommand?.prospectType}</p>
                    <p><span className="font-semibold text-[#6B7280]">Segmento:</span> {interpretedCommand?.segment}</p>
                    <p><span className="font-semibold text-[#6B7280]">Cidade:</span> {interpretedCommand?.city}</p>
                    <p><span className="font-semibold text-[#6B7280]">Estado:</span> {interpretedCommand?.state}</p>
                </div>
                <p className="text-[#6B7280] mt-4 animate-pulse">Iniciando prospecção...</p>
            </div>
        );
      case 'error':
        return (
            <div className="text-center">
                <AlertTriangle size={48} className="mx-auto text-[#DC2626] mb-4" />
                <h3 className="text-2xl font-bold text-[#111827]">Ops! Algo deu errado.</h3>
                <p className="text-[#DC2626] mt-2">{errorMessage}</p>
                <p className="text-[#6B7280] mt-4 text-sm">Tente dizer, por exemplo: <br/><i className="font-mono">"Prospectar indústrias alimentícias em Sorocaba, São Paulo."</i></p>
                <button
                    onClick={startListening}
                    className="mt-6 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold py-2 px-6 rounded-md transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        );
      case 'idle':
      default:
        return (
            <div className="text-center">
                <Mic size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold">Pronto para ouvir</h3>
                <p className="text-[#6B7280] mt-2">Clique no botão abaixo para começar.</p>
                 <button
                    onClick={startListening}
                    className="mt-6 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold py-2 px-6 rounded-md transition-colors"
                >
                    Iniciar Gravação
                </button>
            </div>
        );
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white text-[#111827] rounded-xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 flex justify-between items-center border-b border-[#E5E7EB]">
            <h2 className="text-xl font-bold">Comando de Voz</h2>
            <button onClick={onClose} className="text-[#6B7280] hover:text-[#111827] transition-colors"><X size={24} /></button>
        </div>
        <div className="p-8 min-h-[300px] flex flex-col items-center justify-center">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default VoiceCommandModal;