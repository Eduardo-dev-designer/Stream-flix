# StreamFlix — Expo + React Native + TypeScript

Versão mobile do catálogo StreamFlix, feita somente com Expo/React Native (sem Vite, HTML ou CSS web).

## Funcionalidades
- Catálogo de filmes e pesquisa por título, gênero, diretor ou ano.
- Cadastro com nome, ano de lançamento, idade indicativa, gênero e diretor.
- Exclusão com confirmação.
- Sincronização com Firebase Firestore quando configurado.
- Filmes de demonstração para explorar a interface antes de configurar o Firebase.

## Executar no Windows
1. Instale Node.js LTS.
2. Extraia o ZIP e abra a pasta `StreamFlix-Expo` no VS Code.
3. No terminal da pasta, execute `npm install`.
4. Abra `firebaseConfig.ts` e preencha as credenciais do app Web do Firebase.
5. Execute `npx expo start`.
6. Pressione `a` para abrir no emulador Android ou escaneie o QR code com o Expo Go compatível.

## Firebase
Crie uma coleção Firestore chamada `filmes`. Os documentos usam `nome`, `ano`, `idade`, `genero` e `diretor`. Configure as regras do Firestore para o seu app antes de usar em produção. Sem credenciais válidas, a tela usa filmes demonstrativos e não grava no Firebase.
