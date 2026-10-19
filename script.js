/* =======================================================================
   ECOVILA MUNDO VERDE — CONFIGURAÇÃO DO SITE
   Edite apenas os valores abaixo. Nada mais precisa ser alterado.
   -----------------------------------------------------------------------
   whatsapp  : número com código do país e DDD, só dígitos.
               Exemplo: '5554999887766'. Vazio = botões de WhatsApp ficam ocultos.
   api       : painel administrativo (Global Invest Brasil) que guarda os lotes
               e recebe os contatos. Lotes: /eco-lots · Contatos: /contacts.
   email     : e-mail exibido caso o envio do formulário falhe.
   ======================================================================= */
const SITE = {
  whatsapp: '',
  api: 'https://www.globalinvestbrasil.com/api',
  email: 'contato@ecovilamundoverde.com.br'
};

// Texto vindo do painel entra no HTML dos cartões: escapa antes de inserir.
const esc = valor => String(valor ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ------------------------------------------------ WhatsApp (liga quando configurado) */
if (SITE.whatsapp) {
  const numero = SITE.whatsapp.replace(/\D/g, '');
  const texto = encodeURIComponent('Olá! Gostaria de saber mais sobre a Ecovila Mundo Verde.');
  const link = `https://wa.me/${numero}?text=${texto}`;
  const bonito = numero.length >= 12
    ? `+${numero.slice(0, 2)} (${numero.slice(2, 4)}) ${numero.slice(4, -4)}-${numero.slice(-4)}`
    : numero;
  document.querySelectorAll('[data-wa]').forEach(el => {
    el.href = link;
    el.removeAttribute('hidden');
    if (el.hasAttribute('data-wa-text')) el.textContent = bonito;
  });
  document.querySelectorAll('[data-wa-box]').forEach(el => el.removeAttribute('hidden'));
}

const header = document.querySelector('.site-header');
const ajustarHeader = () => header?.classList.toggle('scrolled',
  scrollY > 30 || document.body.classList.contains('inner-page'));
addEventListener('scroll', ajustarHeader, { passive: true });
ajustarHeader();   // estado correto ja no carregamento, sem esperar a rolagem
const toggle=document.querySelector('.nav-toggle');
const nav=document.querySelector('.nav');
toggle?.addEventListener('click',()=>{nav?.classList.toggle('open');toggle.setAttribute('aria-expanded',nav?.classList.contains('open')?'true':'false')});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

/* ---------------------------------------------- imagens de cada lote
   Sugestao de construcao para o lote, guardada no proprio site.

   O painel e a fonte principal das imagens (ver o fetch mais abaixo). Esta
   lista e a camada de baixo: vale para o lote que o painel nao respondeu
   ou cadastrou sem imagem, no lugar da referencia generica.

   recorte: true  -> render sem fundo (arquivo com transparencia). Precisa
                     aparecer inteiro sobre o fundo do cartao, sem corte.
   recorte: false -> fotografia real, preenche o quadro normalmente.

   PARA ACRESCENTAR UM LOTE: salve a imagem em assets/lotes/ e inclua a
   linha correspondente abaixo. Nada mais precisa ser alterado. */
const IMAGENS_LOTES = {
   1: { src: 'assets/lotes/lote-01.jpg', recorte: false },
   2: { src: 'assets/lotes/lote-02.jpg', recorte: false },
   3: { src: 'assets/lotes/lote-03.jpg', recorte: false },
   4: { src: 'assets/lotes/lote-04.jpg', recorte: false },
   5: { src: 'assets/lotes/lote-05.jpg', recorte: false },
   6: { src: 'assets/lotes/lote-06.jpg', recorte: false },
   7: { src: 'assets/lotes/lote-07.jpg', recorte: false },
   8: { src: 'assets/lotes/lote-08.jpg', recorte: false },
   9: { src: 'assets/lotes/lote-09.jpg', recorte: false },
  10: { src: 'assets/lotes/lote-10.jpg', recorte: false },
  11: { src: 'assets/lotes/lote-11.jpg', recorte: false },
  12: { src: 'assets/lotes/lote-12.jpg', recorte: false },
  13: { src: 'assets/lotes/lote-13.jpg', recorte: false },
  14: { src: 'assets/lotes/lote-14.jpg', recorte: false },
  15: { src: 'assets/lotes/lote-15.jpg', recorte: false },
  16: { src: 'assets/lotes/lote-16.jpg', recorte: false },
  17: { src: 'assets/lotes/lote-17.jpg', recorte: false },
  18: { src: 'assets/lotes/lote-18.jpg', recorte: false }
};

// As duas referencias genericas, usadas enquanto o lote nao tem imagem sua.
const IMAGENS_GENERICAS = ['assets/casa-frente.jpg', 'assets/casa-verde.jpg'];

/* Lotes: vêm do painel administrativo (SITE.api + '/eco-lots'). A lista abaixo é
   só a reserva, usada se o painel não responder, para a página nunca ficar vazia. */
const lotesReserva = Array.from({ length: 18 }, (_, indice) => {
  const id = indice + 1;
  const par = id % 2 === 0;
  return {
    id,
    title: `Lote ${String(id).padStart(2, '0')}`,
    status: 'disponivel',
    statusLabel: 'Disponível',
    image: par ? 'assets/casa-frente.jpg' : 'assets/casa-verde.jpg',
    // Campos marcados como pendentes aparecem em estilo provisorio na ficha,
    // para nao serem lidos como medida final.
    location: { valor: 'Em definição no mapa técnico', pendente: true },
    area: { valor: 'Em levantamento', pendente: true },
    dimensions: { valor: 'A confirmar', pendente: true },
    topography: { valor: 'Levantamento em andamento', pendente: true },
    model: { valor: par ? 'Casa Horizonte' : 'Casa Jardim', pendente: false },
    text: 'Um lote integrado à implantação de baixíssima densidade da Ecovila, planejado para valorizar privacidade, natureza e a relação com a paisagem.'
  };
});

/* Completa o lote com a imagem guardada no site, quando ele chega sem uma
   propria. O painel tem a ultima palavra: so entra aqui o lote sem imagem
   cadastrada, ou ainda com uma das duas referencias genericas.

   propria marca que a imagem mostra a casa daquele lote, e nao um modelo
   repetido; e o que muda o texto alternativo e o nome do modelo. */
function completarImagem(lote) {
  const semImagem = !lote.image || IMAGENS_GENERICAS.includes(lote.image);

  // O painel cadastrou uma imagem para este lote: ela manda.
  if (!semImagem) return { ...lote, propria: true, recorte: false };

  const foto = IMAGENS_LOTES[lote.id];
  if (foto) {
    const generico = ['Casa Jardim', 'Casa Horizonte'].includes(lote.model && lote.model.valor);
    return {
      ...lote,
      image: foto.src,
      propria: true,
      recorte: foto.recorte,
      // O nome do modelo generico nao se aplica a quem tem imagem propria:
      // a imagem e, ela mesma, a sugestao daquele lote.
      model: generico ? { valor: 'Projeto específico deste lote', pendente: false } : lote.model
    };
  }

  // Sem imagem no painel nem aqui: fica a referencia generica, para o cartao
  // nunca aparecer com a imagem quebrada.
  const par = lote.id % 2 === 0;
  return {
    ...lote,
    image: lote.image || (par ? 'assets/casa-frente.jpg' : 'assets/casa-verde.jpg'),
    propria: false,
    recorte: false
  };
}

let lotes = lotesReserva.map(completarImagem);

/* Texto alternativo: so cita o modelo quando a imagem e a referencia
   generica. Tendo imagem propria, ela mostra a casa daquele lote. */
const legenda = l => l.propria
  ? `Sugestão de construção para o ${l.title}`
  : `Sugestão ${l.model.valor} para o ${l.title}`;

const cards = document.querySelector('#lotCards');
function desenharLotes() {
  if (!cards) return;
  cards.innerHTML = lotes.map(l => {
    const numero = String(l.id).padStart(2, '0');
    const status = l.status && l.status !== 'disponivel'
      ? `<span class="lot-status lot-status-${esc(l.status)}">${esc(l.statusLabel)}</span>` : '';
    return `<article class="lot-card lot-card-premium" data-lot="${l.id}"><div class="lot-house-thumb"><img src="${esc(l.image)}" alt="${esc(legenda(l))}"${l.recorte ? ' data-recorte' : ''} loading="lazy" decoding="async"><span class="lot-number">${numero}</span><span class="lot-expand">↗</span></div><div class="lot-card-body"><div class="lot-card-top"><h3>${esc(l.title)}</h3><span class="badge">VER DETALHES</span></div><p>${esc(l.location.valor)}</p><div class="lot-meta"><span>${esc(l.area.valor)}</span>${status}</div><button type="button" class="lot-card-link" data-lot="${l.id}">VER SUGESTÃO DE CONSTRUÇÃO →</button></div></article>`;
  }).join('');
}

/* ------------------------------------------ implantacao: mapa clicavel
   Posicao de cada lote sobre assets/lotes/mapa-aereo.jpg, em porcentagem
   da largura e da altura da imagem.

   Os valores vieram dos proprios marcadores vermelhos do arquivo
   original (1600 x 738 px), medidos no centro de cada numero. Como sao
   porcentagens, valem em qualquer tamanho de tela.

   ATENCAO: se o mapa for substituido por outra versao da foto aerea,
   estas medidas precisam ser refeitas. */
const POSICOES_MAPA = {
   // 1 e 2 trocados em relacao ao que estava impresso na foto aerea:
   // o lote 1 e o de cima, perto do lago, e o 2 o de baixo.
   1: [66.53, 27.64],  2: [45.00, 83.06],  3: [47.91, 64.84],
   4: [45.44, 50.95],  5: [48.53, 29.61],  6: [57.12, 12.53],
   7: [85.31, 56.78],  8: [86.72, 47.02],  9: [86.38, 35.30],
  10: [83.69, 27.64], 11: [62.16, 73.24], 12: [68.12, 72.70],
  13: [72.19, 69.85], 14: [63.03, 84.35], 15: [69.78, 82.99],
  16: [74.75, 80.22], 17: [77.19, 77.57], 18: [79.41, 83.47]
};

/* Desenhado junto com os cartoes, e nao antes: assim o mapa mostra a lista
   que o painel devolveu. Lote retirado la nao ganha pino, e o reservado ou
   vendido chega ao mapa com o mesmo status do cartao, para os dois nunca
   se contradizerem.

   O mesmo mapa aparece na pagina inicial, que nao tem a ficha. La o pino
   vira link e leva para lotes.html ja com aquele lote aberto; onde a ficha
   existe, ele e botao e abre a ficha ali mesmo. */
/* A mesma foto aerea existe em duas versoes: a larga e a mesma girada 90
   graus no sentido anti-horario, para caber em pe na tela do celular.

   Por ser a mesma foto, as posicoes do retrato saem das da versao larga
   por rotacao, em vez de uma segunda tabela medida a mao. Assim um ajuste
   feito la em cima vale nas duas de uma vez, e elas nunca se desencontram.

   Girando no sentido anti-horario, a borda direita vira o topo: o que era
   a distancia ate a esquerda passa a ser a distancia ate o topo, e o que
   era a distancia ate o topo passa a ser a distancia ate a direita.
   Conferido contra a deteccao dos numeros na foto girada: erro de 1,7 px
   no pior caso, para numeros impressos de 6 a 14 px. */
const girarParaRetrato = ([px, py]) => [py, 100 - px];

// Precisa casar com o <source media> no HTML e com o @media do styles.css.
const RETRATO = matchMedia('(max-width: 640px)');
const posicaoDoLote = id => {
  const p = POSICOES_MAPA[id];
  if (!p) return null;
  return RETRATO.matches ? girarParaRetrato(p) : p;
};

const mapaPinos = document.querySelector('#lotMapPins');
const temFicha = Boolean(document.querySelector('#lotModal'));
function desenharMapa() {
  if (!mapaPinos) return;
  mapaPinos.innerHTML = lotes.map(l => {
    const posicao = posicaoDoLote(l.id);
    if (!posicao) return '';
    const indisponivel = Boolean(l.status && l.status !== 'disponivel');
    const rotulo = indisponivel ? `${l.title} — ${l.statusLabel}` : `Ver o ${l.title}`;
    const comum = `class="lot-pin-map"`
      + (indisponivel ? ' data-indisponivel' : '')
      + ` style="left:${posicao[0]}%;top:${posicao[1]}%"`
      + ` aria-label="${esc(rotulo)}"`;
    const miolo = `<span>${esc(l.id)}</span>`;
    return temFicha
      ? `<button type="button" data-lot="${l.id}" ${comum}>${miolo}</button>`
      : `<a href="lotes.html?lote=${l.id}" ${comum}>${miolo}</a>`;
  }).join('');
}

/* Virar o celular de lado troca a foto pela versao larga: os pinos
   precisam ser recolocados, senao ficam nas coordenadas da outra. */
RETRATO.addEventListener('change', desenharMapa);

/* Chegando por "lotes.html?lote=3" - o caminho dos pinos da pagina inicial -
   a ficha daquele lote abre sozinha, depois que a lista termina de carregar. */
const loteDaRota = Number(new URLSearchParams(location.search).get('lote'));

/* A pagina inicial tem o mapa mas nao a lista de cartoes, e mesmo assim
   precisa dos lotes: e o painel que diz quais existem e quais ja sairam. */
if (cards || mapaPinos) {
  if (cards) cards.setAttribute('aria-busy', 'true');
  const limite = new AbortController();
  const timer = setTimeout(() => limite.abort(), 8000);
  fetch(`${SITE.api}/eco-lots`, { signal: limite.signal })
    .then(r => r.json())
    .then(dados => { if (dados.ok && Array.isArray(dados.lots)) lotes = dados.lots.map(completarImagem); })
    .catch(() => { /* painel fora do ar: segue com a lista de reserva */ })
    .finally(() => {
      clearTimeout(timer);
      if (cards) cards.removeAttribute('aria-busy');
      desenharLotes();
      desenharMapa();
      if (loteDaRota > 0 && temFicha) openLot(loteDaRota);
    });
}

const modal=document.querySelector('#lotModal');
function preencher(seletor, campo) {
  const el = modal.querySelector(seletor);
  if (!el) return;
  el.textContent = campo.valor;
  el.toggleAttribute('data-pendente', campo.pendente);
}

function openLot(id) {
  const lote = lotes.find(x => x.id === Number(id));
  if (!lote || !modal) return;
  const img = modal.querySelector('#modalImage');
  img.src = lote.image;
  img.alt = legenda(lote);
  img.toggleAttribute('data-recorte', lote.recorte);
  modal.querySelector('#modalTitle').textContent = lote.title;
  modal.querySelector('#modalText').textContent = lote.text;
  preencher('#modalLocation', lote.location);
  preencher('#modalArea', lote.area);
  preencher('#modalDimensions', lote.dimensions);
  preencher('#modalTopo', lote.topography);
  preencher('#modalModel', lote.model);
  const status = modal.querySelector('#modalStatus');
  if (status) status.textContent = lote.statusLabel || 'Lote individualizado';
  // "Pedir informações" já abre o contato com o lote preenchido.
  const pedir = modal.querySelector('.modal-actions a[href^="contato.html"]');
  if (pedir) pedir.href = `contato.html?lote=${lote.id}`;
  modal.dataset.current = lote.id;
  modal.showModal();
}
document.addEventListener('click',e=>{const target=e.target.closest('[data-lot]');if(target)openLot(target.dataset.lot)});
modal?.querySelector('.modal-close')?.addEventListener('click',()=>modal.close());
modal?.addEventListener('click',e=>{if(e.target===modal)modal.close()});
document.querySelector('#copyLot')?.addEventListener('click',async()=>{const l=lotes.find(x=>x.id===Number(modal.dataset.current));try{await navigator.clipboard.writeText(`Ecovila Mundo Verde — ${l.title}`);const button=document.querySelector('#copyLot');button.textContent='Referência copiada';setTimeout(()=>button.textContent='Copiar referência',1600)}catch{}});

const contactForm = document.querySelector('#contactForm');
const formStatus = document.querySelector('#formStatus');
const formSubmit = document.querySelector('#contactSubmit');

function mostrarStatus(texto, tipo) {
  if (!formStatus) return;
  formStatus.textContent = texto;
  formStatus.className = `form-status ${tipo}`;
  formStatus.removeAttribute('hidden');
}

contactForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  const dados = new FormData(contactForm);
  const interesse = dados.get('interesse') || 'Contato pelo site';

  formSubmit.disabled = true;
  const rotulo = formSubmit.textContent;
  formSubmit.textContent = 'ENVIANDO...';
  mostrarStatus('Enviando sua mensagem...', 'enviando');

  try {
    // O contato vai para o painel administrativo, na lista de contatos da Ecovila.
    const resposta = await fetch(`${SITE.api}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        site: 'ecovila',
        name: dados.get('nome'),
        email: dados.get('email'),
        phone: dados.get('telefone'),
        subject: interesse,
        message: (dados.get('mensagem') || '').trim() || interesse,
        // Quem envia o formulário pede o retorno; o aviso de privacidade fica logo abaixo do botão.
        consent: true,
        website: dados.get('botcheck') ? 'bot' : ''
      })
    });
    const retorno = await resposta.json().catch(() => ({}));
    if (resposta.ok && retorno.ok) {
      contactForm.reset();
      mostrarStatus('Mensagem enviada. Responderemos em até 1 dia útil.', 'ok');
    } else {
      throw new Error(retorno.error || 'falha no envio');
    }
  } catch {
    mostrarStatus(`Não foi possível enviar agora. Escreva para ${SITE.email}.`, 'erro');
  } finally {
    formSubmit.disabled = false;
    formSubmit.textContent = rotulo;
  }
});

// Vindo de "Pedir informações" na ficha de um lote (contato.html?lote=3): já preenche o interesse.
const loteDaUrl = Number(new URLSearchParams(location.search).get('lote'));
if (contactForm && loteDaUrl > 0) {
  const interesse = contactForm.querySelector('[name="interesse"]');
  const mensagem = contactForm.querySelector('[name="mensagem"]');
  if (interesse) interesse.value = 'Quero informações sobre lotes';
  if (mensagem && !mensagem.value) mensagem.value = `Tenho interesse no Lote ${String(loteDaUrl).padStart(2, '0')}.`;
}

const heroSlides=[...document.querySelectorAll('.hero-slide')];
const heroDots=[...document.querySelectorAll('.hero-dots button')];
let heroIndex=0;
function showHero(index){
  heroSlides.forEach((slide,i)=>{slide.classList.toggle('active',i===index);if(slide.tagName==='VIDEO'){if(i===index)slide.play().catch(()=>{});else slide.pause()}});
  heroDots.forEach((dot,i)=>dot.classList.toggle('active',i===index));
  heroIndex=index;
}
if(heroSlides.length){
  heroDots.forEach((dot,i)=>dot.addEventListener('click',()=>showHero(i)));
  setInterval(()=>showHero((heroIndex+1)%heroSlides.length),6500);
}
