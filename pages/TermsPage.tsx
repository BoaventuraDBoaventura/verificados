
import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#101922] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 group">
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Voltar para Início</span>
        </Link>

        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <span className="material-symbols-outlined text-blue-500 text-xs">gavel</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Jurídico</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">Termos de Uso</h1>
          <p className="text-slate-400 font-medium">Última atualização: 24 de Maio de 2024</p>
        </header>

        <div className="space-y-12 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-blue-500">01.</span> Aceitação dos Termos
            </h2>
            <p>
              Ao acessar e utilizar a plataforma Verificados, você concorda em cumprir e estar vinculado a estes Termos de Uso. Esta plataforma atua como uma ponte entre talentos (modelos) e contratantes em Moçambique, focando na autenticidade e segurança das conexões.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-blue-500">02.</span> Processo de Verificação
            </h2>
            <p>
              Para obter o selo de "Verificado", o usuário deve submeter um vídeo de prova de identidade. Este processo é manual e auditado pela nossa equipe. A Verificados reserva-se o direito de rejeitar qualquer perfil que apresente inconsistências ou informações falsas.
            </p>
            <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-sm">
              <strong className="text-blue-400">Importante:</strong> A falsificação de documentos ou identidade resultará em banimento imediato e permanente da plataforma.
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-blue-500">03.</span> Pagamentos e Desbloqueios
            </h2>
            <p>
              O acesso aos dados de contato direto (WhatsApp/Telefone) das modelos é um serviço pago. Os valores são processados via M-Pesa ou eMola.
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-sm text-slate-400">
              <li>O pagamento garante o acesso vitalício ao contato daquele perfil específico.</li>
              <li>Não há reembolso após o desbloqueio do contato ser efetuado.</li>
              <li>A Verificados não cobra comissão sobre contratos fechados entre as partes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-blue-500">04.</span> Responsabilidades do Usuário
            </h2>
            <p>
              Os modelos são responsáveis pela veracidade de suas fotos e medidas. Contratantes são responsáveis por manter uma conduta profissional ao entrar em contato com os talentos. Abusos, assédio ou propostas inadequadas devem ser reportados e levarão à suspensão da conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-blue-500">05.</span> Limitação de Responsabilidade
            </h2>
            <p>
              A Verificados facilita a conexão, mas não é responsável por negociações externas, pagamentos de cachês ou o comportamento de usuários fora da plataforma. Recomendamos sempre realizar reuniões em locais públicos e informar terceiros sobre seus agendamentos profissionais.
            </p>
          </section>
        </div>

        <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">© 2024 Verificados Inc. • Maputo, Moçambique</p>
          <Link to="/privacidade" className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">Política de Privacidade</Link>
        </footer>
      </div>
    </div>
  );
};

export default TermsPage;
