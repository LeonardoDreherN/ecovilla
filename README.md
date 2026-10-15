# Ecovila Mundo Verde

Site institucional da Ecovila Mundo Verde — Fontoura Xavier, Rio Grande do Sul.

Site estático em HTML, CSS e JavaScript. Sem build, sem dependências, sem
framework: o que está no repositório é exatamente o que vai para o ar.

**Domínio de produção:** https://www.ecovilamundoverde.com.br

---

## Painel administrativo (lotes e contatos)

Os **lotes** e os **contatos** são administrados no painel da Global Invest
Brasil (`https://www.globalinvestbrasil.com/admin/`, aba **Ecovila**):

- **Lotes:** o site busca a lista em `SITE.api + '/eco-lots'`. Alterar um lote no
  painel (status, ficha, imagem, texto, visibilidade) muda o site na hora, sem
  reenviar arquivos. Se o painel não responder, `script.js` usa a lista de
  reserva embutida (`lotesReserva`), para a página nunca ficar vazia.
- **Contatos:** o formulário de `contato.html` envia para `SITE.api + '/contacts'`
  e o contato aparece em **Ecovila → Contatos** no painel.

## Configuração

Fica nas primeiras linhas de [`script.js`](script.js):

```js
const SITE = {
  whatsapp: '',   // ex.: '5554999887766' — só dígitos, com país e DDD
  api: 'https://www.globalinvestbrasil.com/api',
  email: 'contato@ecovilamundoverde.com.br'
};
```

| Campo | Para que serve |
|---|---|
| `whatsapp` | Vazio: os botões de WhatsApp ficam ocultos. Preenchido: botão flutuante, rodapé e página de contato aparecem sozinhos |
| `api` | Endereço do painel que fornece os lotes e recebe os contatos |
| `email` | Exibido ao visitante se o envio do formulário falhar |

O domínio da API precisa estar liberado no `connect-src` da Content-Security-Policy
(`vercel.json` e `.htaccess`). Do lado do painel, os domínios da Ecovila ficam em
`ECO_ORIGINS` (`app/ecovila.php` do repositório GlobalInvest).

---

## Estrutura

```
index.html                 Página inicial
a-ecovila.html             O projeto
lotes.html                 Os 18 lotes (os cartões são gerados em script.js)
estrutura.html             Lazer, esporte e implantação
galeria.html               Fotos e vídeos
contato.html               Formulário e canais de contato
politica-de-privacidade.html
termos-de-uso.html
404.html                   Página de erro

styles.css                 Folha única, organizada em camadas sucessivas
script.js                  Configuração, menu, lotes, formulário e capa
assets/                    Fotos, vídeos e ícones

vercel.json                Redirecionamento, cache, CSP e cabeçalhos
.vercelignore              O que não vai para o ar
.htaccess                  Equivalente para Apache — sem efeito na Vercel
sitemap.xml  robots.txt  manifest.webmanifest
```

### Sobre o `styles.css`

O arquivo cresce por camadas anexadas ao final, cada uma com um comentário
dizendo o que resolve. Para alterar algo, é mais seguro anexar uma camada nova
do que editar regras antigas no meio do arquivo — as últimas declarações
prevalecem sobre as anteriores de mesma especificidade.

A camada `REDESIGN 2026` define a base do sistema visual: paleta quase
monocromática e o laranja da logomarca reduzido a detalhe. A camada
`AJUSTE TIPOGRAFICO` é a mais recente e prevalece sobre ela: Playfair Display
em caixa normal, com entreletras próxima de zero.

---

## Hospedagem

O repositório está preparado para a **Vercel**. Não há comando de build: a
Vercel publica os arquivos como estão.

O `vercel.json` cuida de:

- Redirecionamento permanente do domínio sem `www` para o domínio com `www`
- Cache longo para imagens, vídeos e ícones; curto para CSS e JS; HTML sempre revalidado
- Cabeçalhos de segurança, incluindo HSTS e Content-Security-Policy
- Tipo correto para o `manifest.webmanifest`

A página `404.html` é usada automaticamente pela Vercel.

### Atenção ao instalar ferramentas externas

A Content-Security-Policy autoriza apenas o próprio site, as fontes do Google e
o envio do formulário via Web3Forms.

Google Analytics, Tag Manager, Meta Pixel, chat ou mapa incorporado serão
**bloqueados** até que o domínio correspondente seja incluído na linha
`Content-Security-Policy` do `vercel.json`. Não é defeito: é a proteção
funcionando.

### Se o site voltar para hospedagem Apache

O `.htaccess` na raiz tem a configuração equivalente e continua válido. A
Vercel o ignora; o `.vercelignore` impede que ele seja publicado.

---

## Desenvolvimento local

Não abra os arquivos com duplo clique: o protocolo `file://` quebra os caminhos
absolutos e o `manifest.webmanifest`. Suba um servidor na pasta do projeto:

```bash
python -m http.server 8777
# depois acesse http://127.0.0.1:8777
```

---

## Pendências de conteúdo

- Número de WhatsApp e chave do Web3Forms (ver acima)
- Endereços oficiais de YouTube, Facebook, Instagram e Pinterest — o bloco de
  redes sociais foi retirado do rodapé porque exibia ao visitante o aviso
  "Links oficiais em configuração"
- Medidas, áreas e topografia finais dos 18 lotes — hoje aparecem na ficha em
  estilo provisório, para não serem lidas como dado final
- Modelos e vídeos individuais de construção
