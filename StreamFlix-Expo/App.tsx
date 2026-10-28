import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView,
  ScrollView, StatusBar, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db, firebaseConfigurado } from './firebaseConfig';

type Filme = { id: string; nome: string; ano: number; idade: number; genero: string; diretor: string };
type FilmeForm = Omit<Filme, 'id'>;
type Tela = 'catalogo' | 'cadastro';
const generos = ['Ação','Aventura','Animação','Comédia','Drama','Fantasia','Ficção científica','Mistério','Romance','Suspense','Terror','Documentário','Outro'];
const vazio: FilmeForm = { nome: '', ano: new Date().getFullYear(), idade: 0, genero: 'Ação', diretor: '' };
const exemplos: Filme[] = [
 {id:'demo-1',nome:'Interestelar',ano:2014,idade:10,genero:'Ficção científica',diretor:'Christopher Nolan'},
 {id:'demo-2',nome:'Batman: O Cavaleiro das Trevas',ano:2008,idade:12,genero:'Ação',diretor:'Christopher Nolan'},
 {id:'demo-3',nome:'O Poderoso Chefão',ano:1972,idade:16,genero:'Drama',diretor:'Francis Ford Coppola'},
 {id:'demo-4',nome:'Forrest Gump',ano:1994,idade:12,genero:'Drama',diretor:'Robert Zemeckis'},
 {id:'demo-5',nome:'Gladiador',ano:2000,idade:16,genero:'Ação',diretor:'Ridley Scott'},
 {id:'demo-6',nome:'Homem-Aranha no Aranhaverso',ano:2018,idade:10,genero:'Animação',diretor:'Bob Persichetti'}
];
const posterCores = ['#38235d','#17435a','#542b32','#244c3b','#5a3c1c','#283a69'];
const simbolos = ['✦','◈','◉','✧','⬡','✺'];

export default function App() {
 const [filmes,setFilmes] = useState<Filme[]>(firebaseConfigurado ? [] : exemplos);
 const [busca,setBusca] = useState('');
 const [tela,setTela] = useState<Tela>('catalogo');
 const [form,setForm] = useState<FilmeForm>(vazio);
 const [erro,setErro] = useState('');
 const [mensagem,setMensagem] = useState('');
 const [salvando,setSalvando] = useState(false);

 useEffect(() => {
  if (!db) return;
  return onSnapshot(query(collection(db,'filmes'),orderBy('nome')), snapshot => {
   setFilmes(snapshot.docs.map(item => ({id:item.id,...(item.data() as FilmeForm)})));
  }, () => setErro('Não foi possível carregar os filmes. Confira as credenciais e as regras do Firebase.'));
 },[]);

 const filtrados = useMemo(() => filmes.filter(f => `${f.nome} ${f.genero} ${f.diretor} ${f.ano}`.toLowerCase().includes(busca.toLowerCase().trim())),[filmes,busca]);

 async function cadastrar() {
  setErro(''); setMensagem('');
  if (!form.nome.trim() || !form.diretor.trim() || !form.genero) { setErro('Preencha o nome, o gênero e o diretor.'); return; }
  if (!Number.isInteger(Number(form.ano)) || Number(form.ano)<1888 || Number(form.ano)>new Date().getFullYear()+10) { setErro('Informe um ano de lançamento válido.'); return; }
  if (!Number.isInteger(Number(form.idade)) || Number(form.idade)<0 || Number(form.idade)>18) { setErro('A classificação indicativa deve ficar entre 0 e 18 anos.'); return; }
  setSalvando(true);
  try {
   if (!db) throw new Error('Configure o Firebase em firebaseConfig.ts para salvar filmes na nuvem.');
   await addDoc(collection(db,'filmes'),{nome:form.nome.trim(),ano:Number(form.ano),idade:Number(form.idade),genero:form.genero,diretor:form.diretor.trim()});
   setForm(vazio); setTela('catalogo'); setMensagem('Filme cadastrado com sucesso!');
  } catch(e) { setErro(e instanceof Error ? e.message : 'Não foi possível cadastrar o filme.'); }
  finally { setSalvando(false); }
 }

 function excluir(filme: Filme) {
  if (filme.id.startsWith('demo-') && !db) { Alert.alert('Modo demonstração','Configure o Firebase para excluir registros salvos.'); return; }
  Alert.alert('Excluir filme?',`Deseja excluir "${filme.nome}"?`,[
   {text:'Cancelar',style:'cancel'},
   {text:'Excluir',style:'destructive',onPress:async()=>{
    try { if (!db) throw new Error('Configure o Firebase para excluir registros salvos.'); await deleteDoc(doc(db,'filmes',filme.id)); setMensagem(`"${filme.nome}" foi excluído.`); setErro(''); }
    catch(e) { setErro(e instanceof Error ? e.message : 'Não foi possível excluir o filme.'); }
   }}
  ]);
 }

 function Botao({titulo,onPress,secundario=false,desabilitado=false}:{titulo:string;onPress:()=>void;secundario?:boolean;desabilitado?:boolean}) {
  return <Pressable onPress={onPress} disabled={desabilitado} style={({pressed})=>[styles.botao,secundario&&styles.botaoSecundario,desabilitado&&styles.desabilitado,pressed&&styles.pressionado]}><Text style={[styles.botaoTexto,secundario&&styles.botaoTextoSecundario]}>{titulo}</Text></Pressable>;
 }

 return <SafeAreaView style={styles.safe}>
  <StatusBar barStyle="light-content" backgroundColor="#09090f" />
  <View style={styles.topbar}>
   <Pressable onPress={()=>{setTela('catalogo');setErro('');}} style={styles.logoLinha}><Text style={styles.logoMarca}>▶</Text><Text style={styles.logo}>Stream<Text style={styles.logoBold}>Flix</Text></Text></Pressable>
   <View style={styles.statusLinha}><View style={[styles.ponto,firebaseConfigurado&&styles.pontoOnline]}/><Text style={styles.statusTexto}>{firebaseConfigurado?'Firebase conectado':'Demonstração'}</Text></View>
  </View>
  <ScrollView contentContainerStyle={styles.pagina} keyboardShouldPersistTaps="handled">
   <View style={styles.hero}>
    <Text style={styles.eyebrow}>SEU PRÓXIMO FILME FAVORITO</Text>
    <Text style={styles.heroTitulo}>Grandes histórias.{'\n'}<Text style={styles.roxo}>Um só lugar.</Text></Text>
    <Text style={styles.heroTexto}>Explore seu catálogo, descubra clássicos e mantenha todos os seus filmes organizados.</Text>
    <Botao titulo={tela==='catalogo'?'＋  Cadastrar filme':'▶  Voltar ao catálogo'} onPress={()=>{setTela(tela==='catalogo'?'cadastro':'catalogo');setErro('');setMensagem('');}} />
    <View style={styles.heroArte}><Text style={styles.arteKicker}>STREAMFLIX ORIGINAL</Text><Text style={styles.arteTitulo}>NOITE{'\n'}INFINITA</Text><Text style={styles.arteKicker}>UMA HISTÓRIA SEM LIMITES</Text></View>
   </View>
   {!!mensagem&&<View style={styles.aviso}><Text style={styles.avisoTexto}>{mensagem}</Text><Pressable onPress={()=>setMensagem('')}><Text style={styles.fechar}>×</Text></Pressable></View>}
   {!!erro&&<View style={styles.erroBox}><Text style={styles.erroTexto}>{erro}</Text><Pressable onPress={()=>setErro('')}><Text style={styles.fechar}>×</Text></Pressable></View>}
   {tela==='catalogo' ? <>
    <View style={styles.cabecalhoSecao}><Text style={styles.eyebrow}>A SUA COLEÇÃO</Text><Text style={styles.tituloSecao}>Catálogo de filmes <Text style={styles.contagem}>{filmes.length}</Text></Text><Text style={styles.subtitulo}>Todos os seus mundos cinematográficos, reunidos.</Text></View>
    <TextInput value={busca} onChangeText={setBusca} placeholder="⌕  Buscar título, gênero, diretor..." placeholderTextColor="#8c8c9c" style={styles.busca}/>
    {filtrados.length===0 ? <View style={styles.vazio}><Text style={styles.vazioTitulo}>Nenhum filme encontrado</Text><Text style={styles.subtitulo}>Tente outra busca ou cadastre um novo título.</Text><Botao titulo="＋ Cadastrar filme" onPress={()=>setTela('cadastro')}/></View> : <View style={styles.listaFilmes}>{filtrados.map((filme,index)=><View key={filme.id} style={styles.cartaoFilme}>
      <View style={[styles.poster,{backgroundColor:posterCores[index%posterCores.length]}]}><Text style={styles.posterMarca}>STREAMFLIX</Text><Text style={styles.posterSimbolo}>{simbolos[index%simbolos.length]}</Text><Text style={styles.posterTitulo}>{filme.nome}</Text><Text style={styles.posterSub}>{filme.ano} · {filme.genero}</Text><View style={styles.classificacao}><Text style={styles.classificacaoTexto}>{filme.idade===0?'L':`${filme.idade}+`}</Text></View></View>
      <View style={styles.infoFilme}><View style={styles.infoTexto}><Text style={styles.nomeFilme}>{filme.nome}</Text><Text style={styles.diretor}>{filme.diretor}</Text><Text style={styles.meta}>{filme.ano} · {filme.genero}</Text><Text style={styles.meta}>Classificação: {filme.idade===0?'Livre':`${filme.idade} anos`}</Text></View><Pressable onPress={()=>excluir(filme)} style={styles.botaoExcluir}><Text style={styles.textoExcluir}>Excluir</Text></Pressable></View>
     </View>)}</View>}
   </> : <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined}>
    <Pressable onPress={()=>setTela('catalogo')}><Text style={styles.voltar}>← Voltar ao catálogo</Text></Pressable>
    <View style={styles.formCard}><Text style={styles.eyebrow}>ADICIONE À SUA COLEÇÃO</Text><Text style={styles.tituloSecao}>Cadastrar filme</Text><Text style={styles.subtitulo}>Preencha os detalhes do novo título.</Text>
     <Text style={styles.label}>Nome do filme</Text><TextInput value={form.nome} onChangeText={v=>setForm({...form,nome:v})} placeholder="Ex.: Interestelar" placeholderTextColor="#8c8c9c" maxLength={120} style={styles.input}/>
     <Text style={styles.label}>Ano de lançamento</Text><TextInput value={String(form.ano||'')} onChangeText={v=>setForm({...form,ano:Number(v)||0})} keyboardType="number-pad" placeholder="2014" placeholderTextColor="#8c8c9c" style={styles.input}/>
     <Text style={styles.label}>Idade indicativa</Text><View style={styles.opcoes}>{[0,10,12,14,16,18].map(n=><Pressable key={n} onPress={()=>setForm({...form,idade:n})} style={[styles.opcao,form.idade===n&&styles.opcaoSelecionada]}><Text style={[styles.opcaoTexto,form.idade===n&&styles.opcaoTextoSelecionada]}>{n===0?'Livre':`${n}+`}</Text></Pressable>)}</View>
     <Text style={styles.label}>Gênero</Text><View style={styles.opcoes}>{generos.map(g=><Pressable key={g} onPress={()=>setForm({...form,genero:g})} style={[styles.opcao,form.genero===g&&styles.opcaoSelecionada]}><Text style={[styles.opcaoTexto,form.genero===g&&styles.opcaoTextoSelecionada]}>{g}</Text></Pressable>)}</View>
     <Text style={styles.label}>Diretor</Text><TextInput value={form.diretor} onChangeText={v=>setForm({...form,diretor:v})} placeholder="Ex.: Christopher Nolan" placeholderTextColor="#8c8c9c" maxLength={100} style={styles.input}/>
     <Botao titulo={salvando?'Salvando...':'＋  Cadastrar filme'} onPress={cadastrar} desabilitado={salvando}/>
     <Text style={styles.notaForm}>{firebaseConfigurado?'Os dados serão salvos no Firebase Firestore.':'Configure o Firebase para salvar os cadastros na nuvem.'}</Text>
    </View>
   </KeyboardAvoidingView>}
   <View style={styles.rodape}><Text style={styles.logo}>Stream<Text style={styles.logoBold}>Flix</Text></Text><Text style={styles.subtitulo}>Seu catálogo. Sua próxima grande história.</Text><Text style={styles.meta}>© {new Date().getFullYear()} StreamFlix</Text></View>
  </ScrollView>
 </SafeAreaView>;
}

const styles=StyleSheet.create({
 safe:{flex:1,backgroundColor:'#09090f'},topbar:{paddingHorizontal:18,paddingVertical:14,backgroundColor:'#101019',borderBottomWidth:1,borderBottomColor:'#252535',flexDirection:'row',alignItems:'center',justifyContent:'space-between'},logoLinha:{flexDirection:'row',alignItems:'center'},logoMarca:{color:'#b59aff',fontSize:18,marginRight:7},logo:{color:'#f5f2ff',fontSize:23,fontWeight:'500'},logoBold:{color:'#b59aff',fontWeight:'900'},statusLinha:{flexDirection:'row',alignItems:'center',gap:6},ponto:{width:7,height:7,borderRadius:5,backgroundColor:'#e4aa53'},pontoOnline:{backgroundColor:'#46d69b'},statusTexto:{color:'#aaa9bc',fontSize:10},
 pagina:{paddingBottom:32},hero:{paddingHorizontal:20,paddingTop:27,paddingBottom:26,backgroundColor:'#12111d'},eyebrow:{color:'#b59aff',fontSize:10,fontWeight:'800',letterSpacing:1.4,marginBottom:9},heroTitulo:{fontSize:34,fontWeight:'900',lineHeight:39,color:'#fff'},roxo:{color:'#b59aff'},heroTexto:{color:'#b6b4c7',fontSize:14,lineHeight:22,marginTop:13,marginBottom:18},botao:{backgroundColor:'#8b5cf6',paddingVertical:13,paddingHorizontal:16,borderRadius:10,alignItems:'center',justifyContent:'center',marginTop:8},botaoTexto:{color:'#fff',fontWeight:'800',fontSize:14},botaoSecundario:{backgroundColor:'#242432',borderWidth:1,borderColor:'#38384b'},botaoTextoSecundario:{color:'#e5e3f0'},desabilitado:{opacity:.55},pressionado:{opacity:.8},heroArte:{marginTop:23,minHeight:150,borderRadius:14,borderWidth:1,borderColor:'#55417c',backgroundColor:'#211b38',padding:20,justifyContent:'center',overflow:'hidden'},arteKicker:{color:'#c6b0ff',fontSize:9,letterSpacing:2,fontWeight:'700'},arteTitulo:{color:'#fff',fontSize:34,fontWeight:'900',lineHeight:35,marginVertical:8},
 aviso:{margin:16,padding:12,borderRadius:8,backgroundColor:'#153a2d',flexDirection:'row',justifyContent:'space-between',alignItems:'center'},avisoTexto:{color:'#9af0c7',flex:1},erroBox:{margin:16,padding:12,borderRadius:8,backgroundColor:'#451e29',flexDirection:'row',justifyContent:'space-between',alignItems:'center'},erroTexto:{color:'#ffbac7',flex:1},fechar:{color:'#fff',fontSize:22,paddingHorizontal:6},cabecalhoSecao:{paddingHorizontal:20,paddingTop:27,paddingBottom:10},tituloSecao:{color:'#f6f4ff',fontSize:23,fontWeight:'900',marginBottom:6},contagem:{color:'#c4b1ff',fontSize:15},subtitulo:{color:'#a7a5b8',fontSize:12,lineHeight:18,marginTop:4},busca:{marginHorizontal:20,marginVertical:10,backgroundColor:'#171722',borderWidth:1,borderColor:'#303044',borderRadius:10,paddingHorizontal:14,paddingVertical:12,color:'#fff',fontSize:14},listaFilmes:{paddingHorizontal:16},cartaoFilme:{backgroundColor:'#14141e',borderRadius:14,borderWidth:1,borderColor:'#272738',marginVertical:8,overflow:'hidden'},poster:{height:165,padding:15,justifyContent:'center'},posterMarca:{color:'#d8ccff',fontSize:9,fontWeight:'800',letterSpacing:2},posterSimbolo:{fontSize:28,color:'#fff',marginTop:4},posterTitulo:{color:'#fff',fontSize:22,fontWeight:'900',marginTop:4},posterSub:{color:'#e0d8f2',fontSize:11,marginTop:4},classificacao:{position:'absolute',right:12,top:12,backgroundColor:'#fff',paddingHorizontal:8,paddingVertical:4,borderRadius:5},classificacaoTexto:{fontWeight:'900',fontSize:11,color:'#17131f'},infoFilme:{padding:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},infoTexto:{flex:1,paddingRight:8},nomeFilme:{color:'#fff',fontWeight:'800',fontSize:15},diretor:{color:'#b0aec0',fontSize:12,marginTop:4},meta:{color:'#9290a5',fontSize:10,marginTop:5},botaoExcluir:{borderWidth:1,borderColor:'#713443',backgroundColor:'#321a23',paddingVertical:8,paddingHorizontal:10,borderRadius:8},textoExcluir:{color:'#ffb3c0',fontSize:11,fontWeight:'800'},
 vazio:{margin:20,padding:25,alignItems:'center',backgroundColor:'#14141e',borderRadius:12},vazioTitulo:{color:'#fff',fontSize:17,fontWeight:'800'},voltar:{color:'#c4b1ff',fontSize:14,fontWeight:'700',marginHorizontal:20,marginTop:22},formCard:{marginHorizontal:16,marginTop:15,backgroundColor:'#14141e',padding:18,borderRadius:14,borderWidth:1,borderColor:'#29293b'},label:{color:'#e4e2f0',fontSize:12,fontWeight:'700',marginTop:17,marginBottom:7},input:{backgroundColor:'#0d0d15',borderWidth:1,borderColor:'#333347',borderRadius:9,padding:12,color:'#fff',fontSize:14},opcoes:{flexDirection:'row',flexWrap:'wrap',gap:8},opcao:{paddingVertical:8,paddingHorizontal:11,borderRadius:8,borderWidth:1,borderColor:'#38384c',backgroundColor:'#1b1b28',marginBottom:3},opcaoSelecionada:{backgroundColor:'#3b2860',borderColor:'#a58bff'},opcaoTexto:{color:'#c4c2d1',fontSize:12},opcaoTextoSelecionada:{color:'#fff',fontWeight:'800'},notaForm:{color:'#a7a5b8',fontSize:11,lineHeight:17,marginTop:12},rodape:{alignItems:'center',paddingTop:32,paddingBottom:12,gap:6}
});
