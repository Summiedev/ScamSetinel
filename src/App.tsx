/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Upload, 
  MessageSquare, 
  Mic, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ArrowRight,
  Loader2,
  RefreshCcw,
  Globe,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeScam, ScamAnalysisResult } from './services/gemini';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route 
} from 'react-router-dom';
import { ScamSentinelWidget } from './components/ScamSentinelWidget';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);
  
  const [messageText, setMessageText] = useState('');
  const [platform, setPlatform] = useState('WhatsApp');
  const [amount, setAmount] = useState('');
  const [relationship, setRelationship] = useState('Stranger');
  const [confirmation, setConfirmation] = useState('No');
  const [country, setCountry] = useState('Nigeria');
  
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setReceiptImage(base64);
      toast.success('Receipt intelligence captured');
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setVoiceNote(base64);
      toast.success('Audio intelligence captured');
    }
  };

  const handleAnalyze = async () => {
    if (!messageText && !receiptImage && !voiceNote) {
      toast.error('Input required for intelligence analysis');
      return;
    }

    setLoading(true);
    try {
      const analysis = await analyzeScam({
        message_text: messageText,
        receipt_image: receiptImage || undefined,
        voice_note: voiceNote || undefined,
        platform,
        amount,
        sender_relationship: relationship,
        confirmation_received: confirmation,
        country
      });
      setResult(analysis);
      toast.success('Intelligence analysis complete');
    } catch (error) {
      toast.error('Analysis engine failure');
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = () => {
    setMessageText("Hello, I am a representative from Zenith Bank. Your account has been flagged for suspicious activity. Please click this link to verify your identity or your account will be blocked in 2 hours: http://zenith-verify-secure.com/login");
    setPlatform("SMS");
    setAmount("N/A");
    setRelationship("Stranger");
    setCountry("Nigeria");
    toast.info("Demo intelligence loaded");
  };

  const resetForm = () => {
    setMessageText('');
    setReceiptImage(null);
    setVoiceNote(null);
    setResult(null);
    setAmount('');
  };

  const getRiskColor = (score: number) => {
    if (score > 70) return '#ff3333';
    if (score > 40) return '#ff9933';
    return '#33ff99';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 p-4 md:p-8 font-sans cyber-grid relative overflow-hidden">
      <div className="scanline" />
      
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-scam-red/10 rounded-xl flex items-center justify-center border border-scam-red/30 glow-red">
            <ShieldAlert className="w-8 h-8 text-scam-red animate-pulse-slow" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              ScamSentinel <span className="text-scam-red">AI</span>
            </h1>
            <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest">Neural Fraud Detection Node v1.0.4</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Button variant="outline" size="sm" onClick={loadDemo} className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900">
            Load Demo
          </Button>
          <Button variant="ghost" size="icon" onClick={resetForm} className="text-zinc-500 hover:text-white hover:bg-zinc-900">
            <RefreshCcw className="w-5 h-5" />
          </Button>
          <div className="h-8 w-[1px] bg-zinc-800 mx-2" />
          <Badge variant="outline" className="px-3 py-1 border-scam-green/30 text-scam-green bg-scam-green/5 font-mono">
            SYSTEM ONLINE
          </Badge>
        </motion.div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 space-y-6"
        >
          <Card className="glass-card border-zinc-800/50 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-scam-red via-scam-orange to-scam-green opacity-50" />
            <CardHeader>
              <CardTitle className="text-xl font-display flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-zinc-500" />
                Intelligence Capture
              </CardTitle>
              <CardDescription className="text-zinc-500">Feed the neural engine with suspicious data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="message" className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Raw Intelligence (Text)
                </Label>
                <Textarea 
                  id="message"
                  placeholder="Paste suspicious message content here..."
                  className="cyber-input min-h-[140px] resize-none text-sm leading-relaxed"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Source Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="cyber-input h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Regional Node</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="cyber-input h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      <SelectItem value="Nigeria">Nigeria</SelectItem>
                      <SelectItem value="Ghana">Ghana</SelectItem>
                      <SelectItem value="Senegal">Senegal</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Financial Stake</Label>
                  <Input 
                    type="text" 
                    placeholder="e.g. 50,000 NGN" 
                    className="cyber-input h-10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Entity Relation</Label>
                  <Select value={relationship} onValueChange={setRelationship}>
                    <SelectTrigger className="cyber-input h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      <SelectItem value="Stranger">Stranger</SelectItem>
                      <SelectItem value="Buyer">Buyer</SelectItem>
                      <SelectItem value="Client">Client</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                  />
                  <Button 
                    variant="outline" 
                    className={`w-full border-dashed border-zinc-800 hover:border-scam-red/50 bg-zinc-950/30 h-24 flex flex-col gap-2 transition-all duration-300 ${receiptImage ? 'border-scam-green/50 bg-scam-green/5' : ''}`}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <div className={`p-2 rounded-lg ${receiptImage ? 'bg-scam-green/20' : 'bg-zinc-900 group-hover:bg-zinc-800'}`}>
                      {receiptImage ? <CheckCircle2 className="w-5 h-5 text-scam-green" /> : <Upload className="w-5 h-5 text-zinc-500" />}
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">{receiptImage ? 'Visual Captured' : 'Visual Intel'}</span>
                  </Button>
                </div>
                <div className="flex-1 group">
                  <input 
                    type="file" 
                    accept="audio/*" 
                    className="hidden" 
                    ref={audioInputRef}
                    onChange={handleAudioUpload}
                  />
                  <Button 
                    variant="outline" 
                    className={`w-full border-dashed border-zinc-800 hover:border-cyber-blue/50 bg-zinc-950/30 h-24 flex flex-col gap-2 transition-all duration-300 ${voiceNote ? 'border-scam-green/50 bg-scam-green/5' : ''}`}
                    onClick={() => audioInputRef.current?.click()}
                  >
                    <div className={`p-2 rounded-lg ${voiceNote ? 'bg-scam-green/20' : 'bg-zinc-900 group-hover:bg-zinc-800'}`}>
                      {voiceNote ? <CheckCircle2 className="w-5 h-5 text-scam-green" /> : <Mic className="w-5 h-5 text-zinc-500" />}
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">{voiceNote ? 'Audio Captured' : 'Audio Intel'}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-zinc-900/20 border-t border-zinc-800/50 p-6">
              <Button 
                className="w-full bg-zinc-100 text-zinc-950 hover:bg-white font-bold py-7 text-lg rounded-xl shadow-xl hover:shadow-white/10 transition-all duration-500 group"
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Processing Neural Analysis...
                  </>
                ) : (
                  <>
                    Run Intelligence Analysis
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="p-4 bg-zinc-900/20 rounded-2xl border border-zinc-800/50 flex gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-zinc-950 flex items-center justify-center border border-zinc-800">
              <Info className="w-5 h-5 text-zinc-500" />
            </div>
            <p className="text-[10px] font-mono text-zinc-500 leading-relaxed uppercase tracking-wider">
              System utilizes multimodal behavioral heuristics for West African fraud detection. Always verify via official banking channels.
            </p>
          </div>
        </motion.div>

        {/* Results Section */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-zinc-800/50 rounded-3xl bg-zinc-900/5"
              >
                <div className="w-24 h-24 bg-zinc-900/50 rounded-3xl flex items-center justify-center mb-8 border border-zinc-800 relative group">
                  <div className="absolute inset-0 bg-scam-red/5 rounded-3xl blur-xl group-hover:bg-scam-red/10 transition-all" />
                  <ShieldCheck className="w-12 h-12 text-zinc-700 relative z-10" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-3">Node Idle</h3>
                <p className="text-zinc-500 max-w-sm font-mono text-xs uppercase tracking-widest">
                  Awaiting intelligence stream for neural processing.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Summary Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="md:col-span-2 glass-card border-zinc-800 overflow-hidden relative group">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${result.scam_classification.is_scam ? 'bg-scam-red glow-red' : 'bg-scam-green glow-green'}`} />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-display font-bold">Analysis Summary</CardTitle>
                        <Badge className={`px-3 py-1 font-mono text-[10px] tracking-widest border-none ${result.scam_classification.is_scam ? 'bg-scam-red/20 text-scam-red' : 'bg-scam-green/20 text-scam-green'}`}>
                          {result.scam_classification.scam_type.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-300 text-sm leading-relaxed font-sans">
                        {result.executive_summary}
                      </p>
                    </CardContent>
                    <CardFooter className="bg-zinc-950/50 py-4 border-t border-zinc-800/50">
                      <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                        <AlertTriangle className={`w-4 h-4 ${result.scam_classification.is_scam ? 'text-scam-red' : 'text-scam-green'}`} />
                        <span className="font-bold text-zinc-300">Protocol:</span> {result.financial_risk_assessment.recommended_next_step}
                      </div>
                    </CardFooter>
                  </Card>

                  <Card className="glass-card border-zinc-800 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2">
                      <div className={`w-2 h-2 rounded-full ${result.scam_classification.is_scam ? 'bg-scam-red animate-pulse' : 'bg-scam-green'}`} />
                    </div>
                    <div className="relative w-36 h-36 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { value: result.scam_classification.confidence_score },
                              { value: 100 - result.scam_classification.confidence_score }
                            ]}
                            innerRadius={50}
                            outerRadius={65}
                            startAngle={90}
                            endAngle={450}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill={getRiskColor(result.scam_classification.confidence_score)} className="glow-red" />
                            <Cell fill="#121212" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-display font-bold" style={{ color: getRiskColor(result.scam_classification.confidence_score) }}>
                          {result.scam_classification.confidence_score}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-tighter text-zinc-500">Risk Index</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono tracking-[0.2em] uppercase ${result.scam_classification.is_scam ? 'text-scam-red' : 'text-scam-green'}`}>
                      {result.scam_classification.is_scam ? 'Threat Detected' : 'Threat Minimal'}
                    </span>
                  </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="behavioral" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-zinc-950/50 border border-zinc-800/50 p-1.5 rounded-2xl">
                    <TabsTrigger value="behavioral" className="rounded-xl data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-mono text-[10px] uppercase tracking-widest">Behavioral</TabsTrigger>
                    <TabsTrigger value="visual" className="rounded-xl data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-mono text-[10px] uppercase tracking-widest">Visual</TabsTrigger>
                    <TabsTrigger value="audio" className="rounded-xl data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-mono text-[10px] uppercase tracking-widest">Audio</TabsTrigger>
                    <TabsTrigger value="risk" className="rounded-xl data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-mono text-[10px] uppercase tracking-widest">Financial</TabsTrigger>
                  </TabsList>

                  <TabsContent value="behavioral" className="mt-6">
                    <Card className="glass-card border-zinc-800/50">
                      <CardContent className="pt-8 space-y-8">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Primary Strategy</h4>
                            <p className="text-2xl font-display font-bold text-zinc-100">{result.behavioral_analysis.primary_manipulation_strategy}</p>
                          </div>
                          <div className="text-right space-y-2">
                            <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Pressure Intensity</h4>
                            <div className="flex items-center gap-3">
                              <Progress value={result.behavioral_analysis.emotional_pressure_score} className="w-32 h-2.5 bg-zinc-900" />
                              <span className="text-sm font-mono font-bold text-scam-orange">{result.behavioral_analysis.emotional_pressure_score}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3 text-scam-orange" /> Tactics Profile
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {result.behavioral_analysis.secondary_tactics_detected.map((t, i) => (
                                <Badge key={i} variant="outline" className="bg-zinc-900/50 border-zinc-800 text-zinc-400 font-mono text-[10px] py-1 px-3">
                                  {t.toUpperCase()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                              <MessageSquare className="w-3 h-3 text-zinc-500" /> Linguistic Markers
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {result.behavioral_analysis.pressure_words_detected.map((w, i) => (
                                <span key={i} className="text-[10px] font-mono bg-scam-red/5 text-scam-red/80 px-2 py-1 rounded-lg border border-scam-red/10">
                                  {w.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="visual" className="mt-6">
                    <Card className="glass-card border-zinc-800/50">
                      <CardContent className="pt-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Authenticity Index</h4>
                              <div className="flex items-center gap-4">
                                <Progress value={result.visual_receipt_analysis.authenticity_score} className="flex-1 h-3 bg-zinc-900" />
                                <span className="text-lg font-mono font-bold">{result.visual_receipt_analysis.authenticity_score}%</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Forgery Risk Level</h4>
                              <div className={`text-3xl font-display font-bold ${result.visual_receipt_analysis.forgery_risk_level === 'Critical' ? 'text-scam-red' : 'text-scam-orange'}`}>
                                {result.visual_receipt_analysis.forgery_risk_level.toUpperCase()}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Anomaly Detection</h4>
                            <div className="space-y-3">
                              <AnomalyItem label="Font Inconsistency" detected={result.visual_receipt_analysis.font_inconsistencies_detected} />
                              <AnomalyItem label="Alignment Irregularity" detected={result.visual_receipt_analysis.alignment_irregularities_detected} />
                              <AnomalyItem label="Editing Artifacts" detected={result.visual_receipt_analysis.editing_artifact_probability > 30} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="audio" className="mt-6">
                    <Card className="glass-card border-zinc-800/50">
                      <CardContent className="pt-12 pb-12 flex justify-around items-center">
                        <AudioMetric label="Synthetic Prob." value={result.audio_analysis.deepfake_probability} />
                        <div className="h-20 w-[1px] bg-zinc-800" />
                        <AudioMetric label="Vocal Stress" value={result.audio_analysis.voice_emotional_pressure_score} />
                        <div className="h-20 w-[1px] bg-zinc-800" />
                        <div className="flex flex-col items-center gap-3">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 ${result.audio_analysis.urgency_detected ? 'bg-scam-red/10 border-scam-red/30 text-scam-red glow-red' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                            <AlertTriangle className="w-8 h-8" />
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Urgency Node</span>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="risk" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="glass-card border-zinc-800/50 p-6 space-y-4">
                        <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Financial Exposure</h4>
                        <div className="flex items-end justify-between">
                          <span className="text-4xl font-display font-bold">{result.financial_risk_assessment.transaction_amount}</span>
                          <Badge className="bg-scam-red/20 text-scam-red border-none font-mono uppercase tracking-widest text-[10px]">
                            {result.financial_risk_assessment.exposure_risk_level}
                          </Badge>
                        </div>
                      </Card>
                      <Card className="glass-card border-zinc-800/50 p-6 space-y-4">
                        <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Vulnerability Profile</h4>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-zinc-200">{result.vulnerability_target_analysis.likely_target_group}</p>
                          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">{result.vulnerability_target_analysis.probable_loss_type}</p>
                        </div>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 pt-10 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-600 text-[10px] font-mono uppercase tracking-[0.2em] relative z-20">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-scam-green" /> Node Active</span>
          <Separator orientation="vertical" className="h-4 bg-zinc-800" />
          <span className="flex items-center gap-2"><Globe className="w-3 h-3" /> West Africa Regional Node</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#" className="hover:text-zinc-400 transition-colors">Neural Protocol</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">API Endpoint</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Security Audit</a>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" theme="dark" />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/widget" element={<div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4"><ScamSentinelWidget /></div>} />
      </Routes>
    </Router>
  );
}

function AnomalyItem({ label, detected }: { label: string, detected: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-400">{label}</span>
      {detected ? <Badge variant="destructive" className="text-[10px] h-5 px-1.5">DETECTED</Badge> : <Badge variant="outline" className="text-zinc-600 text-[10px] h-5 px-1.5">CLEAR</Badge>}
    </div>
  );
}

function AudioMetric({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={[{ value }, { value: 100 - value }]} innerRadius={24} outerRadius={32} startAngle={90} endAngle={450} dataKey="value">
              <Cell fill={value > 50 ? '#ef4444' : '#22c55e'} /><Cell fill="#18181b" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center"><span className="text-xs font-mono font-bold">{value}%</span></div>
      </div>
      <span className="text-[10px] uppercase text-zinc-500 tracking-tighter">{label}</span>
    </div>
  );
}
