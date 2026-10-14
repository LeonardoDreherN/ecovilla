/* =======================================================================
   ECOVILA MUNDO VERDE — CONFIGURAÇÃO DO SITE
   Edite apenas os valores abaixo. Nada mais precisa ser alterado.
   -----------------------------------------------------------------------
   whatsapp  : número com código do país e DDD, só dígitos.
               Exemplo: '5554999887766'. Vazio = botões de WhatsApp ficam ocultos.
   web3forms : chave de acesso gratuita obtida em https://web3forms.com
               (informe o e-mail contato@ecovilamundoverde.com.br e copie a chave).
               Vazia = o formulário volta a abrir o aplicativo de e-mail do visitante.
   email     : caixa de entrada que recebe os contatos.
   ======================================================================= */
const SITE = {
  whatsapp: '',
  web3forms: '',
  email: 'contato@ecovilamundoverde.com.br'
};

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

const lotes = Array.from({ length: 18 }, (_, indice) => {
  const id = indice + 1;
  const par = id % 2 === 0;
  return {
    id,
    title: `Lote ${String(id).padStart(2, '0')}`,
    image: par ? 'assets/casa-frente.jpg' : 'assets/casa-verde.jpg',
    // Campos marcados como pendentes aparecem em estilo provisorio na ficha,
    // para nao serem lidos como medida final.
    location: { valor: 'Em definição no mapa técnico', pendente: true },
    area: { valor: 'Em levantamento', pendente: true },
    dimensions: { valor: 'A confirmar', pendente: true },
    topography: { valor: 'Levantamento em andamento', pendente: true },
    model: { valor: par ? 'Casa Horizonte' : 'Casa Jardim', pendente: false },
    text: 'Um lote integrado à implantação de baiíssima densidade da Ecovila, planejado para valorizar privacidade, natureza e a relação com a paisagem.'
  };
});
const cards=document.querySelector('#lotCards');
if(cards){lotes.forEach(l=>{const el=document.createElement('article');el.className='lot-card lot-card-premium';el.dataset.lot=l.id;el.innerHTML=`<div class="lot-house-thumb"><img src="${l.image}" alt="Sugestão ${l.model.valor} para o ${l.title}" loading="lazy" decoding="async"><span class="lot-number">${String(l.id).padStart(2,'0')}</span><span class="lot-expand">↗</span></div><div class="lot-card-body"><div class="lot-card-top"><h3>${l.title}</h3><span class="badge">VER DETALHES</span></div><p>${l.location.valor}</p><div class="lot-meta"><span>${l.area.valor}</span></div><button type="button" class="lot-card-link" data-lot="${l.id}">VER SUGESTÃO DE CONSTRUÇÃO →</button></div>`;cards.appendChild(el)})}
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

  // Sem chave do Web3Forms configurada: volta ao envio pelo aplicativo de e-mail.
  if (!SITE.web3forms) {
    const assunto = `Contato pelo site — ${dados.get('interesse')}`;
    const corpo = [
      `Nome: ${dados.get('nome')}`,
      `Telefone: ${dados.get('telefone')}`,
      `E-mail: ${dados.get('email')}`,
      `Interesse: ${dados.get('interesse')}`,
      '',
      'Mensagem:',
      dados.get('mensagem') || ''
    ].join('\n');
    window.location.href = `mailto:${SITE.email}`
      + `?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    return;
  }

  dados.set('access_key', SITE.web3forms);
  formSubmit.disabled = true;
  const rotulo = formSubmit.textContent;
  formSubmit.textContent = 'ENVIANDO...';
  mostrarStatus('Enviando sua mensagem...', 'enviando');

  try {
    const resposta = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: dados
    });
    const retorno = await resposta.json();
    if (resposta.ok && retorno.success) {
      contactForm.reset();
      mostrarStatus('Mensagem enviada. Responderemos em até 1 dia útil.', 'ok');
    } else {
      throw new Error(retorno.message || 'falha no envio');
    }
  } catch {
    mostrarStatus(`Não foi possível enviar agora. Escreva para ${SITE.email}.`, 'erro');
  } finally {
    formSubmit.disabled = false;
    formSubmit.textContent = rotulo;
  }
});

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
