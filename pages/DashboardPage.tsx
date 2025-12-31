
import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import BrutalCard from '../components/BrutalCard';
import BrutalButton from '../components/BrutalButton';
import { supabase } from '../services/supabase';
import { DashboardView, RequestEntry } from '../types';
// import { getDashboardInsights } from '../services/geminiService';

interface DashboardPageProps {
  user: string;
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  onLogout: () => void;
}

const DASHBOARD_DATA = [
  { name: 'SEG', value: 240, color: '#CA8A04' },
  { name: 'TER', value: 410, color: '#D1D5DB' },
  { name: 'QUA', value: 320, color: '#D35436' },
  { name: 'QUI', value: 355, color: '#22D3EE' },
  { name: 'SEX', value: 890, color: '#FFD700' },
  { name: 'SÁB', value: 670, color: '#D35436' },
  { name: 'DOM', value: 500, color: '#D1D5DB' },
];

const RECENT_TASKS = [
  { id: 1, title: 'Revisar PR de código #2021', time: 'AGORA', isNew: true },
  { id: 2, title: 'Atualizar configs do servidor', time: '2m' },
  { id: 3, title: 'Sincronizar logs do banco', time: '1h' },
  { id: 4, title: 'Implantação em staging', time: '4h' },
];

const DashboardPage: React.FC<DashboardPageProps> = ({ user, activeView, onViewChange, onLogout }) => {
  const [aiInsight, setAiInsight] = useState('SISTEMA OPERACIONAL: MONITORAMENTO ATIVO');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [requestsList, setRequestsList] = useState<RequestEntry[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('JOECIMENDES');
  const [role, setRole] = useState<string>('Supervisor de Operações IA');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [logs, setLogs] = useState<{ id: string; created_at: string; description: string; status: string }[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const logEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFullName(data.full_name || user.email?.split('@')[0].toUpperCase() || 'USUÁRIO');
        setRole(data.role || 'Supervisor de Operações IA');
        setAvatarUrl(data.avatar_url || null);
      }
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (data) setLogs(data);
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
    }
  };

  const handleUpdateProfile = async () => {
    setLoadingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          role: role,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setIsEditing(false);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      alert('Erro ao atualizar perfil.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setAvatarUrl(base64);

        // Persistir a URL (base64 para simplicidade neste MVP, ideal seria Storage)
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('profiles').upsert({
              id: user.id,
              avatar_url: base64,
              updated_at: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('Erro ao salvar avatar:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchInsight = async () => {
    // Gemini removed
    setAiInsight('STATUS DO SISTEMA: ESTÁVEL | NÚCLEOS OPERACIONAIS');
  };

  const generateMockRequest = (typeOverride?: string) => {
    const methods = ["GET", "POST", "PUT", "DELETE"];
    const types = ["COMPRA", "EQUIPAMENTO", "INERTES", "CONTENTORES", "UNIDADE DE VIDA"];
    const endpoints = ["/api/v1/user", "/auth/login", "/storage/sync", "/system/config", "/metrics/collect"];
    const statuses = [200, 201, 403, 404, 500];
    const fulfillmentOptions: ('PENDENTE' | 'CONCLUIDA' | 'CANCELADA')[] = ['PENDENTE', 'CONCLUIDA', 'CANCELADA'];

    // Generate a random date in the future
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 7));

    const newRequest: RequestEntry = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      method: methods[Math.floor(Math.random() * methods.length)],
      type: typeOverride || types[Math.floor(Math.random() * types.length)],
      endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      timestamp: new Date().toLocaleTimeString(),
      latency: `${Math.floor(Math.random() * 500) + 10}ms`,
      expectedDate: futureDate.toLocaleDateString(),
      attendedOnTime: Math.random() > 0.3,
      fulfillmentStatus: fulfillmentOptions[Math.floor(Math.random() * fulfillmentOptions.length)]
    };

    setRequestsList(prev => [newRequest, ...prev].slice(0, 50));
    if (typeOverride) setIsCreateModalOpen(false);
  };

  useEffect(() => {
    fetchInsight();
    fetchProfile();
    fetchLogs();
    for (let i = 0; i < 15; i++) generateMockRequest();
  }, []);

  const renderOverview = () => (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 animate-in fade-in duration-500">
      <BrutalCard
        variant="dark"
        title="Visão Geral"
        subtitle="Estatísticas de processos para o período atual."
        className="md:col-span-8 min-h-[400px]"
      >
        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DASHBOARD_DATA}>
              <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#2a2a2a' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #fff', color: '#fff' }} />
              <Bar dataKey="value" stroke="#fff" strokeWidth={2}>
                {DASHBOARD_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </BrutalCard>

      <div className="md:col-span-4 bg-accent-cyan dark:bg-cyan-700 text-brutal-black dark:text-white border-4 border-black dark:border-white shadow-brutal flex flex-col">
        <div className="p-4 border-b-4 border-black dark:border-white bg-white/20">
          <h2 className="text-2xl font-bold uppercase">Tarefas Recentes</h2>
        </div>
        <ul className="flex-1 divide-y-2 divide-black dark:divide-white font-mono text-sm">
          {RECENT_TASKS.map(task => (
            <li key={task.id} className="p-4 flex justify-between items-center hover:bg-white/30 cursor-pointer transition-colors group">
              <span className="truncate pr-2 group-hover:translate-x-1 transition-transform">{task.title}</span>
              <span className={`font-bold px-2 py-0.5 border border-black ${task.isNew ? 'bg-white dark:bg-black text-black dark:text-white' : 'opacity-70'}`}>
                {task.time}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <BrutalCard
        variant="orange"
        title="Fluxo de Dados"
        footer="Estatísticas de pico"
        className="md:col-span-4"
      >
        <div className="flex items-end gap-1 h-32 mb-2 mt-4">
          {[20, 40, 30, 60, 45, 80, 50, 70, 35, 55, 60, 25].map((h, i) => (
            <div key={i} className="flex-1 bg-black dark:bg-white border-x border-transparent hover:bg-primary transition-colors cursor-pointer" style={{ height: `${h}%` }}></div>
          ))}
        </div>
      </BrutalCard>

      <BrutalCard
        variant="grey"
        title="Capacidade"
        footer="Métricas de desempenho global"
        className="md:col-span-4"
      >
        <div className="flex items-end justify-between mt-4">
          <div className="text-6xl font-bold tracking-tighter">30%</div>
          <div className="flex gap-1 h-16 items-end">
            <div className="w-5 bg-accent-mustard h-[40%] border-2 border-black"></div>
            <div className="w-5 bg-accent-cyan h-[70%] border-2 border-black"></div>
            <div className="w-5 bg-retro-red h-[90%] border-2 border-black"></div>
          </div>
        </div>
      </BrutalCard>

      <BrutalCard
        variant="mustard"
        title="Transferência"
        className="md:col-span-4"
      >
        <div className="flex justify-between items-start">
          <div className="text-6xl font-bold tracking-tighter mt-4">12M</div>
          <span className="material-icons text-5xl opacity-40 animate-spin-slow">vpn_lock</span>
        </div>
        <p className="text-sm font-bold font-mono mt-2 uppercase">Protocolo de saída ativo</p>
      </BrutalCard>
    </div>
  );

  const renderRequests = () => {
    // Pagination Logic
    const totalPages = Math.ceil(requestsList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRequests = requestsList.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      }
    };

    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-800 p-6 border-4 border-black dark:border-white shadow-brutal">
          <div className="space-y-1">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Central de Requisições</h2>
            <p className="text-xs font-mono uppercase opacity-60">Emita novos tokens de acesso ou audite tráfego em tempo real.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {/* Items Per Page Selector */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-900 border-2 border-black px-3 py-1.5 h-full">
              <span className="text-[10px] font-bold uppercase opacity-60">Exibir</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent font-black text-xs outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </div>

            <BrutalButton onClick={() => setIsCreateModalOpen(true)} className="sm:w-64">
              <span className="material-icons mr-2">add_circle</span>
              Gerar Requisição
            </BrutalButton>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-brutal overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-sm">
              <thead>
                <tr className="bg-black text-white uppercase border-b-4 border-black">
                  <th className="p-4 border-r-2 border-white/20">ID_REQ</th>
                  <th className="p-4 border-r-2 border-white/20">TIPO</th>
                  <th className="p-4 border-r-2 border-white/20">MÉTODO</th>
                  <th className="p-4 border-r-2 border-white/20 text-center">STATUS</th>
                  <th className="p-4 border-r-2 border-white/20">LATÊNCIA</th>
                  <th className="p-4">HORÁRIO</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-black dark:divide-white">
                {paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center uppercase font-bold text-gray-400">
                      Nenhuma requisição emitida até o momento.
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-primary/10 transition-colors group">
                      <td className="p-4 border-r-4 border-black dark:border-white font-bold">{req.id}</td>
                      <td className="p-4 border-r-4 border-black dark:border-white">
                        <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest">
                          {req.type}
                        </span>
                      </td>
                      <td className="p-4 border-r-4 border-black dark:border-white">
                        <span className={`px-2 py-0.5 border-2 border-black font-black ${req.method === 'GET' ? 'bg-accent-cyan' :
                          req.method === 'POST' ? 'bg-primary' :
                            req.method === 'DELETE' ? 'bg-retro-red text-white' : 'bg-accent-orange text-white'
                          }`}>
                          {req.method}
                        </span>
                      </td>
                      <td className="p-4 border-r-4 border-black dark:border-white text-center">
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${req.status < 300 ? 'bg-green-500' :
                          req.status < 500 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></span>
                        <span className="font-black">{req.status}</span>
                      </td>
                      <td className="p-4 border-r-4 border-black dark:border-white font-bold">{req.latency}</td>
                      <td className="p-4">{req.timestamp}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-zinc-800 border-t-4 border-black dark:border-white p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-[10px] font-bold uppercase opacity-60">
                Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, requestsList.length)} de {requestsList.length} requisições
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 border-2 border-black flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'bg-white hover:bg-primary shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'}`}
                >
                  <span className="material-icons text-sm">chevron_left</span>
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-8 h-8 border-2 border-black flex items-center justify-center text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-primary translate-x-[2px] translate-y-[2px] shadow-none' : 'bg-white hover:bg-gray-100 shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px]'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 border-2 border-black flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'bg-white hover:bg-primary shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'}`}
                >
                  <span className="material-icons text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Popout de Geração de Requisições */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-zinc-800 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)] p-8 max-w-2xl w-full animate-in zoom-in-95 duration-200">
              <button
                className="absolute -top-4 -right-4 bg-retro-red text-white border-4 border-black p-2 hover:scale-110 active:scale-90 transition-transform"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <span className="material-icons">close</span>
              </button>
              <h2 className="text-3xl font-black uppercase mb-8 border-b-8 border-black pb-4 text-center tracking-tighter italic">
                SELECIONE O NÚCLEO DE REQUISIÇÃO
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <BrutalButton onClick={() => generateMockRequest("COMPRA")} variant="primary" className="!text-sm py-2">
                  REQUISIÇÃO DE COMPRA
                </BrutalButton>
                <BrutalButton onClick={() => generateMockRequest("EQUIPAMENTO")} variant="secondary" className="!text-sm py-2 border-accent-cyan">
                  REQUISIÇÕES DE EQUIPAMENTO
                </BrutalButton>
                <BrutalButton onClick={() => generateMockRequest("INERTES")} className="!text-sm py-2 bg-stone-500 text-white">
                  REQUISIÇÕES DE INERTES
                </BrutalButton>
                <BrutalButton onClick={() => generateMockRequest("CONTENTORES")} variant="secondary" className="!text-sm py-2 border-accent-orange text-accent-orange">
                  REQUISIÇÕES DE CONTENTORES
                </BrutalButton>
                <BrutalButton onClick={() => generateMockRequest("UNIDADE DE VIDA")} variant="danger" className="!text-sm py-2">
                  REQUISIÇÕES DE UNIDADE DE VIDA
                </BrutalButton>
              </div>
              <p className="mt-8 text-center text-[10px] font-mono opacity-50 uppercase tracking-widest">
                AUTORIZAÇÃO DE SESSÃO EXIGIDA PARA PROCESSAMENTO EM LOTE
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReports = () => (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-zinc-800 p-8 border-4 border-black dark:border-white shadow-brutal flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 italic underline decoration-primary decoration-4">Relatório de Atendimento</h2>
          <p className="text-xs font-mono opacity-60 uppercase tracking-widest">Auditoria de prazos e cumprimento de requisições operacionais.</p>
        </div>
        <div className="flex gap-4">
          <div className="border-2 border-black p-2 bg-gray-50 dark:bg-zinc-900">
            <span className="text-[10px] font-bold block uppercase opacity-50">Taxa de Sucesso</span>
            <span className="text-xl font-black text-green-500">70% NO PRAZO</span>
          </div>
          <div className="border-2 border-black p-2 bg-gray-50 dark:bg-zinc-900">
            <span className="text-[10px] font-bold block uppercase opacity-50">Volume Total</span>
            <span className="text-xl font-black">{requestsList.length} REQS</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-brutal overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-sm">
            <thead>
              <tr className="bg-black text-white uppercase border-b-4 border-black">
                <th className="p-4 border-r-2 border-white/20">ID_REQ</th>
                <th className="p-4 border-r-2 border-white/20">CATEGORIA</th>
                <th className="p-4 border-r-2 border-white/20">DATA ESPERADA</th>
                <th className="p-4 border-r-2 border-white/20 text-center">DESEMPENHO</th>
                <th className="p-4 text-center">ESTADO ATUAL</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black dark:divide-white">
              {requestsList.map((req) => (
                <tr key={req.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="p-4 border-r-4 border-black dark:border-white font-bold">{req.id}</td>
                  <td className="p-4 border-r-4 border-black dark:border-white">
                    <span className="font-black text-xs">{req.type}</span>
                  </td>
                  <td className="p-4 border-r-4 border-black dark:border-white italic opacity-80">{req.expectedDate}</td>
                  <td className="p-4 border-r-4 border-black dark:border-white text-center">
                    {req.attendedOnTime ? (
                      <span className="px-3 py-1 bg-green-500 text-white font-black text-[10px] border-2 border-black">NO PRAZO</span>
                    ) : (
                      <span className="px-3 py-1 bg-retro-red text-white font-black text-[10px] border-2 border-black">ATRASADA</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`font-black text-xs ${req.fulfillmentStatus === 'CONCLUIDA' ? 'text-blue-500' :
                      req.fulfillmentStatus === 'CANCELADA' ? 'text-gray-400' : 'text-accent-orange'
                      }`}>
                      {req.fulfillmentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BrutalCard title="Análise Mensal" variant="dark">
          <div className="space-y-4 mt-4">
            <div className="flex justify-between items-center text-xs uppercase">
              <span>Eficiência Logística</span>
              <span className="font-black">88%</span>
            </div>
            <div className="w-full bg-white/10 h-3 border-2 border-white">
              <div className="bg-primary h-full w-[88%]"></div>
            </div>
            <p className="text-[10px] opacity-60 font-mono italic">Métrica calculada com base no tempo médio de resposta entre requisição e fechamento de ticket.</p>
          </div>
        </BrutalCard>
        <BrutalCard title="Alertas de Atraso" variant="orange">
          <div className="flex items-center gap-4 mt-4">
            <span className="material-icons text-5xl">warning</span>
            <div>
              <h4 className="font-black uppercase leading-none">4 Críticas pendentes</h4>
              <p className="text-[10px] font-mono mt-1 opacity-80">As requisições de INERTES estão sofrendo atraso por falha no NODE_04.</p>
            </div>
          </div>
        </BrutalCard>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-right-4 duration-500 space-y-8">
      <div className="bg-white dark:bg-zinc-800 border-4 border-black dark:border-white shadow-brutal p-8 md:p-12">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
            <div className="relative w-48 h-48 bg-primary border-4 border-black flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-icons text-9xl text-black">person</span>
              )}

              {/* Overlay para indicar upload */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white font-black uppercase tracking-widest border-2 border-white px-2 py-1 bg-black">
                  Alterar Foto
                </span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent bg-[length:100%_4px] pointer-events-none"></div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
            />
            <div className="absolute -bottom-2 -right-2 bg-retro-red text-white border-2 border-black px-2 py-1 text-[10px] font-bold uppercase">
              Admin_Nivel_7
            </div>
          </div>

          <div className="flex-1 space-y-6 text-center md:text-left">
            <div>
              {isEditing ? (
                <input
                  className="bg-primary text-black border-4 border-black px-4 py-2 text-4xl font-black uppercase tracking-tighter w-full focus:outline-none mb-2"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value.toUpperCase())}
                />
              ) : (
                <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-1">{fullName}</h2>
              )}
              <p className="text-sm font-mono uppercase text-gray-500 dark:text-gray-400 font-bold border-l-4 border-primary pl-3">
                Identidade Virtual Confirmada
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="bg-gray-100 dark:bg-zinc-900 border-2 border-black p-4">
                <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">E-mail de Acesso</label>
                <p className="font-bold text-sm truncate">{user}</p>
              </div>
              <div className="bg-gray-100 dark:bg-zinc-900 border-2 border-black p-4">
                <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Cargo / Função</label>
                {isEditing ? (
                  <input
                    className="bg-white dark:bg-black border-2 border-black w-full px-2 py-1 font-bold text-sm focus:outline-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                ) : (
                  <p className="font-bold text-sm">{role}</p>
                )}
              </div>
              <div className="bg-gray-100 dark:bg-zinc-900 border-2 border-black p-4">
                <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Último Login</label>
                <p className="font-bold text-sm">Hoje, às {new Date().toLocaleTimeString()}</p>
              </div>
              <div className="bg-gray-100 dark:bg-zinc-900 border-2 border-black p-4">
                <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Status Global</label>
                <p className="font-bold text-sm text-green-500 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  OPERACIONAL
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loadingProfile}
                    className="flex-1 md:flex-none px-6 py-3 bg-green-500 text-white border-2 border-black font-bold uppercase text-xs shadow-brutal-sm hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
                  >
                    {loadingProfile ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                  </button>
                  <button
                    onClick={() => { setIsEditing(false); fetchProfile(); }}
                    className="flex-1 md:flex-none px-6 py-3 bg-retro-red text-white border-2 border-black font-bold uppercase text-xs shadow-brutal-sm hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
                  >
                    CANCELAR
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 md:flex-none px-6 py-3 bg-primary border-2 border-black font-bold uppercase text-xs shadow-brutal-sm hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
                  >
                    Editar Perfil
                  </button>
                  <button
                    onClick={async () => {
                      const newPass = prompt('Digite a nova senha:');
                      if (newPass) {
                        const { error } = await supabase.auth.updateUser({ password: newPass });
                        if (error) alert('Erro ao trocar senha: ' + error.message);
                        else alert('Senha atualizada com sucesso!');
                      }
                    }}
                    className="flex-1 md:flex-none px-6 py-3 bg-white dark:bg-zinc-700 border-2 border-black font-bold uppercase text-xs shadow-brutal-sm hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
                  >
                    Trocar Senha
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BrutalCard title="Logs de Acesso" variant="grey" footer="Histórico de sessões do usuário">
          <ul className="text-xs font-mono space-y-2 mt-4 opacity-70">
            {logs.length > 0 ? logs.map(log => (
              <li key={log.id}>
                [{log.status}] {log.description} ({new Date(log.created_at).toLocaleTimeString()})
              </li>
            )) : (
              <>
                <li>[OK] LOGIN REALIZADO VIA TERMINAL_01 (192.168.1.1)</li>
                <li>[OK] ACESSO À CENTRAL DE REQUISIÇÕES</li>
                <li>[AVISO] TENTATIVA DE ACESSO NEGADA EM NÚCLEO_ADMIN</li>
                <li>[OK] LOGOFF REALIZADO (SESSÃO 9920)</li>
              </>
            )}
          </ul>
        </BrutalCard>
        <BrutalCard title="Permissões" variant="cyan" footer="Lista de acessos concedidos">
          <div className="flex flex-wrap gap-2 mt-4">
            {['VER_ESTATS', 'EXEC_REQ', 'GESTAO_USER', 'AUDIT_IA', 'ACESSO_VPN'].map(tag => (
              <span key={tag} className="px-2 py-1 bg-black text-white text-[10px] font-bold">
                {tag}
              </span>
            ))}
          </div>
        </BrutalCard>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="bg-white dark:bg-zinc-800 p-6 border-4 border-black dark:border-white shadow-brutal">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Configurações de Tabelas</h2>
        <p className="text-sm font-mono opacity-60 uppercase">Gerencie os registros principais do banco de dados operacional.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { id: 'equip', name: 'Equipamento', icon: 'construction', color: 'mustard' },
          { id: 'cont', name: 'Contentores', icon: 'inventory_2', color: 'orange' },
          { id: 'cost', name: 'Centro de Custo', icon: 'payments', color: 'cyan' },
          { id: 'sect', name: 'Setores', icon: 'domain', color: 'grey' },
          { id: 'resp', name: 'Responsáveis', icon: 'badge', color: 'dark' }
        ].map((table) => (
          <BrutalCard
            key={table.id}
            title={table.name}
            variant={table.color as any}
            footer={`NÚCLEO_${table.id.toUpperCase()}_DB`}
          >
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center gap-4 mb-2">
                <span className="material-icons text-4xl">{table.icon}</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase opacity-60">Status da Tabela</span>
                  <span className="text-sm font-black uppercase">SINCRONIZADO</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-black text-white px-3 py-2 text-[10px] font-bold uppercase hover:bg-stone-800 transition-colors border-2 border-white/20">
                  Visualizar
                </button>
                <button className="bg-white text-black px-3 py-2 text-[10px] font-bold uppercase hover:bg-gray-100 transition-colors border-2 border-black">
                  Adicionar
                </button>
              </div>
            </div>
          </BrutalCard>
        ))}

        {/* Card decorativo de status geral */}
        <div className="lg:col-span-1 bg-retro-red border-4 border-black shadow-brutal p-6 text-white flex flex-col justify-center items-center text-center">
          <span className="material-icons text-6xl mb-4 animate-pulse">storage</span>
          <h3 className="text-xl font-black uppercase mb-1">Integridade do Banco</h3>
          <p className="text-[10px] font-mono opacity-80 uppercase mb-4">Verificação de checksum automática ativa</p>
          <div className="w-full bg-black/20 h-2 border border-white/20">
            <div className="bg-white h-full w-[94%]"></div>
          </div>
          <span className="text-[10px] font-bold mt-2">ESTADO: 94% OTIMIZADO</span>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = (title: string) => (
    <div className="flex flex-col items-center justify-center min-h-[400px] border-4 border-dashed border-gray-400 dark:border-gray-600 bg-white/10 p-10 text-center">
      <span className="material-icons text-8xl mb-4 opacity-20">construction</span>
      <h2 className="text-3xl font-black uppercase mb-2">{title}</h2>
      <p className="max-w-md font-bold text-gray-500 uppercase">Esta seção está atualmente sob manutenção ou requer nível de autorização superior.</p>
    </div>
  );

  return (
    <div className="min-h-screen flex text-brutal-black dark:text-gray-100">
      <aside className={`w-64 bg-stone-900 text-gray-300 flex-shrink-0 flex flex-col border-r-4 border-brutal-black dark:border-gray-600 z-[60] transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} fixed h-full md:relative`}>
        <div className="p-6 border-b-4 border-brutal-black dark:border-gray-600 bg-stone-800">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tighter">
            <span className="material-icons">grid_view</span>
            <span>RETRO_UI</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem
            icon="dashboard"
            label="DASHBOARD"
            active={activeView === DashboardView.OVERVIEW}
            onClick={() => { onViewChange(DashboardView.OVERVIEW); setIsMobileMenuOpen(false); }}
          />
          <NavItem
            icon="swap_horiz"
            label="REQUISIÇÕES"
            active={activeView === DashboardView.REQUESTS}
            onClick={() => { onViewChange(DashboardView.REQUESTS); setIsMobileMenuOpen(false); }}
          />
          <NavItem
            icon="analytics"
            label="RELATÓRIOS"
            active={activeView === DashboardView.REPORTS}
            onClick={() => { onViewChange(DashboardView.REPORTS); setIsMobileMenuOpen(false); }}
          />
          <NavItem
            icon="settings"
            label="CONFIGURAÇÕES"
            active={activeView === DashboardView.SETTINGS}
            onClick={() => { onViewChange(DashboardView.SETTINGS); setIsMobileMenuOpen(false); }}
          />
          <NavItem
            icon="build"
            label="ADMIN"
            active={activeView === DashboardView.ADMIN}
            onClick={() => { onViewChange(DashboardView.ADMIN); setIsMobileMenuOpen(false); }}
          />
        </nav>
        <button
          onClick={onLogout}
          className="p-4 border-t-4 border-brutal-black dark:border-gray-600 bg-stone-800 text-xs text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-stone-700 transition-colors uppercase"
        >
          <span className="material-icons text-sm">logout</span>
          Encerrar Sessão
        </button>
        <div className="p-2 bg-stone-900 text-[10px] text-gray-500 text-center font-mono">
          v.1.0.4 BUILD 9921
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 flex items-center justify-between px-6 md:px-8 border-b-4 border-brutal-black dark:border-gray-600 bg-white dark:bg-gray-800 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 border-2 border-black flex items-center justify-center">
              <span className="material-icons">menu</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-brutal-black dark:text-white">
              {activeView === DashboardView.OVERVIEW ? 'Dashboard' : activeView === DashboardView.REQUESTS ? 'Requisições' : activeView === DashboardView.ADMIN ? 'Administração' : activeView === DashboardView.SETTINGS ? 'Configurações' : activeView === DashboardView.REPORTS ? 'Relatórios' : activeView}
            </h1>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden lg:flex items-center border-2 border-black px-3 py-1 bg-gray-100 dark:bg-gray-700">
              <span className="material-icons text-sm mr-2 opacity-50">search</span>
              <input className="bg-transparent border-none outline-none text-xs w-48 focus:ring-0 uppercase font-bold" placeholder="Pesquisar..." />
            </div>
            <HeaderAction icon="mail" />
            <div className="relative">
              <HeaderAction icon="notifications" />
              <span className="absolute top-1 right-1 w-3 h-3 bg-accent-orange border-2 border-white dark:border-gray-800 rounded-full"></span>
            </div>
            <button onClick={onLogout} className="p-2 hover:bg-retro-red hover:text-white border-2 border-transparent hover:border-black transition-all rounded active:translate-y-0.5" title="Sair">
              <span className="material-icons">logout</span>
            </button>
            <div className="w-10 h-10 bg-primary border-2 border-brutal-black rounded-full flex items-center justify-center overflow-hidden shadow-brutal-sm cursor-pointer hover:scale-105 transition-transform" onClick={() => onViewChange(DashboardView.ADMIN)}>
              <span className="material-icons text-black font-black">person</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 bg-background-light dark:bg-background-dark">
          {activeView !== DashboardView.REQUESTS && activeView !== DashboardView.ADMIN && activeView !== DashboardView.SETTINGS && activeView !== DashboardView.REPORTS && (
            <div className="relative group">
              <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
              <div className={`relative border-4 border-black p-5 flex items-center justify-between gap-4 transition-colors ${isRefreshing ? 'bg-gray-200' : 'bg-retro-red text-white'}`}>
                <div className="flex items-center gap-4">
                  <span className={`material-icons text-3xl ${isRefreshing ? 'animate-spin' : 'animate-pulse'}`}>terminal</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-mono opacity-70">SISTEMA ORÁCULO IA // STATUS: ATIVO</span>
                    <span className="font-black text-lg md:text-xl tracking-tighter uppercase">{aiInsight}</span>
                  </div>
                </div>
                <button
                  onClick={fetchInsight}
                  disabled={isRefreshing}
                  className="bg-black text-white px-4 py-2 text-xs font-bold uppercase hover:bg-gray-800 transition-colors border-2 border-white/20 active:scale-95"
                >
                  Auditar IA
                </button>
              </div>
            </div>
          )}

          {activeView === DashboardView.OVERVIEW && renderOverview()}
          {activeView === DashboardView.REQUESTS && renderRequests()}
          {activeView === DashboardView.ADMIN && renderAdmin()}
          {activeView === DashboardView.SETTINGS && renderSettings()}
          {activeView === DashboardView.REPORTS && renderReports()}

          <footer className="mt-12 py-8 text-center text-[10px] font-mono text-gray-500 dark:text-gray-600 uppercase border-t-2 border-gray-300 dark:border-gray-800">
            <div className="flex justify-center gap-8 mb-4">
              <span>UPTIME_SISTEMA: 99.98%</span>
              <span>LOC: SAO_PAULO_BR</span>
              <span>USUÁRIO: {user}</span>
            </div>
            © 2024 ADMIN RETRO BRUTALISTA — AUTORIZAÇÃO NÍVEL 7 APENAS
          </footer>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-black text-primary py-1 px-4 text-[10px] font-mono whitespace-nowrap overflow-hidden z-[100] border-t-2 border-primary/30">
        <div className="animate-marquee inline-block">
          STATUS DO SISTEMA: OTIMIZADO | VPN: ESTÁVEL | FIREWALL: ATIVO | CRIPTOGRAFIA: AES-256 | PRÓXIMA_SINCRONIA: 04:00:00 | AVISO: PICO DE MEMÓRIA DETECTADO NO NODE_04 | TODOS OS SISTEMAS OPERACIONAIS...
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 font-bold transition-all border-l-4 text-left ${active ? 'bg-primary text-black border-black shadow-brutal-sm translate-x-1' : 'text-gray-400 border-transparent hover:bg-stone-800 hover:text-white hover:border-gray-500'}`}
  >
    <span className="material-icons">{icon}</span>
    <span className="tracking-tighter">{label}</span>
  </button>
);

const HeaderAction: React.FC<{ icon: string }> = ({ icon }) => (
  <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-transparent hover:border-black dark:hover:border-white transition-all rounded active:translate-y-0.5">
    <span className="material-icons text-black dark:text-white">{icon}</span>
  </button>
);

export default DashboardPage;
