# Hospedar a Comodoro na Vercel

O ZIP contém o site completo: HTML, CSS, JavaScript, imagens, duas versões do vídeo, fontes e GSAP/ScrollTrigger. O efeito de desfoque e destaque de frases é uma implementação própria, sem dependência do React Bits Pro ou chave de licença.

## Pelo navegador

1. Entre na sua conta Vercel e abra https://vercel.com/drop.
2. Arraste `Comodoro-Vercel.zip` para a página.
3. Escolha sua equipe, dê um nome ao projeto e clique em Deploy.
4. Abra o endereço gerado e confira a página. O arquivo `index.html` está na raiz do pacote.

Não é necessário instalar dependências, configurar variáveis de ambiente ou compilar. Se a Vercel pedir o framework, selecione **Other**. Deixe o comando de build vazio e use **.** como pasta de saída. O `vercel.json` já define esses valores.

## Alternativa pelo terminal

Extraia o ZIP, abra um terminal dentro da pasta que contém `index.html` e execute:

```sh
npx vercel --prod
```

Siga o login e a seleção do projeto na sua própria conta.

## Editar e atualizar

- `index.html`: textos, contatos e ícones SVG.
- `styles.css`: layout, cores e responsividade.
- `app.js`: animações, scroll, vídeo e interações.
- `assets/`: arquivos necessários para o site; mantenha a estrutura de pastas.

Para republicar, envie a pasta atualizada ao projeto no painel Vercel ou use novamente o comando acima. Se preferir integração contínua, coloque os arquivos em um repositório Git e importe-o na Vercel.

Depois de escolher o domínio definitivo, configure `og:url` e use a URL absoluta desse domínio em `og:image`, no `index.html`, para a prévia de compartilhamento. O pacote usa uma imagem local e não depende do endereço privado do Sites.

O arquivo foi preparado e verificado localmente; a publicação na sua conta Vercel é feita por você. Nenhuma credencial está incluída.

Documentação oficial: https://vercel.com/docs/drop e https://vercel.com/docs/cli/deploy.
