# Hospedar a Comodoro na Hostinger

Este site é estático. Não exige instalação de dependências, compilação, Node.js no servidor, banco de dados ou variáveis de ambiente.

## Estrutura de publicação

Mantenha `index.html`, `styles.css`, `app.js` e a pasta completa `assets/` diretamente na pasta pública do domínio (normalmente `public_html`). Não coloque uma pasta intermediária chamada `otica-Comodoro` dentro dela.

Preserve todos os nomes e subpastas de `assets/`, incluindo `fonts/` e `vendor/`. As fontes e as bibliotecas GSAP e ScrollTrigger já estão incluídas. As duas versões do vídeo atendem desktop e celular; `hero-original.webp` é usada na prévia de compartilhamento.

## Publicar pela branch main

Na hospedagem de sites da Hostinger que oferece implantação Git no hPanel:

1. Faça um backup do conteúdo atual da pasta pública antes de substituir arquivos.
2. Configure o repositório `RodNegocios/otica-Comodoro` e selecione a branch `main`.
3. Configure o destino como a pasta pública do domínio. Se a ferramenta exigir uma pasta vazia, preserve o backup antes de prepará-la.
4. Implante os arquivos diretamente dessa branch. Não há comando de instalação ou build, nem pasta `dist` ou `build`.
5. Para atualizações automáticas, configure a implantação automática conforme as opções do seu plano. Um push para `main` só atualiza a hospedagem quando essa integração está configurada.

Se o repositório for privado, configure a autorização Git pelos meios oferecidos pela Hostinger. Não coloque tokens ou chaves no repositório.

Se seu plano não oferecer implantação Git, envie `index.html`, `styles.css`, `app.js` e a pasta completa `assets/` pelo Gerenciador de Arquivos ou SFTP, usando os arquivos da branch `main`. Este guia não é necessário na pasta pública; não envie a pasta `.git`.

## Conferir depois da publicação

- Abra o domínio com HTTPS e confira imagens, fontes e vídeo no computador e no celular.
- Teste filtros de óculos, janelas de inspiração e fotos, menu móvel e botão de reduzir movimento.
- Confira os links de WhatsApp, Instagram e mapa.
- Se aparecer uma página padrão da hospedagem, verifique qual arquivo de índice está sendo servido antes de remover a página padrão; preserve arquivos de outros sistemas existentes.
- Após atualizar, limpe o cache da hospedagem/CDN, se estiver habilitado, e recarregue o navegador.

## Desenvolvimento local

Na raiz do repositório, execute `python3 -m http.server 8000` e abra o site pelo servidor local. Não é necessário instalar pacotes. Para verificar a sintaxe do JavaScript, use `node --check app.js` se Node.js estiver disponível.

Os arquivos do site mantêm os mesmos caminhos e conteúdo da versão anterior. A configuração exclusiva da Vercel foi removida. Nenhuma regra de redirecionamento é necessária para esta página única com navegação por âncoras.
