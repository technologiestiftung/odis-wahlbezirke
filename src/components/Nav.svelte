<script context="module">
  import Editor     from './views/Editor.svelte';
  import Info       from './views/Info.svelte';
  import Mds        from './views/Mds.svelte';
  import Network    from './views/Network.svelte';
  import Population from './views/Population.svelte';
  import Simulation from './views/Simulation.svelte';
  
  export const navOptions = [
      { page: 'Home',         icon: 'info',       component: Info },
      { page: 'Bevölkerung',  icon: 'population', component: Population },
      { page: 'Netzwerk',     icon: 'network',    component: Network },
      { page: 'Simulation',   icon: 'simulation', component: Simulation },
      { page: 'MDS',          icon: 'mds',        component: Mds },
      { page: 'Editor',       icon: 'editor',     component: Editor },
  ];
  </script>