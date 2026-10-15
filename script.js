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
let lotes = lotesReserva;

const cards = document.querySelector('#lotCards');
function desenharLotes() {
  if (!cards) return;
  cards.innerHTML = lotes.map(l => {
    const numero = String(l.id).padStart(2, '0');
    const status = l.status && l.status !== 'disponivel'
      ? `<span class="lot-status lot-status-${esc(l.status)}">${esc(l.statusLabel)}</span>` : '';
    return `<article class="lot-card lot-card-premium" data-lot="${l.id}"><div class="lot-house-thumb"><img src="${esc(l.image)}" alt="Sugestão ${esc(l.model.valor)} para o ${esc(l.title)}" loading="lazy" decoding="async"><span class="lot-number">${numero}</span><span class="lot-expand">↗</span></div><div class="lot-card-body"><div class="lot-card-top"><h3>${esc(l.title)}</h3><span class="badge">VER DETALHES</span></div><p>${esc(l.location.valor)}</p><div class="lot-meta"><span>${esc(l.area.valor)}</span>${status}</div><button type="button" class="lot-card-link" data-lot="${l.id}">VER SUGESTÃO DE CONSTRUÇÃO →</button></div></article>`;
  }).join('');
}

if (cards) {
  cards.setAttribute('aria-busy', 'true');
  const limite = new AbortController();
  const timer = setTimeout(() => limite.abort(), 8000);
  fetch(`${SITE.api}/eco-lots`, { signal: limite.signal })
    .then(r => r.json())
    .then(dados => { if (dados.ok && Array.isArray(dados.lots)) lotes = dados.lots; })
    .catch(() => { /* painel fora do ar: segue com a lista de reserva */ })
    .finally(() => { clearTimeout(timer); cards.removeAttribute('aria-busy'); desenharLotes(); });
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
  img.alt = `Sugestão ${lote.model.valor} para o ${lote.title}`;
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
