import React, { useState, useRef } from 'react';
import { 
  ShieldAlert, 
  Upload, 
  MessageSquare, 
  Mic, 
  Loader2,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeScam, ScamAnalysisResult } from '../services/gemini';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const ScamSentinelWidget: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);
  const [messageText, setMessageText] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!messageText && !receiptImage) {
      toast.error('Intelligence input required');
      return;
    }
    setLoading(true);
    try {
      const analysis = await analyzeScam({
        message_text: messageText,
        receipt_image: receiptImage || undefined,
        platform: 'Widget',
        sender_relationship: 'Stranger',
        confirmation_received: 'No',
        country: 'Nigeria'
      });
      setResult(analysis);
    } catch (error) {
      toast.error('Neural engine failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-scam-red to-scam-orange rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
      <Card className="glass-card border-zinc-800/50 overflow-hidden relative z-10">
        <CardHeader className="bg-zinc-900/30 border-b border-zinc-800/50 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-scam-red" />
              <CardTitle className="text-sm font-display font-bold tracking-tight">ScamSentinel <span className="text-scam-red">AI</span></CardTitle>
            </div>
            <Badge variant="outline" className="text-[8px] font-mono border-zinc-800 text-zinc-500">NODE_ACTIVE</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {!result ? (
            <>
              <Textarea 
                placeholder="Paste suspicious text..."
                className="cyber-input text-xs min-h-[100px] leading-relaxed"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <div className="flex gap-3">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={imageInputRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setReceiptImage(await fileToBase64(file));
                      toast.success('Visual intel captured');
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`flex-1 text-[10px] font-mono border-zinc-800 h-10 transition-all ${receiptImage ? 'border-scam-green/50 text-scam-green bg-scam-green/5' : 'text-zinc-400'}`}
                  onClick={() => imageInputRef.current?.click()}
                >
                  {receiptImage ? <CheckCircle2 className="w-3 h-3 mr-2" /> : <Upload className="w-3 h-3 mr-2" />}
                  {receiptImage ? 'VISUAL_READY' : 'ADD_VISUAL'}
                </Button>
                <Button 
                  className="flex-1 text-[10px] font-mono bg-zinc-100 text-zinc-950 hover:bg-white h-10 shadow-lg"
                  onClick={handleAnalyze}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'RUN_ANALYSIS'}
                </Button>
              </div>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3">
                <Badge className={`font-mono text-[9px] border-none ${result.scam_classification.is_scam ? 'bg-scam-red/20 text-scam-red' : 'bg-scam-green/20 text-scam-green'}`}>
                  {result.scam_classification.scam_type.toUpperCase()}
                </Badge>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-mono text-zinc-500">RISK_INDEX</span>
                  <span className={`text-sm font-bold ${result.scam_classification.is_scam ? 'text-scam-red' : 'text-scam-green'}`}>{result.scam_classification.confidence_score}%</span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed italic font-sans">
                "{result.executive_summary.substring(0, 150)}..."
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-[9px] font-mono text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                onClick={() => setResult(null)}
              >
                [ RESET_NODE ]
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
