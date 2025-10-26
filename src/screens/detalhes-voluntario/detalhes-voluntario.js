// A biblioteca jsPDF é carregada globalmente, então podemos acessá-la assim.
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. MOCK DATA (Mantido)
    // =================================================================
    const mockVoluntarios = [
        { id: 'v01', nome: 'Brenda Beatriz', ra: 'a234567', curso: 'Engenharia de Software', periodo: 8, email: 'brenda.b@alunos.utfpr.edu.br', telefone: '(44) 91111-2222', dataEntrada: '2024-02-15', status: 'Ativo' },
        { id: 'v02', nome: 'Giovana Kaori', ra: 'g765432', curso: 'Engenharia de Software', periodo: 8, email: 'giovana.k@alunos.utfpr.edu.br', telefone: '(43) 93333-4444', dataEntrada: '2024-02-20', status: 'Ativo' },
        { id: 'v03', nome: 'Vitória Millnitz', ra: 'v543210', curso: 'Ciência da Computação', periodo: 6, email: 'vitoria.m@alunos.utfpr.edu.br', telefone: '(45) 95555-6666', dataEntrada: '2024-03-01', status: 'Inativo' },
    ];
    // Formato de data AAAA-MM-DD é o padrão para inputs type="date"
    const mockOficinas = [ 
        { id: 'o01', nome: 'Lógica com Blocos', data: '2025-09-25', cargaHoraria: 4 }, 
        { id: 'o02', nome: 'Introdução a HTML/CSS', data: '2025-08-10', cargaHoraria: 6 }, 
        { id: 'o03', nome: 'Robótica com Arduino', data: '2025-07-15', cargaHoraria: 8 },
    ];
    const mockParticipacoes = [ 
        { voluntarioId: 'v01', oficinaId: 'o01' }, 
        { voluntarioId: 'v01', oficinaId: 'o03' }, 
        { voluntarioId: 'v02', oficinaId: 'o01' }, 
        { voluntarioId: 'v02', oficinaId: 'o02' }, 
        { voluntarioId: 'v02', oficinaId: 'o03' }, 
    ];

    // =================================================================
    // 2. LER O ID DO VOLUNTÁRIO DA URL
    // =================================================================
    const urlParams = new URLSearchParams(window.location.search);
    // Para fins de teste, se não houver 'id' na URL, usaremos um valor padrão ('v02')
    const voluntarioId = urlParams.get('id') || 'v02'; 

    // =================================================================
    // 3. BUSCAR E PROCESSAR OS DADOS
    // =================================================================
    const voluntario = mockVoluntarios.find(v => v.id === voluntarioId);
    let historicoDeOficinas = [];
    let totalHoras = 0; // Inicializa a variável aqui

    if (voluntario) {
        const participacoes = mockParticipacoes.filter(p => p.voluntarioId === voluntario.id);
        
        // Mapeia as oficinas e garante que as que não forem encontradas sejam filtradas
        historicoDeOficinas = participacoes
            .map(p => mockOficinas.find(o => o.id === p.oficinaId))
            .filter(oficina => oficina);
            
        // Calcula o total de horas
        totalHoras = historicoDeOficinas.reduce((soma, oficina) => soma + oficina.cargaHoraria, 0);
    }
    
    // =================================================================
    // 4. SELEÇÃO DOS ELEMENTOS DO HTML 
    // =================================================================
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
    
    // NOVO: Seleção do botão de Logout
    const logoutBtn = document.getElementById('logout-btn');


    // =================================================================
    // 5. RENDERIZAR OS DADOS NA PÁGINA
    // =================================================================
    function formatarData(dataString) {
        // Assume o formato AAAA-MM-DD
        if (!dataString) return 'Data Inválida';
        const [ano, mes, dia] = dataString.split('-').map(Number);
        // Cria a data no fuso horário local para evitar problemas de fuso
        const data = new Date(ano, mes - 1, dia); 
        return data.toLocaleDateString('pt-BR');
    }

    function renderizarPagina() {
        if (!voluntario) {
            elements.h1Titulo.textContent = "Voluntário Não Encontrado";
            elements.detailsGrid.innerHTML = '<p>O ID do voluntário não foi encontrado na base de dados.</p>';
            return;
        }

        // Preenche o cabeçalho e informações pessoais
        elements.h1Titulo.textContent = `Detalhes de ${voluntario.nome}`;
        elements.nome.textContent = voluntario.nome;
        elements.ra.textContent = voluntario.ra;
        elements.curso.textContent = voluntario.curso;
        elements.periodo.textContent = `${voluntario.periodo}º`;
        elements.email.textContent = voluntario.email;
        elements.telefone.textContent = voluntario.telefone || 'Não informado';
        // Usa a função de formatação
        elements.dataEntrada.textContent = formatarData(voluntario.dataEntrada); 
        
        elements.status.textContent = voluntario.status;
        // Usa as classes de status CSS que definimos
        elements.status.className = voluntario.status === 'Ativo' ? 'status-active' : 'status-inativo'; 

        // Preenche o resumo de horas
        elements.totalHoras.textContent = `${totalHoras}h`;
        
        // Preenche a tabela de histórico
        elements.historicoTbody.innerHTML = '';
        if (historicoDeOficinas.length > 0) {
            historicoDeOficinas.forEach(oficina => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${oficina.nome}</td>
                    <td>${formatarData(oficina.data)}</td>
                    <td>${oficina.cargaHoraria}h</td>
                `;
                elements.historicoTbody.appendChild(linha);
            });
        } else {
            elements.historicoTbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhuma participação registrada.</td></tr>';
        }
    }

    // =================================================================
    // 6. LÓGICA DOS BOTÕES DE AÇÃO
    // =================================================================

    // --- Geração de Relatório PDF (RF05) ---
    function gerarRelatorioPDF() {
        if (!voluntario) return;

        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text('Relatório de Participação de Voluntário - Volluntariado', 14, 22);

        doc.setFontSize(12);
        doc.text(`Nome: ${voluntario.nome}`, 14, 32);
        doc.text(`RA: ${voluntario.ra}`, 14, 38);
        doc.text(`Curso: ${voluntario.curso}`, 14, 44);
        doc.text(`Data de Entrada: ${elements.dataEntrada.textContent}`, 14, 50);

        doc.setFontSize(14);
        doc.text('Histórico de Oficinas:', 14, 66);

        let y = 74; // Posição vertical inicial para a lista
        historicoDeOficinas.forEach(oficina => {
            if (y > 280) { 
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(10);
            const dataFormatada = formatarData(oficina.data);
            const textoOficina = `${dataFormatada} - ${oficina.nome} (${oficina.cargaHoraria}h)`;
            doc.text(textoOficina, 14, y);
            y += 7;
        });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total de Horas Acumuladas: ${totalHoras}h`, 14, y + 5);

        doc.save(`relatorio-${voluntario.nome.replace(/\s/g, '_')}.pdf`);
    }

    // --- Geração de Termo de Voluntariado (RF06) - CORRIGIDO ---
    function gerarTermoPDF() {
        if (!voluntario) return;

        const doc = new jsPDF();
        
        // 1. TÍTULO
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('TERMO DE VOLUNTARIADO - VOLLUNTARIADO', 14, 22); // Posição Y = 22

        // 2. CORPO DO TERMO (Texto longo com informações do voluntário)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        // Use uma string simples sem quebras de linha manuais, deixando o splitTextToSize fazer isso
        const corpoDoTermo = `
        Pelo presente instrumento, a equipe do projeto VOLLUNTARIADO atesta que ${voluntario.nome}, RA ${voluntario.ra}, aluno(a) de ${voluntario.curso} na UTFPR-CP, participou de atividades de voluntariado no período compreendido entre ${elements.dataEntrada.textContent} e a data presente. O voluntário acumulou um total de ${totalHoras} horas de participação em oficinas e atividades relacionadas ao projeto. Este termo tem validade para comprovação de horas complementares e participação em projetos de extensão e integração, conforme as normas da universidade.
        `.trim().replace(/\s\s+/g, ' '); // Limpa múltiplos espaços/quebras de linha

        // Divide o texto com largura máxima de 180mm
        const splitText = doc.splitTextToSize(corpoDoTermo, 180);
        
        // Renderiza o corpo do texto na posição Y=40
        doc.text(splitText, 14, 40); 
        
        // 3. CALCULAR POSIÇÃO PARA O RESTANTE DO TEXTO
        // Pega a altura do texto dividido: (Número de linhas * altura da linha)
        const alturaDoCorpo = splitText.length * 5; // 5 é um espaçamento de linha seguro
        let yPosicao = 40 + alturaDoCorpo + 15; // Inicia após o corpo do texto + um espaço (15mm)

        // 4. DATA DE EMISSÃO
        const dataEmissao = formatarData(new Date().toISOString().split('T')[0]);
        doc.text(`Data de Emissão: ${dataEmissao}`, 14, yPosicao); 
        
        // 5. ASSINATURA (MUITO ABAIXO DA DATA)
        yPosicao += 30; // Adiciona um grande espaço para assinatura
        doc.text('______________________________', 14, yPosicao);
        doc.text('Coordenador(a) do Projeto', 14, yPosicao + 7); // 7mm abaixo da linha
        

        doc.save(`termo-${voluntario.nome.replace(/\s/g, '_')}.pdf`);
    }

    // =================================================================
    // 7. LISTENERS E EXECUÇÃO INICIAL
    // =================================================================
    
    // Adiciona os listeners aos botões
    if (elements.btnGerarRelatorio) {
        elements.btnGerarRelatorio.addEventListener('click', gerarRelatorioPDF);
    }
    
    if (elements.btnGerarTermo) {
        elements.btnGerarTermo.addEventListener('click', gerarTermoPDF);
    }
    
    // --- LÓGICA DE LOGOUT (NOVO) ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            alert('Logout simulado! Redirecionando para a página de login.');
            // Redirecionamento para a página de login
            window.location.href = '../login/login.html'; 
        });
    }

    renderizarPagina();

});