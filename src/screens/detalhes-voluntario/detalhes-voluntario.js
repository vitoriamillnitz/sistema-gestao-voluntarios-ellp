// ======================================================
// 1. IMPORTAÇÕES
// ======================================================
import { auth, db } from '../../firebase/config.js';
import { doc, getDoc, getDocs, collection, query, where, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";

// Acessa a biblioteca jsPDF globalmente
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // 2. VARIÁVEIS GLOBAIS (Para guardar os dados do banco)
    // ======================================================
    let voluntarioAtual = null;
    let historicoAtual = [];

    // ======================================================
    // 3. LER O ID DA URL
    // ======================================================
    const urlParams = new URLSearchParams(window.location.search);
    const voluntarioId = urlParams.get('id');

    // ======================================================
    // 4. SELEÇÃO DOS ELEMENTOS DO HTML 
    // ======================================================
    const elements = {
        h1Titulo: document.querySelector('.header h1'),
        nome: document.getElementById('voluntario-nome'),
        ra: document.getElementById('voluntario-ra'),
        curso: document.getElementById('voluntario-curso'),
        periodo: document.getElementById('voluntario-periodo'),
        email: document.getElementById('voluntario-email'),
        telefone: document.getElementById('voluntario-telefone'),
        dataEntrada: document.getElementById('voluntario-data-entrada'),
        status: document.getElementById('voluntario-status'),
        totalHoras: document.getElementById('total-horas-acumuladas'),
        historicoTbody: document.querySelector('#historico-table tbody'),
        btnGerarRelatorio: document.getElementById('btn-gerar-relatorio'),
        btnGerarTermo: document.getElementById('btn-gerar-termo'), 
        detailsGrid: document.querySelector('.details-grid') 
    };
    
    const logoutBtn = document.getElementById('logout-btn');

    // ======================================================
    // 5. BUSCAR DADOS NO FIREBASE (READ)
    // ======================================================
    const carregarDados = async () => {
        if (!voluntarioId) {
            alert("Nenhum voluntário selecionado.");
            window.location.href = '../gerenciar-voluntarios/gerenciar-voluntarios.html';
            return;
        }

        elements.h1Titulo.textContent = "Carregando dados...";

        try {
            // --- A. Buscar Dados do Voluntário ---
            const docRef = doc(db, "voluntarios", voluntarioId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                voluntarioAtual = { id: docSnap.id, ...docSnap.data() };
            } else {
                elements.h1Titulo.textContent = "Voluntário não encontrado";
                elements.detailsGrid.innerHTML = "<p>O voluntário solicitado não existe.</p>";
                return;
            }

            // --- B. Buscar Histórico de Presenças ---
            // Buscamos na coleção 'presencas' onde voluntarioId == ID atual
            const q = query(
                collection(db, "presencas"), 
                where("voluntarioId", "==", voluntarioId)
                // orderBy("dataOficina", "desc") // Requer índice no Firebase, faremos sort no JS por segurança inicial
            );
            
            const querySnapshot = await getDocs(q);
            historicoAtual = [];

            querySnapshot.forEach((doc) => {
                historicoAtual.push(doc.data());
            });

            // Ordena via JS (Data mais recente primeiro)
            historicoAtual.sort((a, b) => new Date(b.dataOficina) - new Date(a.dataOficina));

            renderizarPagina();

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            alert("Erro ao carregar detalhes do voluntário.");
        }
    };

    // ======================================================
    // 6. RENDERIZAR DADOS NA TELA
    // ======================================================
    
    // Helper para formatar data (YYYY-MM-DD -> DD/MM/YYYY)
    function formatarData(dataString) {
        if (!dataString) return '--/--/----';
        // Tenta criar data corrigindo fuso
        const data = new Date(dataString + 'T12:00:00'); 
        return data.toLocaleDateString('pt-BR');
    }

    function renderizarPagina() {
        if (!voluntarioAtual) return;

        // Preenche Informações Pessoais
        elements.h1Titulo.textContent = `Detalhes de ${voluntarioAtual.nome}`;
        elements.nome.textContent = voluntarioAtual.nome;
        elements.ra.textContent = voluntarioAtual.ra || 'N/A';
        elements.curso.textContent = voluntarioAtual.curso;
        elements.periodo.textContent = voluntarioAtual.periodo ? `${voluntarioAtual.periodo}º` : '-';
        elements.email.textContent = voluntarioAtual.email;
        elements.telefone.textContent = voluntarioAtual.telefone || 'Não informado';
        
        // Data de entrada (Data de criação do usuário não vem fácil no Firestore, 
        // usaremos data atual se não tiver campo salvo, ou implementaremos isso depois)
        elements.dataEntrada.textContent = voluntarioAtual.dataEntrada ? formatarData(voluntarioAtual.dataEntrada) : 'Data não registrada';
        
        // Status
        const status = voluntarioAtual.status || 'ativo';
        elements.status.textContent = status.charAt(0).toUpperCase() + status.slice(1); // Capitaliza
        elements.status.className = status === 'ativo' ? 'status-active' : 'status-inativo'; 

        // Total de Horas (Vem do campo calculado no voluntário)
        elements.totalHoras.textContent = `${voluntarioAtual.horasAcumuladas || 0}h`;
        
        // Tabela de Histórico
        elements.historicoTbody.innerHTML = '';
        
        if (historicoAtual.length > 0) {
            historicoAtual.forEach(presenca => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${presenca.nomeOficina}</td>
                    <td>${formatarData(presenca.dataOficina)}</td>
                    <td>${presenca.cargaHoraria}h</td>
                `;
                elements.historicoTbody.appendChild(linha);
            });
        } else {
            elements.historicoTbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhuma participação registrada ainda.</td></tr>';
        }
    }

    // ======================================================
    // 7. GERAR PDFS (Usando dados reais)
    // ======================================================

    // --- Relatório de Participação ---
    function gerarRelatorioPDF() {
        if (!voluntarioAtual) return;

        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text('Relatório de Participação - Projeto ELLP', 14, 22);

        doc.setFontSize(12);
        doc.text(`Nome: ${voluntarioAtual.nome}`, 14, 32);
        doc.text(`RA: ${voluntarioAtual.ra || '-'}`, 14, 38);
        doc.text(`Curso: ${voluntarioAtual.curso}`, 14, 44);
        
        doc.setFontSize(14);
        doc.text('Histórico de Oficinas:', 14, 60);

        let y = 70; 
        
        if (historicoAtual.length === 0) {
            doc.setFontSize(12);
            doc.text('Nenhuma oficina registrada.', 14, y);
        } else {
            historicoAtual.forEach(p => {
                if (y > 280) { doc.addPage(); y = 20; }
                
                doc.setFontSize(10);
                const data = formatarData(p.dataOficina);
                const texto = `${data} - ${p.nomeOficina} (${p.cargaHoraria}h)`;
                doc.text(texto, 14, y);
                y += 8;
            });
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total de Horas: ${voluntarioAtual.horasAcumuladas || 0}h`, 14, y + 10);

        doc.save(`relatorio_${voluntarioAtual.nome}.pdf`);
    }

    // --- Termo de Voluntariado ---
    function gerarTermoPDF() {
        if (!voluntarioAtual) return;

        const doc = new jsPDF();
        const dataHoje = new Date().toLocaleDateString('pt-BR');
        const totalHoras = voluntarioAtual.horasAcumuladas || 0;
        const dataInicio = voluntarioAtual.dataEntrada ? formatarData(voluntarioAtual.dataEntrada) : "início do vínculo";

        // Título
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('TERMO DE VOLUNTARIADO', 105, 20, null, null, 'center'); 

        // Corpo
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        const texto = `
        Declaramos para os devidos fins que ${voluntarioAtual.nome}, portador(a) do RA ${voluntarioAtual.ra || '...'}, aluno(a) do curso de ${voluntarioAtual.curso}, participou como voluntário(a) no projeto de extensão "Ensino Lúdico de Lógica e Programação" (ELLP).

        O(A) discente iniciou suas atividades em ${dataInicio} e acumulou, até a presente data, um total de ${totalHoras} horas em atividades de monitoria e organização de oficinas.

        Cornélio Procópio, ${dataHoje}.
        `.trim().replace(/\s\s+/g, ' '); // Remove espaços extras

        const linhas = doc.splitTextToSize(texto, 170);
        doc.text(linhas, 20, 50);

        // Assinatura
        doc.text('___________________________________________', 105, 150, null, null, 'center');
        doc.text('Coordenação do Projeto ELLP', 105, 157, null, null, 'center');
        doc.text('UTFPR - Cornélio Procópio', 105, 164, null, null, 'center');

        doc.save(`termo_${voluntarioAtual.nome}.pdf`);
    }

    // ======================================================
    // 8. LISTENERS E INICIALIZAÇÃO
    // ======================================================
    
    if (elements.btnGerarRelatorio) elements.btnGerarRelatorio.addEventListener('click', gerarRelatorioPDF);
    if (elements.btnGerarTermo) elements.btnGerarTermo.addEventListener('click', gerarTermoPDF);
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut(auth);
            window.location.href = '../login/login.html';
        });
    }

    // Inicia a mágica
    carregarDados();
});