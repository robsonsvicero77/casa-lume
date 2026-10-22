import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('Falha ao renderizar a Casa Lume:', error, info); }
  render() {
    if (this.state.error) return <main style={{maxWidth:680,margin:'12vh auto',padding:24,fontFamily:'sans-serif',color:'#27372f'}}><h1>Não foi possível abrir a loja</h1><p>Ocorreu um erro ao carregar a página. Confira o terminal do Vite para ver os detalhes e tente atualizar.</p><pre style={{whiteSpace:'pre-wrap',padding:16,background:'#eee'}}>{this.state.error.message}</pre><button onClick={()=>window.location.reload()}>Tentar novamente</button></main>;
    return this.props.children;
  }
}
