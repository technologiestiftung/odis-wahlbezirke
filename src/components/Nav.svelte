<script context="module">
  import Editor     from './views/Editor.svelte';
  import Mds        from './views/Mds.svelte';
  import Network    from './views/Network.svelte';
  import Population from './views/Population.svelte';
  import Simulation from './views/Simulation.svelte';
  
  export const navOptions = [
      { page: 'Aktuelle Lage',  icon: 'population', component: Population },
      { page: 'Netzwerk',     icon: 'network',    component: Network },
      { page: 'Varianten erstellen',   icon: 'simulation', component: Simulation },
      { page: 'Vergleichen & Auswählen',          icon: 'mds',        component: Mds },
      { page: 'Editor',       icon: 'editor',     component: Editor },
  ];

  // TODO: based on env var remove network
  </script>