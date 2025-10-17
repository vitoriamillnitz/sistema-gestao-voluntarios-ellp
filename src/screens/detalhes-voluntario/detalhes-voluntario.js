// A biblioteca jsPDF é carregada globalmente, então podemos acessá-la assim.
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. MOCK DATA (MAIS COMPLETO)
    // =================================================================
    const mockVoluntarios = [
        { id: 'v01', nome: 'Brenda Beatriz', ra: 'a234567', curso: 'Engenharia de Software', periodo: 8, email: 'brenda.b@alunos.utfpr.edu.br', telefone: '(44) 91111-2222', dataEntrada: '2024-02-15', status: 'Ativo' },
        { id: 'v02', nome: 'Giovana Kaori', ra: 'g765432', curso: 'Engenharia de Software', periodo: 8, email: 'giovana.k@alunos.utfpr.edu.br', telefone: '(43) 93333-4444', dataEntrada: '2024-02-20', status: 'Ativo' },
        { id: 'v03', nome: 'Vitória Millnitz', ra: 'v543210', curso: 'Ciência da Computação', periodo: 6, email: 'vitoria.m@alunos.utfpr.edu.br', telefone: '(45) 95555-6666', dataEntrada: '2024-03-01', status: 'Inativo' },
    ];
    // Reutilizando mockOficinas e mockParticipacoes que já definimos antes
    const mockOficinas = [ { id: 'o01', nome: 'Lógica com Blocos', data: '2025-09-25', cargaHoraria: 4 }, { id: 'o02', nome: 'Introdução a HTML/CSS', data: '2025-08-10', cargaHoraria: 6 }, { id: 'o03', nome: 'Robótica com Arduino', data: '2025-07-15', cargaHoraria: 8 },];
    const mockParticipacoes = [ { voluntarioId: 'v01', oficinaId: 'o01' }, { voluntarioId: 'v01', oficinaId: 'o03' }, { voluntarioId: 'v02', oficinaId: 'o01' }, { voluntarioId: 'v02', oficinaId: 'o02' }, { voluntarioId: 'v02', oficinaId: 'o03' }, ];

    // =================================================================
    // 2. LER O ID DO VOLUNTÁRIO DA URL
    // =================================================================
    const urlParams = new URLSearchParams(window.location.search);
    const voluntarioId = urlParams.get('id');

    // =================================================================
    // 3. BUSCAR E PROCESSAR OS DADOS
    // =================================================================
    const voluntario = mockVoluntarios.find(v => v.id === voluntarioId);
    let historicoDeOficinas = [];
    if (voluntario) {
        const participacoes = mockParticipacoes.filter(p => p.voluntarioId === voluntario.id);
        historicoDeOficinas = participacoes.map(p => mockOficinas.find(o => o.id === p.oficinaId));
    }
    
    // =================================================================
    // 4. SELEÇÃO DOS ELEMENTOS DO HTML
    // =================================================================
    const h1Titulo = document.querySelector('.header h1');
    // ... (selecionar todos os outros <dd> e elementos a serem preenchidos)
    const nomeEl = document.getElementById('voluntario-nome');
    const raEl = document.getElementById('voluntario-ra');
    const cursoEl = document.getElementById('voluntario-curso');
    const periodoEl = document.getElementById('voluntario-periodo');
    const emailEl = document.getElementById('voluntario-email');
    const telefoneEl = document.getElementById('voluntario-telefone');
    const dataEntradaEl = document.getElementById('voluntario-data-entrada');
    const statusEl = document.getElementById('voluntario-status');
    const totalHorasEl = document.getElementById('total-horas-acumuladas');
    const historicoTbody = document.querySelector('#historico-table tbody');
    const btnGerarRelatorio = document.getElementById('btn-gerar-relatorio');

    // =================================================================
    // 5. RENDERIZAR OS DADOS NA PÁGINA
    // =================================================================

    function renderizarPagina() {
        if (!voluntario) {
            h1Titulo.textContent = "Voluntário Não Encontrado";
            document.querySelector('.details-grid').innerHTML = '<p>O ID do voluntário não foi encontrado na base de dados.</p>';
            return;
        }

        // Preenche o cabeçalho e informações pessoais
        h1Titulo.textContent = `Detalhes de ${voluntario.nome}`;
        nomeEl.textContent = voluntario.nome;
        raEl.textContent = voluntario.ra;
        cursoEl.textContent = voluntario.curso;
        periodoEl.textContent = `${voluntario.periodo}º`;
        emailEl.textContent = voluntario.email;
        telefoneEl.textContent = voluntario.telefone || 'Não informado';
        dataEntradaEl.textContent = new Date(voluntario.dataEntrada + 'T00:00:00').toLocaleDateString('pt-BR');
        statusEl.textContent = voluntario.status;
        statusEl.className = voluntario.status === 'Ativo' ? 'status-ativo' : 'status-inativo';

        // Preenche o resumo de horas
        const totalHoras = historicoDeOficinas.reduce((soma, oficina) => soma + oficina.cargaHoraria, 0);
        totalHorasEl.textContent = `${totalHoras}h`;
        
        // Preenche a tabela de histórico
        historicoTbody.innerHTML = '';
        if (historicoDeOficinas.length > 0) {
            historicoDeOficinas.forEach(oficina => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${oficina.nome}</td>
                    <td>${new Date(oficina.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td>${oficina.cargaHoraria}h</td>
                `;
                historicoTbody.appendChild(linha);
            });
        } else {
            historicoTbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhuma participação registrada.</td></tr>';
        }
    }

    // =================================================================
    // 6. LÓGICA DOS BOTÕES DE AÇÃO
    // =================================================================
    btnGerarRelatorio.addEventListener('click', () => {
        if (!voluntario) return;

        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text('Relatório de Participação de Voluntário', 14, 22);

        doc.setFontSize(12);
        doc.text(`Nome: ${voluntario.nome}`, 14, 32);
        doc.text(`Curso: ${voluntario.curso}`, 14, 38);
        doc.text(`Data de Entrada: ${dataEntradaEl.textContent}`, 14, 44);

        doc.setFontSize(14);
        doc.text('Histórico de Oficinas:', 14, 60);

        let y = 68; // Posição vertical inicial para a lista
        historicoDeOficinas.forEach(oficina => {
            if (y > 280) { // Cria nova página se o conteúdo chegar ao fim
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(10);
            const textoOficina = `${new Date(oficina.data + 'T00:00:00').toLocaleDateString('pt-BR')} - ${oficina.nome} (${oficina.cargaHoraria}h)`;
            doc.text(textoOficina, 14, y);
            y += 7;
        });

        const totalHoras = historicoDeOficinas.reduce((soma, oficina) => soma + oficina.cargaHoraria, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total de Horas Acumuladas: ${totalHoras}h`, 14, y + 5);

        doc.save(`relatorio-${voluntario.nome.replace(/\s/g, '_')}.pdf`);
    });


    // =================================================================
    // 7. EXECUÇÃO INICIAL
    // =================================================================
    renderizarPagina();

});