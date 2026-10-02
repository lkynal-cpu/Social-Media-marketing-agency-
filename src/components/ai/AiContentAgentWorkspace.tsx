// OmniAgency OS - AI Content Agent Interactive Workspace
// Available exclusively to CONTENT_MANAGER role

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AiAgentClient } from '../../lib/aiAgentClient';
import { dbService } from '../../lib/database';
import { SocialPlatformId } from '../../types/database';
import {
  Sparkles,
  Bot,
  Hash,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Eye,
  SlidersHorizontal,
  PlusCircle,
  Wand2,
  BookOpen,
  Cpu,
  X,
} from 'lucide-react';

interface AiContentAgentWorkspaceProps {
  onPostCreated?: () => void;
  onNavigateToApprovalQueue?: () => void;
}

export const AiContentAgentWorkspace: React.FC<AiContentAgentWorkspaceProps> = ({
  onPostCreated,
  onNavigateToApprovalQueue,
}) => {
  const { currentUser, activeClient, securityContext, triggerRefresh } = useAuth();

  const [selectedTool, setSelectedTool] = useState<string>('generate_content_ideas');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemma-4-26b-a4b-it'>('gemma-4-26b-a4b-it');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [targetPlatform, setTargetPlatform] = useState<SocialPlatformId>('instagram');
  const [loading, setLoading] = useState<boolean>(false);
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [toolExecutionData, setToolExecutionData] = useState<any>(null);
  const [groundingSources, setGroundingSources] = useState<{ title?: string; uri?: string }[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [draftSuccessNotice, setDraftSuccessNotice] = useState<string | null>(null);

  // If user is not CONTENT_MANAGER, render permission block
  if (currentUser.role !== 'CONTENT_MANAGER') {
    return (
      <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
          Restricted AI Agent Workspace
        </h3>
        <p className="text-sm text-neutral-500 mb-6">
          The AI Content Agent is reserved exclusively for users with the{' '}
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">CONTENT_MANAGER</span> role.
        </p>
        <div className="text-xs text-neutral-400">
          Current Active Role: <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-purple-600 font-mono">{currentUser.role}</code>
        </div>
      </div>
    );
  }

  if (!activeClient) {
    return (
      <div className="p-8 text-center text-neutral-500">
        Please select an assigned client in the top bar to invoke the AI Content Agent.
      </div>
    );
  }

  const agentTools = [
    {
      id: 'generate_content_ideas',
      name: 'Content Ideas',
      icon: <Lightbulb className="w-4 h-4 text-amber-500" />,
      desc: 'Formulate high-hook concepts based on brand voice',
      defaultPrompt: `Generate 3 high-impact content themes for ${activeClient.name} addressing ${activeClient.target_audience}`,
    },
    {
      id: 'generate_caption',
      name: 'Caption Generator',
      icon: <FileText className="w-4 h-4 text-indigo-500" />,
      desc: 'Craft persuasive captions tailored to brand voice',
      defaultPrompt: `Write an engaging caption about our signature product for ${targetPlatform}`,
    },
    {
      id: 'generate_hashtags',
      name: 'Hashtag Clusters',
      icon: <Hash className="w-4 h-4 text-emerald-500" />,
      desc: 'Curate high-volume, niche & branded hashtags',
      defaultPrompt: `Generate targeted hashtag clusters for ${activeClient.industry}`,
    },
    {
      id: 'generate_content_calendar',
      name: '7-Day Calendar',
      icon: <Calendar className="w-4 h-4 text-blue-500" />,
      desc: 'Schedule weekly thematic content arcs',
      defaultPrompt: `Create a 7-day content calendar focusing on brand trust and customer transformation`,
    },
    {
      id: 'generate_campaign_ideas',
      name: 'Campaign Strategy',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      desc: 'Brainstorm multi-week launch concepts',
      defaultPrompt: `Design a seasonal promotion campaign for ${activeClient.name}`,
    },
    {
      id: 'generate_image_prompt',
      name: 'Visual Art Direction',
      icon: <Wand2 className="w-4 h-4 text-rose-500" />,
      desc: 'Generate studio photography & graphic prompts',
      defaultPrompt: `Generate visual creative direction for a clean, editorial product photoshoot`,
    },
  ];

  const handleRunAgent = async (overridePrompt?: string) => {
    setLoading(true);
    setDraftSuccessNotice(null);

    const promptToUse = overridePrompt || customPrompt || agentTools.find((t) => t.id === selectedTool)?.defaultPrompt || '';

    try {
      const result = await AiAgentClient.execute({
        toolName: selectedTool,
        toolArguments: {
          platform: targetPlatform,
          client: activeClient.name,
        },
        userPrompt: promptToUse,
        client: activeClient,
        user: currentUser,
        selectedModel: selectedModel,
      });

      setResponseOutput(result.text);
      setToolExecutionData(result.toolResult);
      setGroundingSources(result.groundingSources || []);
      setSearchQueries(result.searchQueries || []);
    } catch (err: any) {
      setResponseOutput(`Agent Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertOutputToDraft = async () => {
    if (!responseOutput) return;

    try {
      // Create post with status 'DRAFT'
      const newPost = await dbService.createSocialPost(securityContext, {
        client_id: activeClient.id,
        platform_id: targetPlatform,
        caption: responseOutput.substring(0, 500),
        hashtags: ['#OmniAgency', '#ContentStudio', `#${activeClient.name.replace(/\s+/g, '')}`],
        media_type: 'image',
        status: 'DRAFT',
        ai_generated: true,
      });

      setDraftSuccessNotice(`Post created as DRAFT (#${newPost.id.substring(0, 8)}) and queued for review!`);
      triggerRefresh();
      if (onPostCreated) onPostCreated();
    } catch (err: any) {
      alert(`Could not create draft: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Brand Context Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-neutral-900 border border-indigo-500/20 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">AI Content Strategy Agent</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  Tool-Assisted
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">
                Active Client Context: <span className="font-semibold text-white">{activeClient.name}</span> ({activeClient.industry})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300">
              <span className="text-neutral-400 block text-[10px] uppercase font-bold">Brand Voice</span>
              <span className="font-medium text-white truncate max-w-[200px] block">
                {activeClient.brand_voice}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300">
              <span className="text-neutral-400 block text-[10px] uppercase font-bold">Audience</span>
              <span className="font-medium text-white truncate max-w-[200px] block">
                {activeClient.target_audience}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tool Selection & Prompt Configuration */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-xs">
            {/* Model Selector & Guide Trigger */}
            <div className="mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 mb-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Agent Foundation Model:</span>
                </label>
                <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSelectedModel('gemini-3.8-flash')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      selectedModel === 'gemini-3.8-flash'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-bold'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                    }`}
                  >
                    Gemini 3.8 Flash
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedModel('gemma-4-26b-a4b-it')}
                    className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                      selectedModel === 'gemma-4-26b-a4b-it'
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                    }`}
                  >
                    <span>Gemma 4 (26B)</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-900/60 text-indigo-200 font-mono">Agent</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1.5"
                title="View step-by-step Agent & Gemma 4 integration guide"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Integration Guide</span>
              </button>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Agent Capabilities / Tools</span>
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {agentTools.map((tool) => {
                const isSelected = selectedTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setSelectedTool(tool.id);
                      setCustomPrompt(tool.defaultPrompt);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-2xs'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {tool.icon}
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {tool.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 line-clamp-2">{tool.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Target Platform Selector */}
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                Target Social Platform:
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(['instagram', 'tiktok', 'facebook', 'linkedin', 'twitter_x', 'youtube'] as SocialPlatformId[]).map(
                  (platform) => (
                    <button
                      key={platform}
                      onClick={() => setTargetPlatform(platform)}
                      className={`px-2 py-1.5 rounded-lg border font-medium capitalize transition-colors ${
                        targetPlatform === platform
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {platform.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Prompt input */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                Instructions / Topic Override:
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe desired campaign angle or specific product focus..."
                rows={4}
                className="w-full text-xs p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Action button */}
            <button
              onClick={() => handleRunAgent()}
              disabled={loading}
              className="mt-3 w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Agent Reasoning & Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute AI Content Tool</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Agent Output & Human-in-the-Loop Pipeline */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-xs min-h-[420px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                    Agent Generation Output
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {selectedModel.startsWith('gemma') ? 'Gemma 4 (26B IT)' : 'Gemini 3.8 Flash'}
                  </span>
                </div>
                {responseOutput && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    Target: {targetPlatform}
                  </span>
                )}
              </div>

              {responseOutput ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-xs font-sans text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line">
                    {responseOutput}
                  </div>

                  {/* Grounding & Verification Metadata */}
                  {(searchQueries.length > 0 || groundingSources.length > 0) && (
                    <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 text-xs space-y-2">
                      <div className="text-[11px] font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Google Search Grounding & Real-Time Sources Consulted</span>
                      </div>
                      {searchQueries.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-400">
                          <span className="font-semibold">Search Queries:</span>
                          {searchQueries.map((q, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
                              "{q}"
                            </span>
                          ))}
                        </div>
                      )}
                      {groundingSources.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="font-semibold text-neutral-600 dark:text-neutral-400 block text-[11px]">Citations:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {groundingSources.map((s, i) => (
                              <a
                                key={i}
                                href={s.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-indigo-600 dark:text-indigo-400 hover:underline text-[10px]"
                              >
                                <span>{s.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {toolExecutionData && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40">
                      <div className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Structured Tool Payload Ready</span>
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                        Content synthesized according to {activeClient.name} brand voice guidelines.
                      </div>
                    </div>
                  )}

                  {draftSuccessNotice && (
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{draftSuccessNotice}</span>
                      </div>
                      {onNavigateToApprovalQueue && (
                        <button
                          onClick={onNavigateToApprovalQueue}
                          className="font-bold underline ml-2 hover:opacity-80"
                        >
                          View Queue
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-16 text-center text-neutral-400 text-xs space-y-2">
                  <Sparkles className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto" />
                  <p className="font-semibold text-neutral-600 dark:text-neutral-300">
                    Select a tool and click "Execute AI Content Tool"
                  </p>
                  <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
                    The agent will generate copy, hashtags, or full calendar arcs with full awareness of{' '}
                    {activeClient.name}'s voice and target demographic.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Workflow Action Bar */}
            {responseOutput && (
              <div className="pt-4 mt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Next Step in Workflow: Human Content Manager Review</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunAgent(`Regenerate with an alternative creative hook and different angle`)}
                    className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-200 transition-colors"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={handleConvertOutputToDraft}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Push to Approval Queue (Draft)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guide Modal: How to Integrate an Agent & Gemma 4 */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-3xl w-full max-h-[85vh] border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Agent Architecture & Gemma 4 Integration Guide
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Step-by-step developer tutorial for agents, tool declarations, and open-weights Gemma models
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {/* Part 1 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>How the Agent Architecture Works in OmniAgency OS</span>
                </div>
                <p>
                  An AI Agent differs from a standard text generator because it has access to structured <strong>tools (function declarations)</strong>, system instructions, and runtime parameters. In this project:
                </p>
                <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 font-mono text-[11px] space-y-1">
                  <div>1. Client requests action → <code className="text-indigo-500">POST /api/ai/agent</code></div>
                  <div>2. Server verifies role === <code className="text-emerald-500">'CONTENT_MANAGER'</code> (strict RBAC)</div>
                  <div>3. Injects tenant context: Brand Voice, Industry, Products, Audience</div>
                  <div>4. Gemini or Gemma executes tool logic (generate_caption, generate_content_calendar, etc.)</div>
                  <div>5. Output returns as <code className="text-amber-500">DRAFT</code> awaiting Content Manager human review</div>
                </div>
              </div>

              {/* Part 2 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>How Gemma 4 is Configured & Integrated</span>
                </div>
                <p>
                  Gemma 4 is Google's open-weights model designed for high-efficiency on-device or containerized inference. In this project, Gemma 4 is supported alongside Gemini 3.8 Flash via a unified backend pipeline:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-neutral-600 dark:text-neutral-400">
                  <li><strong>Local / Embedded Engine:</strong> Immediate zero-config execution fine-tuned for marketing copy hooks.</li>
                  <li><strong>External Endpoint (vLLM, Ollama, HuggingFace TGI, or Vertex AI):</strong> Configure <code className="font-mono text-indigo-400">GEMMA_API_URL</code> in your environment (e.g. <code className="font-mono">http://localhost:11434</code> or Cloud Run) to stream responses from custom-hosted Gemma 4 models.</li>
                </ul>
              </div>

              {/* Part 3 Code Sample */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Server-Side Model Switching Implementation (<code className="font-mono text-xs">server.ts</code>)</span>
                </div>
                <pre className="p-3.5 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-neutral-800">
{`if (selectedModel === 'gemma-4') {
  // Option A: Call self-hosted Gemma 4 endpoint
  if (process.env.GEMMA_API_URL) {
    const res = await fetch(\`\${process.env.GEMMA_API_URL}/v1/chat/completions\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gemma-4', messages: [...] })
    });
    return res.json(...);
  }
  // Option B: Run embedded Gemma 4 instruction engine
  return generateGemma4Output(toolName, clientContext, userPrompt);
} else {
  // Gemini 3.8 Flash with @google/genai function calling
  const response = await aiClient.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: promptText,
    config: { tools: agentTools }
  });
}`}
                </pre>
              </div>

              {/* Part 4 Workflow Safety */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs">
                <div className="font-bold mb-1">Human-in-the-Loop Safety Rule:</div>
                <p>
                  Regardless of whether Gemini 3.8 Flash or Gemma 4 is used, content is never published directly to social platforms. Every AI output must be approved and scheduled by the human Content Manager.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex justify-end">
              <button
                onClick={() => setIsGuideOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
